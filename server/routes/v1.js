import { Router } from 'express';
import { validateBalancedLines } from '../accounting/engine.js';
import { ApiError, asyncRoute, cleanString, errors, moneyString, pagination, requireUuid, validIsoDate } from '../lib/api.js';
import { listOrganizations as defaultListOrganizations, requireOrganization as defaultRequireOrganization, requireOrganizationRole } from '../lib/organization.js';
import { getServiceClient as defaultGetServiceClient, requireUser as defaultRequireUser } from '../lib/supabase.js';
import { profilePresentation } from '../lib/profilePresentation.js';

let getServiceClient = defaultGetServiceClient;
let requireUser = defaultRequireUser;
let requireOrganization = defaultRequireOrganization;
let listOrganizations = defaultListOrganizations;

// Dependency seams are intentionally limited to tests. Production never calls
// this export; HTTP tests can exercise the real route stack without secrets.
export function configureV1TestDependencies(overrides = {}) {
  getServiceClient = overrides.getServiceClient || defaultGetServiceClient;
  requireUser = overrides.requireUser || defaultRequireUser;
  requireOrganization = overrides.requireOrganization || defaultRequireOrganization;
  listOrganizations = overrides.listOrganizations || defaultListOrganizations;
}

const router = Router();
const ACCOUNTING_ROLES = ['owner', 'admin', 'accountant'];
const MANAGER_ROLES = ['owner', 'admin'];
const uuidOrNull = (value, field) => value ? requireUuid(value, field) : null;
const normalized = (value) => cleanString(value, 200, { required: true }).toLocaleLowerCase('fr').normalize('NFKD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ');

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

function mapDatabaseError(error) {
  const message = String(error?.message || '');
  if (error?.code === 'PGRST116') return errors.notFound();
  if (/NOT_FOUND/.test(message)) return errors.notFound();
  return error;
}

router.use((req, res, next) => requireUser(req, res, next));

router.get('/context', asyncRoute(async (req, res) => {
  const organizations = await listOrganizations(req.user.id);
  res.json({ user: { id: req.user.id, email: req.user.email || '', isAnonymous: Boolean(req.user.is_anonymous) }, organizations });
}));

router.get('/organizations', asyncRoute(async (req, res) => {
  res.json({ data: await listOrganizations(req.user.id) });
}));

router.post('/organizations', asyncRoute(async (req, res) => {
  const country = cleanString(req.body?.country || 'TN', 2).toUpperCase();
  const currency = cleanString(req.body?.currency || 'TND', 3).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country) || !/^[A-Z]{3}$/.test(currency)) throw errors.validation({ locale: 'Pays ou devise invalide' });
  const data = unwrap(await getServiceClient().rpc('create_organization', {
    p_actor_id: req.user.id, p_name: cleanString(req.body?.name, 160, { required: true }),
    p_legal_name: cleanString(req.body?.legalName, 200) || null, p_tax_id: cleanString(req.body?.taxId, 40) || null,
    p_country: country, p_currency: currency,
    p_fiscal_year_start: req.body?.fiscalYearStart ? validIsoDate(req.body.fiscalYearStart, 'fiscalYearStart') : null,
  }));
  res.status(201).json(data);
}));

router.use((req, res, next) => requireOrganization(req, res, next));

router.get('/organization', asyncRoute(async (req, res) => {
  res.json({ organization: req.organization });
}));

const legacyTransaction = (row) => ({
  id: row.id,
  kind: row.kind,
  vendor: row.vendor ?? row.counterparty ?? '',
  label: row.label || row.vendor || row.counterparty || '',
  category: row.category,
  date: row.date ?? row.transaction_date,
  amountHT: Number(row.amount_ht || 0),
  tva: Number((row.tva ?? row.vat_amount) || 0),
  amountTTC: Number(row.amount_ttc || 0),
  status: row.status,
  reference: row.reference || '',
  scanned: Boolean(row.scanned),
  documentId: row.document_id || null,
  source: row.source,
});

const legacyDocument = (row) => ({
  id: row.id,
  sourceId: row.source_id,
  name: row.original_filename,
  type: row.document_type,
  date: String(row.created_at || '').slice(0, 10),
  size: row.file_size ? `${Math.max(1, Math.round(Number(row.file_size) / 1024))} Ko` : 'N/D',
  scanned: row.ocr_status === 'succeeded',
  reviewed: row.processing_status === 'confirmed',
  status: row.processing_status,
  mimeType: row.mime_type,
});

router.get('/bootstrap', asyncRoute(async (req, res) => {
  const client = getServiceClient();
  const [profile, preferences, subscription, transactions, documents, accounts, journalEntries, trialBalance, generalLedger, financialStatements, vatSummary, tasks, deadlines, chats, notifications, activities, reports, calculations, dashboard] = await Promise.all([
    client.from('profiles').select('id,email,name,regime,user_type,city,activity,phone,sector,language,timezone').eq('id', req.user.id).single(),
    client.from('user_preferences').select('preferences').eq('user_id', req.user.id).maybeSingle(),
    client.from('subscriptions').select('plan,premium_until').eq('user_id', req.user.id).maybeSingle(),
    client.from('business_transactions_v').select('*').eq('organization_id', req.organization.id).order('date', { ascending: false }).limit(200),
    client.from('documents').select('id,source_id,original_filename,mime_type,file_size,document_type,processing_status,ocr_status,created_at').eq('organization_id', req.organization.id).order('created_at', { ascending: false }).limit(200),
    client.from('accounts').select('id,account_number,label,class,category,parent_id,is_system,is_active,reporting_category').eq('organization_id', req.organization.id).order('account_number').limit(1000),
    client.from('journal_entries').select('id,entry_number,entry_date,reference,description,status,source_type,created_at').eq('organization_id', req.organization.id).order('entry_date', { ascending: false }).limit(200),
    client.from('trial_balance_v').select('*').eq('organization_id', req.organization.id).order('account_number').limit(1000),
    client.from('general_ledger_v').select('*').eq('organization_id', req.organization.id).order('entry_date', { ascending: false }).limit(1000),
    client.from('financial_statement_v').select('*').eq('organization_id', req.organization.id).order('statement').limit(500),
    client.from('vat_summary_v').select('*').eq('organization_id', req.organization.id).order('period_month', { ascending: false }).limit(240),
    client.from('user_tasks').select('*').eq('organization_id', req.organization.id).eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(200),
    client.from('tax_deadlines').select('*').eq('organization_id', req.organization.id).order('due_date').limit(200),
    client.from('chat_sessions').select('*').eq('organization_id', req.organization.id).eq('user_id', req.user.id).order('updated_at', { ascending: false }).limit(100),
    client.from('notifications').select('*').eq('organization_id', req.organization.id).eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(200),
    client.from('activity_events').select('*').eq('organization_id', req.organization.id).order('created_at', { ascending: false }).limit(200),
    client.from('ai_reports').select('*').eq('organization_id', req.organization.id).eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(100),
    client.from('calculation_history').select('*').eq('organization_id', req.organization.id).eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(100),
    client.from('dashboard_v').select('*').eq('organization_id', req.organization.id).maybeSingle(),
  ]);
  for (const result of [profile, preferences, subscription, transactions, documents, accounts, journalEntries, trialBalance, generalLedger, financialStatements, vatSummary, tasks, deadlines, chats, notifications, activities, reports, calculations, dashboard]) {
    if (result.error) throw result.error;
  }
  const prefs = preferences.data?.preferences || {};
  const safeProfile = profilePresentation(profile.data, req.user, prefs.lang || profile.data.language || 'fr');
  res.json({
    organization: req.organization,
    profile: { ...safeProfile, taxId: req.organization.tax_id || '', language: profile.data.language || 'fr' },
    settings: { ...prefs, lang: prefs.lang || profile.data.language || 'fr', plan: subscription.data?.plan || 'free', premiumUntil: subscription.data?.premium_until || null },
    transactions: (transactions.data || []).map(legacyTransaction),
    documents: (documents.data || []).map(legacyDocument),
    accounts: accounts.data || [],
    journalEntries: (journalEntries.data || []).map((x) => ({ id: x.id, number: x.entry_number, date: x.entry_date, reference: x.reference, label: x.description, status: x.status, source: x.source_type, at: x.created_at })),
    trialBalance: trialBalance.data || [],
    generalLedger: generalLedger.data || [],
    financialStatements: financialStatements.data || [],
    vatSummary: vatSummary.data || [],
    tasks: (tasks.data || []).map((x) => ({ id: x.id, title: x.title, date: x.due_date, done: x.status === 'done', status: x.status, ...(x.metadata || {}) })),
    deadlines: (deadlines.data || []).map((x) => ({ id: x.id, title: x.title, date: x.due_date, status: x.status, ...(x.metadata || {}) })),
    chats: (chats.data || []).map((x) => ({ id: x.id, title: x.title, messages: x.messages, agentId: x.agent_id, at: x.updated_at })),
    notifications: (notifications.data || []).map((x) => ({ id: x.id, title: x.title, body: x.body, type: x.type, read: Boolean(x.read_at), at: x.created_at })),
    activities: (activities.data || []).map((x) => ({ id: x.id, text: x.text, icon: x.icon, at: x.created_at })),
    aiReports: (reports.data || []).map((x) => ({ id: x.id, title: x.title, body: x.body, at: x.created_at })),
    calcHistory: (calculations.data || []).map((x) => ({ id: x.id, type: x.calculation_type, at: x.created_at, ...(x.inputs || {}), ...(x.result || {}) })),
    dashboard: dashboard.data || { organization_id: req.organization.id, invoice_count: 0, posted_entry_count: 0, income_ttc: 0, expense_ttc: 0 },
    subscription: subscription.data || { plan: 'free', premium_until: null },
  });
}));

router.patch('/profile', asyncRoute(async (req, res) => {
  const body = req.body || {};
  const changes = {};
  if (body.name !== undefined) changes.name = cleanString(body.name, 120);
  if (body.regime !== undefined) changes.regime = cleanString(body.regime, 40);
  if (body.userType !== undefined) changes.user_type = cleanString(body.userType, 40);
  if (body.city !== undefined) changes.city = cleanString(body.city, 100);
  if (body.activity !== undefined) changes.activity = cleanString(body.activity, 160);
  if (body.phone !== undefined) changes.phone = cleanString(body.phone, 40);
  if (body.sector !== undefined) changes.sector = cleanString(body.sector, 120);
  if (body.language !== undefined || body.lang !== undefined) {
    const language = cleanString(body.language ?? body.lang, 2);
    if (!['fr','ar','en'].includes(language)) throw errors.validation({ language: 'Langue invalide' });
    changes.language = language;
  }
  if (!Object.keys(changes).length) throw errors.validation({ body: 'Aucune modification' });
  const data = unwrap(await getServiceClient().from('profiles').update(changes).eq('id', req.user.id).select('id,email,name,regime,user_type,city,activity,phone,sector,language').single());
  res.json({ data });
}));

router.patch('/preferences', asyncRoute(async (req, res) => {
  const allowed = ['lang','onboarded','notifications','camera','storage','theme','currency','textSize','financeView','financeAll','tourDone','quizBest','aiQuestionsUsed','invoiceSeq'];
  const patch = {};
  for (const key of allowed) if (req.body?.[key] !== undefined) patch[key] = req.body[key];
  if (!Object.keys(patch).length) throw errors.validation({ body: 'Aucune préférence autorisée' });
  const current = unwrap(await getServiceClient().from('user_preferences').select('preferences').eq('user_id', req.user.id).maybeSingle());
  const data = unwrap(await getServiceClient().from('user_preferences').upsert({ user_id: req.user.id, preferences: { ...(current?.preferences || {}), ...patch } }, { onConflict: 'user_id' }).select().single());
  if (patch.lang) await getServiceClient().from('profiles').update({ language: patch.lang }).eq('id', req.user.id);
  res.json({ data });
}));

router.post('/transactions', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const kind = cleanString(req.body?.kind, 10, { required: true });
  if (!['income','expense'].includes(kind)) throw errors.validation({ kind: 'Type invalide' });
  const payload = {
    organization_id: req.organization.id, created_by: req.user.id, kind,
    counterparty: cleanString(req.body?.vendor, 200), label: cleanString(req.body?.label, 500), category: cleanString(req.body?.category || 'autres', 80),
    transaction_date: validIsoDate(req.body?.date, 'date'), amount_ht: moneyString(req.body?.amountHT ?? 0),
    vat_amount: moneyString(req.body?.tva ?? 0), amount_ttc: moneyString(req.body?.amountTTC, { positive: true }),
    status: ['pending','paid'].includes(req.body?.status) ? req.body.status : 'paid', reference: cleanString(req.body?.reference, 160) || null,
    source: req.body?.source === 'generated_invoice' ? 'generated_invoice' : 'manual', idempotency_key: cleanString(req.body?.idempotencyKey, 160) || null,
  };
  const data = unwrap(await getServiceClient().from('financial_transactions').insert(payload).select().single());
  res.status(201).json({ data: legacyTransaction(data) });
}));

router.patch('/transactions/:id', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const changes = {};
  if (req.body?.vendor !== undefined) changes.counterparty = cleanString(req.body.vendor, 200);
  if (req.body?.label !== undefined) changes.label = cleanString(req.body.label, 500);
  if (req.body?.category !== undefined) changes.category = cleanString(req.body.category, 80);
  if (req.body?.date !== undefined) changes.transaction_date = validIsoDate(req.body.date, 'date');
  if (req.body?.amountHT !== undefined) changes.amount_ht = moneyString(req.body.amountHT);
  if (req.body?.tva !== undefined) changes.vat_amount = moneyString(req.body.tva);
  if (req.body?.amountTTC !== undefined) changes.amount_ttc = moneyString(req.body.amountTTC, { positive: true });
  if (req.body?.status !== undefined) { if (!['pending','paid','cancelled'].includes(req.body.status)) throw errors.validation({ status: 'Statut invalide' }); changes.status = req.body.status; }
  if (!Object.keys(changes).length) throw errors.validation({ body: 'Aucune modification' });
  const data = unwrap(await getServiceClient().from('financial_transactions').update(changes).eq('id', requireUuid(req.params.id)).eq('organization_id', req.organization.id).select().maybeSingle());
  if (!data) throw errors.notFound();
  res.json({ data: legacyTransaction(data) });
}));

router.delete('/transactions/:id', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('financial_transactions').update({ status: 'cancelled' }).eq('id', requireUuid(req.params.id)).eq('organization_id', req.organization.id).select('id').maybeSingle());
  if (!data) throw errors.notFound();
  res.status(204).end();
}));

router.patch('/organization', requireOrganizationRole(...MANAGER_ROLES), asyncRoute(async (req, res) => {
  const changes = {};
  if (req.body?.name !== undefined) changes.name = cleanString(req.body.name, 160, { required: true });
  if (req.body?.legalName !== undefined) changes.legal_name = cleanString(req.body.legalName, 200) || null;
  if (req.body?.taxId !== undefined) changes.tax_id = cleanString(req.body.taxId, 40) || null;
  if (!Object.keys(changes).length) throw errors.validation({ body: 'Aucune modification' });
  const data = unwrap(await getServiceClient().from('organizations').update(changes).eq('id', req.organization.id).select().single());
  res.json({ data });
}));

router.post('/tasks', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('user_tasks').insert({
    organization_id: req.organization.id, user_id: req.user.id,
    title: cleanString(req.body?.title, 240, { required: true }),
    due_date: req.body?.date ? validIsoDate(req.body.date, 'date') : null,
    status: req.body?.done ? 'done' : 'upcoming', metadata: req.body?.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {},
  }).select().single());
  res.status(201).json({ data: { id: data.id, title: data.title, date: data.due_date, done: data.status === 'done', status: data.status, ...(data.metadata || {}) } });
}));

router.patch('/tasks/:id', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const changes = {};
  if (req.body?.title !== undefined) changes.title = cleanString(req.body.title, 240, { required: true });
  if (req.body?.date !== undefined) changes.due_date = req.body.date ? validIsoDate(req.body.date, 'date') : null;
  if (req.body?.done !== undefined) changes.status = req.body.done ? 'done' : 'upcoming';
  if (req.body?.status !== undefined) { if (!['upcoming','done','cancelled'].includes(req.body.status)) throw errors.validation({ status: 'Statut invalide' }); changes.status = req.body.status; }
  const data = unwrap(await getServiceClient().from('user_tasks').update(changes).eq('id', requireUuid(req.params.id)).eq('organization_id', req.organization.id).eq('user_id', req.user.id).select().maybeSingle());
  if (!data) throw errors.notFound();
  res.json({ data: { id: data.id, title: data.title, date: data.due_date, done: data.status === 'done', status: data.status, ...(data.metadata || {}) } });
}));

router.patch('/deadlines/:id', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const status = cleanString(req.body?.status, 20, { required: true });
  if (!['upcoming','paid','overdue','cancelled'].includes(status)) throw errors.validation({ status: 'Statut invalide' });
  const data = unwrap(await getServiceClient().from('tax_deadlines').update({ status }).eq('id', requireUuid(req.params.id)).eq('organization_id', req.organization.id).select().maybeSingle());
  if (!data) throw errors.notFound();
  res.json({ data: { id: data.id, title: data.title, date: data.due_date, status: data.status, ...(data.metadata || {}) } });
}));

router.post('/chats', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-200) : [];
  const data = unwrap(await getServiceClient().from('chat_sessions').insert({
    organization_id: req.organization.id, user_id: req.user.id,
    title: cleanString(req.body?.title || 'Conversation', 240), messages,
    agent_id: cleanString(req.body?.agentId, 80) || null,
  }).select().single());
  res.status(201).json({ data: { id: data.id, title: data.title, messages: data.messages, agentId: data.agent_id, at: data.updated_at } });
}));

router.post('/ai-reports', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('ai_reports').insert({
    organization_id: req.organization.id, user_id: req.user.id,
    title: cleanString(req.body?.title, 240, { required: true }), body: cleanString(req.body?.body, 20000, { required: true }),
  }).select().single());
  res.status(201).json({ data: { id: data.id, title: data.title, body: data.body, at: data.created_at } });
}));

router.post('/calculations', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const type = cleanString(req.body?.type, 80, { required: true });
  const payload = { ...req.body };
  delete payload.type; delete payload.at; delete payload.id;
  const data = unwrap(await getServiceClient().from('calculation_history').insert({
    organization_id: req.organization.id, user_id: req.user.id, calculation_type: type, inputs: payload, result: {},
  }).select().single());
  res.status(201).json({ data: { id: data.id, type: data.calculation_type, at: data.created_at, ...(data.inputs || {}), ...(data.result || {}) } });
}));

router.post('/activities', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('activity_events').insert({
    organization_id: req.organization.id, actor_id: req.user.id,
    text: cleanString(req.body?.text, 500, { required: true }), icon: cleanString(req.body?.icon || 'Activity', 80),
  }).select().single());
  res.status(201).json({ data: { id: data.id, text: data.text, icon: data.icon, at: data.created_at } });
}));

router.get('/organization/members', requireOrganizationRole(...MANAGER_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('organization_members').select('user_id,role,status,invited_at,joined_at,created_at,updated_at').eq('organization_id', req.organization.id).order('created_at'));
  res.json({ data: data || [] });
}));

router.put('/organization/members/:userId', requireOrganizationRole(...MANAGER_ROLES), asyncRoute(async (req, res) => {
  const role = cleanString(req.body?.role, 20, { required: true });
  const status = cleanString(req.body?.status || 'active', 20, { required: true });
  const data = unwrap(await getServiceClient().rpc('set_organization_member', {
    p_organization_id: req.organization.id, p_actor_id: req.user.id, p_user_id: requireUuid(req.params.userId, 'userId'),
    p_role: role, p_status: status, p_request_id: req.requestId,
  }));
  res.json(data);
}));

const entityConfigs = {
  'third-parties': {
    table: 'third_parties', order: 'name', roles: ACCOUNTING_ROLES,
    create(body) {
      const type = cleanString(body.type, 20, { required: true });
      if (!['supplier', 'customer', 'both'].includes(type)) throw errors.validation({ type: 'Type invalide' });
      const name = cleanString(body.name, 200, { required: true });
      return { type, name, normalized_name: normalized(name), tax_id: cleanString(body.taxId, 40) || null, email: cleanString(body.email, 254) || null, phone: cleanString(body.phone, 40) || null, address: cleanString(body.address, 500) || null, default_account_id: uuidOrNull(body.defaultAccountId, 'defaultAccountId'), status: 'active', notes: cleanString(body.notes, 2000) || null };
    },
    patch(body) {
      const data = {};
      if (body.name !== undefined) { data.name = cleanString(body.name, 200, { required: true }); data.normalized_name = normalized(data.name); }
      if (body.type !== undefined) { if (!['supplier','customer','both'].includes(body.type)) throw errors.validation({ type: 'Type invalide' }); data.type = body.type; }
      if (body.taxId !== undefined) data.tax_id = cleanString(body.taxId, 40) || null;
      if (body.email !== undefined) data.email = cleanString(body.email, 254) || null;
      if (body.phone !== undefined) data.phone = cleanString(body.phone, 40) || null;
      if (body.address !== undefined) data.address = cleanString(body.address, 500) || null;
      if (body.notes !== undefined) data.notes = cleanString(body.notes, 2000) || null;
      if (body.defaultAccountId !== undefined) data.default_account_id = uuidOrNull(body.defaultAccountId, 'defaultAccountId');
      if (body.status !== undefined) { if (!['active','inactive','archived'].includes(body.status)) throw errors.validation({ status: 'Statut invalide' }); data.status = body.status; }
      return data;
    },
  },
  accounts: {
    table: 'accounts', order: 'account_number', roles: ACCOUNTING_ROLES,
    create(body) {
      const accountNumber = cleanString(body.accountNumber, 30, { required: true });
      if (!/^[0-9A-Za-z.-]{1,30}$/.test(accountNumber)) throw errors.validation({ accountNumber: 'Numéro de compte invalide' });
      const label = cleanString(body.label, 200, { required: true });
      const accountClass = Number(body.class);
      if (!Number.isInteger(accountClass) || accountClass < 1 || accountClass > 9) throw errors.validation({ class: 'Classe invalide' });
      return { account_number: accountNumber, label, normalized_label: normalized(label), class: accountClass, category: cleanString(body.category, 80, { required: true }), parent_id: uuidOrNull(body.parentId, 'parentId'), is_system: false, is_active: body.isActive !== false, reporting_category: cleanString(body.reportingCategory, 80) || null };
    },
    patch(body) {
      const data = {};
      if (body.label !== undefined) { data.label = cleanString(body.label, 200, { required: true }); data.normalized_label = normalized(data.label); }
      if (body.category !== undefined) data.category = cleanString(body.category, 80, { required: true });
      if (body.parentId !== undefined) data.parent_id = uuidOrNull(body.parentId, 'parentId');
      if (body.isActive !== undefined) data.is_active = Boolean(body.isActive);
      if (body.reportingCategory !== undefined) data.reporting_category = cleanString(body.reportingCategory, 80) || null;
      return data;
    },
  },
  journals: {
    table: 'journals', order: 'code', roles: ACCOUNTING_ROLES,
    create(body) {
      const code = cleanString(body.code, 12, { required: true }).toUpperCase();
      if (!/^[A-Z0-9]{1,12}$/.test(code)) throw errors.validation({ code: 'Code invalide' });
      const type = cleanString(body.type, 30, { required: true });
      if (!['purchases','sales','bank','cash','miscellaneous'].includes(type)) throw errors.validation({ type: 'Type invalide' });
      return { code, name: cleanString(body.name, 120, { required: true }), type, active: body.active !== false };
    },
    patch(body) {
      const data = {};
      if (body.name !== undefined) data.name = cleanString(body.name, 120, { required: true });
      if (body.active !== undefined) data.active = Boolean(body.active);
      return data;
    },
  },
  'accounting-mappings': {
    table: 'accounting_mappings', order: 'created_at', roles: ACCOUNTING_ROLES,
    create(body, req) {
      const source = cleanString(body.source || 'human', 20);
      if (source !== 'human') throw errors.validation({ source: 'Seule une validation humaine peut activer un mapping.' });
      const sourceCondition = body.sourceCondition === undefined ? {} : body.sourceCondition;
      if (!sourceCondition || typeof sourceCondition !== 'object' || Array.isArray(sourceCondition)) throw errors.validation({ sourceCondition: 'Condition invalide' });
      const confidence = body.confidence === undefined || body.confidence === null || body.confidence === '' ? null : Number(body.confidence);
      if (confidence !== null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) throw errors.validation({ confidence: 'La confiance doit être comprise entre 0 et 1.' });
      return {
        third_party_id: uuidOrNull(body.thirdPartyId, 'thirdPartyId'),
        invoice_category: cleanString(body.invoiceCategory, 80) || null,
        source_condition: sourceCondition,
        target_account_id: requireUuid(body.targetAccountId, 'targetAccountId'),
        vat_account_id: uuidOrNull(body.vatAccountId, 'vatAccountId'),
        counterparty_account_id: requireUuid(body.counterpartyAccountId, 'counterpartyAccountId'),
        journal_id: requireUuid(body.journalId, 'journalId'),
        confidence,
        source: 'human',
        created_by: req.user.id,
        last_confirmed_at: new Date().toISOString(),
      };
    },
    patch(body) {
      const changes = {};
      if (body.invoiceCategory !== undefined) changes.invoice_category = cleanString(body.invoiceCategory, 80) || null;
      if (body.sourceCondition !== undefined) {
        if (!body.sourceCondition || typeof body.sourceCondition !== 'object' || Array.isArray(body.sourceCondition)) throw errors.validation({ sourceCondition: 'Condition invalide' });
        changes.source_condition = body.sourceCondition;
      }
      if (body.targetAccountId !== undefined) changes.target_account_id = requireUuid(body.targetAccountId, 'targetAccountId');
      if (body.vatAccountId !== undefined) changes.vat_account_id = uuidOrNull(body.vatAccountId, 'vatAccountId');
      if (body.counterpartyAccountId !== undefined) changes.counterparty_account_id = requireUuid(body.counterpartyAccountId, 'counterpartyAccountId');
      if (body.journalId !== undefined) changes.journal_id = requireUuid(body.journalId, 'journalId');
      if (body.confidence !== undefined) {
        const confidence = body.confidence === null || body.confidence === '' ? null : Number(body.confidence);
        if (confidence !== null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) throw errors.validation({ confidence: 'La confiance doit être comprise entre 0 et 1.' });
        changes.confidence = confidence;
      }
      if (Object.keys(changes).length) {
        changes.source = 'human';
        changes.last_confirmed_at = new Date().toISOString();
      }
      return changes;
    },
  },
  'bank-accounts': {
    table: 'bank_accounts', order: 'account_label', roles: MANAGER_ROLES,
    create(body) {
      const currency = cleanString(body.currency || 'TND', 3).toUpperCase();
      if (!/^[A-Z]{3}$/.test(currency)) throw errors.validation({ currency: 'Devise invalide' });
      return { bank_name: cleanString(body.bankName, 120, { required: true }), account_label: cleanString(body.accountLabel, 120, { required: true }), account_number_last4: cleanString(body.accountNumberLast4, 8) || null, currency, accounting_account_id: uuidOrNull(body.accountingAccountId, 'accountingAccountId'), active: body.active !== false };
    },
    patch(body) {
      const data = {};
      if (body.bankName !== undefined) data.bank_name = cleanString(body.bankName, 120, { required: true });
      if (body.accountLabel !== undefined) data.account_label = cleanString(body.accountLabel, 120, { required: true });
      if (body.accountNumberLast4 !== undefined) data.account_number_last4 = cleanString(body.accountNumberLast4, 8) || null;
      if (body.accountingAccountId !== undefined) data.accounting_account_id = uuidOrNull(body.accountingAccountId, 'accountingAccountId');
      if (body.active !== undefined) data.active = Boolean(body.active);
      return data;
    },
  },
  'fiscal-periods': {
    table: 'fiscal_periods', order: 'start_date', roles: MANAGER_ROLES,
    create(body) { return { start_date: validIsoDate(body.startDate, 'startDate'), end_date: validIsoDate(body.endDate, 'endDate'), status: 'open' }; },
    patch(body) {
      const data = {};
      if (body.status !== undefined) { if (!['open','soft_closed','closed'].includes(body.status)) throw errors.validation({ status: 'Statut invalide' }); data.status = body.status; }
      return data;
    },
  },
  'vat-periods': {
    table: 'vat_periods', order: 'period_start', roles: ACCOUNTING_ROLES,
    create(body) { return { period_start: validIsoDate(body.periodStart, 'periodStart'), period_end: validIsoDate(body.periodEnd, 'periodEnd'), status: 'draft', vat_collected: '0.000', vat_deductible: '0.000', adjustments: moneyString(body.adjustments ?? 0) }; },
    patch(body) {
      const data = {};
      if (body.status !== undefined) { if (!['draft','reviewed','closed'].includes(body.status)) throw errors.validation({ status: 'Statut invalide' }); data.status = body.status; }
      if (body.adjustments !== undefined) data.adjustments = moneyString(body.adjustments);
      return data;
    },
  },
};

for (const [path, config] of Object.entries(entityConfigs)) {
  router.get(`/${path}`, asyncRoute(async (req, res) => {
    const page = pagination(req.query);
    let query = getServiceClient().from(config.table).select('*', { count: 'exact' }).eq('organization_id', req.organization.id)
      .order(config.order, { ascending: true }).range(page.from, page.to);
    if (req.query.status) query = query.eq('status', cleanString(req.query.status, 30));
    const result = await query;
    if (result.error) throw result.error;
    res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
  }));
  router.post(`/${path}`, requireOrganizationRole(...config.roles), asyncRoute(async (req, res) => {
    const payload = { organization_id: req.organization.id, ...config.create(req.body || {}, req) };
    const data = unwrap(await getServiceClient().from(config.table).insert(payload).select().single());
    res.status(201).json({ data });
  }));
  router.patch(`/${path}/:id`, requireOrganizationRole(...config.roles), asyncRoute(async (req, res) => {
    const id = requireUuid(req.params.id);
    const changes = config.patch(req.body || {});
    if (!Object.keys(changes).length) throw errors.validation({ body: 'Aucune modification' });
    const data = unwrap(await getServiceClient().from(config.table).update(changes).eq('id', id).eq('organization_id', req.organization.id).select().maybeSingle());
    if (!data) throw errors.notFound();
    res.json({ data });
  }));
}

router.get('/documents', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  const result = await getServiceClient().from('documents').select('id,source_id,original_filename,mime_type,file_size,document_type,processing_status,ocr_status,created_at,updated_at', { count: 'exact' })
    .eq('organization_id', req.organization.id).order('created_at', { ascending: false }).range(page.from, page.to);
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { ...page, total: result.count || 0 } });
}));

router.get('/documents/:id', asyncRoute(async (req, res) => {
  const id = requireUuid(req.params.id);
  const document = unwrap(await getServiceClient().from('documents').select('id,source_id,original_filename,mime_type,file_size,document_type,processing_status,ocr_status,metadata,created_at,updated_at,ocr_results(id,provider,provider_model,confidence,page_count,processing_time_ms,status,error_code,created_at,completed_at)')
    .eq('id', id).eq('organization_id', req.organization.id).maybeSingle());
  if (!document) throw errors.notFound();
  res.json({ data: document });
}));

router.patch('/documents/:id', requireOrganizationRole('owner','admin','accountant','employee'), asyncRoute(async (req, res) => {
  const status = req.body?.reviewed === true ? 'confirmed' : cleanString(req.body?.status, 30, { required: true });
  if (!['uploaded','review_required','confirmed','archived'].includes(status)) throw errors.validation({ status: 'Statut invalide' });
  const data = unwrap(await getServiceClient().from('documents').update({ processing_status: status }).eq('id', requireUuid(req.params.id)).eq('organization_id', req.organization.id)
    .select('id,source_id,original_filename,mime_type,file_size,document_type,processing_status,ocr_status,created_at').maybeSingle());
  if (!data) throw errors.notFound();
  res.json({ data: legacyDocument(data) });
}));

router.get('/invoices', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  let query = getServiceClient().from('invoices').select('id,document_record_id,third_party_id,invoice_number,invoice_date,due_date,document_type,kind,supplier,category,currency,amount_ht,vat_amount,amount_ttc,stamp_duty,discount,withholding_tax,status,accounting_status,accounting_mapping_id,journal_entry_id,accounting_validated_by,accounting_validated_at,validated_by,validated_at,created_at,invoice_tax_lines(tax_type,tax_rate,taxable_base,tax_amount),third_parties(type,name,tax_id)', { count: 'exact' })
    .eq('organization_id', req.organization.id).order('invoice_date', { ascending: false }).range(page.from, page.to);
  if (req.query.status) query = query.eq('status', cleanString(req.query.status, 30));
  if (req.query.from) query = query.gte('invoice_date', validIsoDate(req.query.from, 'from'));
  if (req.query.to) query = query.lte('invoice_date', validIsoDate(req.query.to, 'to'));
  const result = await query;
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.get('/invoices/:id', asyncRoute(async (req, res) => {
  const id = requireUuid(req.params.id);
  const data = unwrap(await getServiceClient().from('invoices').select('*,invoice_tax_lines(*),third_parties(id,type,name,tax_id),documents(id,original_filename,mime_type,file_size,processing_status,ocr_status)')
    .eq('id', id).eq('organization_id', req.organization.id).maybeSingle());
  if (!data) throw errors.notFound();
  delete data.raw_ocr;
  res.json({ data });
}));

router.post('/invoices/duplicate-check', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const fingerprint = cleanString(req.body?.fingerprint, 500, { required: true });
  const data = unwrap(await getServiceClient().from('invoices').select('id,invoice_number,invoice_date,status').eq('organization_id', req.organization.id).eq('fingerprint', fingerprint).maybeSingle());
  res.json({ duplicate: Boolean(data), invoice: data || null });
}));

router.patch('/invoices/:id', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const allowed = {};
  for (const [input, output, kind] of [
    ['supplier','supplier','text'],['supplierTaxId','supplierTaxId','text'],['invoiceNumber','invoiceNumber','text'],
    ['invoiceDate','invoiceDate','date'],['dueDate','dueDate','nullableDate'],['amountHt','amountHt','nullableMoney'],
    ['vatAmount','vatAmount','nullableMoney'],['amountTtc','amountTtc','money'],['discount','discount','money'],
    ['stampDuty','stampDuty','money'],['withholdingTax','withholdingTax','money'],['category','category','text'],
  ]) {
    if (req.body?.[input] === undefined) continue;
    if (kind === 'date') allowed[output] = validIsoDate(req.body[input], input);
    else if (kind === 'nullableDate') allowed[output] = req.body[input] ? validIsoDate(req.body[input], input) : '';
    else if (kind === 'money') allowed[output] = moneyString(req.body[input]);
    else if (kind === 'nullableMoney') allowed[output] = req.body[input] === null || req.body[input] === '' ? '' : moneyString(req.body[input]);
    else allowed[output] = cleanString(req.body[input], input === 'category' ? 80 : 200, { required: input === 'supplier' || input === 'invoiceNumber' });
  }
  if (!Object.keys(allowed).length) throw errors.validation({ body: 'Aucune modification autorisée' });
  const data = unwrap(await getServiceClient().rpc('update_invoice_review', { p_organization_id: req.organization.id, p_invoice_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_changes: allowed, p_request_id: req.requestId }));
  res.json(data);
}));

router.post('/invoices/:id/accounting-validation', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const mappingId = requireUuid(req.body?.mappingId, 'mappingId');
  const data = unwrap(await getServiceClient().rpc('validate_invoice_accounting', {
    p_organization_id: req.organization.id,
    p_invoice_id: requireUuid(req.params.id),
    p_mapping_id: mappingId,
    p_actor_id: req.user.id,
    p_request_id: req.requestId,
  }));
  res.status(data?.idempotent ? 200 : 201).json(data);
}));

router.get('/journal-entries', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  let query = getServiceClient().from('journal_entries').select('id,journal_id,entry_number,entry_date,reference,description,source_type,source_id,status,created_by,reviewed_by,posted_by,posted_at,reversed_entry_id,created_at,updated_at', { count: 'exact' })
    .eq('organization_id', req.organization.id).order('entry_date', { ascending: false }).range(page.from, page.to);
  if (req.query.status) query = query.eq('status', cleanString(req.query.status, 20));
  const result = await query;
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.get('/journal-entries/:id', asyncRoute(async (req, res) => {
  const id = requireUuid(req.params.id);
  const data = unwrap(await getServiceClient().from('journal_entries').select('*,journal_lines(*,accounts(account_number,label),third_parties(name,tax_id))').eq('id', id).eq('organization_id', req.organization.id).maybeSingle());
  if (!data) throw errors.notFound();
  res.json({ data });
}));

router.post('/journal-entries', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const balance = validateBalancedLines(req.body?.lines);
  if (!balance.ok) throw new ApiError('UNBALANCED_ENTRY', 422, 'Le total débit doit être égal au total crédit.', { reason: balance.reason });
  const entry = {
    journalId: requireUuid(req.body?.journalId, 'journalId'), entryNumber: cleanString(req.body?.entryNumber, 80, { required: true }),
    entryDate: validIsoDate(req.body?.entryDate, 'entryDate'), reference: cleanString(req.body?.reference, 160),
    description: cleanString(req.body?.description, 500, { required: true }), sourceType: cleanString(req.body?.sourceType, 80),
    sourceId: req.body?.sourceId ? requireUuid(req.body.sourceId, 'sourceId') : null,
  };
  const lines = req.body.lines.map((line) => ({ accountId: requireUuid(line.accountId, 'accountId'), thirdPartyId: uuidOrNull(line.thirdPartyId, 'thirdPartyId'), description: cleanString(line.description, 500), debit: moneyString(line.debit ?? 0), credit: moneyString(line.credit ?? 0), taxLineId: uuidOrNull(line.taxLineId, 'taxLineId') }));
  const data = unwrap(await getServiceClient().rpc('create_journal_entry', { p_organization_id: req.organization.id, p_actor_id: req.user.id, p_entry: entry, p_lines: lines, p_request_id: req.requestId }));
  res.status(data?.idempotent ? 200 : 201).json(data);
}));

router.post('/journal-entries/:id/review', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().rpc('review_journal_entry', { p_organization_id: req.organization.id, p_entry_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_request_id: req.requestId }));
  res.json(data);
}));

router.post('/journal-entries/:id/post', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().rpc('post_journal_entry', { p_organization_id: req.organization.id, p_entry_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_request_id: req.requestId }));
  res.json(data);
}));

router.post('/journal-entries/:id/reverse', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().rpc('reverse_journal_entry', { p_organization_id: req.organization.id, p_entry_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_entry_number: cleanString(req.body?.entryNumber, 80, { required: true }), p_entry_date: validIsoDate(req.body?.entryDate, 'entryDate'), p_request_id: req.requestId }));
  res.json(data);
}));

router.get('/payments', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  const result = await getServiceClient().from('payments').select('*,payment_allocations(*)', { count: 'exact' }).eq('organization_id', req.organization.id).order('payment_date', { ascending: false }).range(page.from, page.to);
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.post('/payments', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const payment = { thirdPartyId: uuidOrNull(req.body?.thirdPartyId, 'thirdPartyId'), invoiceId: uuidOrNull(req.body?.invoiceId, 'invoiceId'), amount: moneyString(req.body?.amount, { positive: true }), currency: cleanString(req.body?.currency || 'TND', 3).toUpperCase(), paymentDate: validIsoDate(req.body?.paymentDate, 'paymentDate'), paymentMethod: cleanString(req.body?.paymentMethod, 30, { required: true }), bankAccountId: uuidOrNull(req.body?.bankAccountId, 'bankAccountId'), reference: cleanString(req.body?.reference, 160), journalEntryId: uuidOrNull(req.body?.journalEntryId, 'journalEntryId'), idempotencyKey: cleanString(req.body?.idempotencyKey, 160) || null };
  const allocations = Array.isArray(req.body?.allocations) ? req.body.allocations.slice(0, 500).map((item) => ({ invoiceId: requireUuid(item.invoiceId, 'invoiceId'), allocatedAmount: moneyString(item.allocatedAmount, { positive: true }) })) : [];
  const data = unwrap(await getServiceClient().rpc('create_payment', { p_organization_id: req.organization.id, p_actor_id: req.user.id, p_payment: payment, p_allocations: allocations, p_request_id: req.requestId }));
  res.status(data?.idempotent ? 200 : 201).json(data);
}));

router.post('/payments/:id/post', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().rpc('post_payment', { p_organization_id: req.organization.id, p_payment_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_request_id: req.requestId }));
  res.json(data);
}));

router.post('/payments/:id/reverse', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const entryNumber = cleanString(req.body?.entryNumber, 80) || null;
  const entryDate = req.body?.entryDate ? validIsoDate(req.body.entryDate, 'entryDate') : null;
  const data = unwrap(await getServiceClient().rpc('reverse_payment', { p_organization_id: req.organization.id, p_payment_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_reversal_entry_number: entryNumber, p_reversal_date: entryDate, p_request_id: req.requestId }));
  res.json(data);
}));

router.get('/bank-transactions', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  let query = getServiceClient().from('bank_transactions').select('*', { count: 'exact' }).eq('organization_id', req.organization.id).order('transaction_date', { ascending: false }).range(page.from, page.to);
  if (req.query.status) query = query.eq('status', cleanString(req.query.status, 20));
  const result = await query;
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.post('/bank-transactions/import', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const bankAccountId = requireUuid(req.body?.bankAccountId, 'bankAccountId');
  if (!Array.isArray(req.body?.transactions) || !req.body.transactions.length || req.body.transactions.length > 1000) throw errors.validation({ transactions: 'Entre 1 et 1000 opérations sont requises' });
  const transactions = req.body.transactions.map((item) => {
    const importedHash = cleanString(item.importedHash, 64, { required: true }).toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(importedHash)) throw errors.validation({ importedHash: 'Empreinte invalide' });
    return { transactionDate: validIsoDate(item.transactionDate, 'transactionDate'), valueDate: item.valueDate ? validIsoDate(item.valueDate, 'valueDate') : null, amount: moneyString(item.amount, { allowZero: false }), reference: cleanString(item.reference, 200), description: cleanString(item.description, 1000), importedHash };
  });
  const data = unwrap(await getServiceClient().rpc('import_bank_transactions', { p_organization_id: req.organization.id, p_actor_id: req.user.id, p_bank_account_id: bankAccountId, p_transactions: transactions, p_request_id: req.requestId }));
  res.status(201).json(data);
}));

router.get('/reconciliation', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  const result = await getServiceClient().from('reconciliation_matches').select('*,bank_transactions(transaction_date,amount,reference,description),payments(amount,payment_date,reference),journal_entries(entry_number,entry_date,description)', { count: 'exact' })
    .eq('organization_id', req.organization.id).order('created_at', { ascending: false }).range(page.from, page.to);
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.post('/reconciliation/suggest', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const method = cleanString(req.body?.matchingMethod, 30, { required: true });
  if (!['reference','amount_date','manual','ai_suggestion'].includes(method)) throw errors.validation({ matchingMethod: 'Méthode invalide' });
  const confidence = req.body?.confidence === undefined || req.body?.confidence === null ? null : Number(req.body.confidence);
  if (confidence !== null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) throw errors.validation({ confidence: 'Confiance invalide' });
  const data = unwrap(await getServiceClient().rpc('create_reconciliation_suggestion', {
    p_organization_id: req.organization.id, p_actor_id: req.user.id,
    p_bank_transaction_id: requireUuid(req.body?.bankTransactionId, 'bankTransactionId'),
    p_payment_id: uuidOrNull(req.body?.paymentId, 'paymentId'), p_journal_entry_id: uuidOrNull(req.body?.journalEntryId, 'journalEntryId'),
    p_confidence: confidence, p_matching_method: method, p_request_id: req.requestId,
  }));
  res.status(201).json(data);
}));

router.post('/reconciliation/:id/confirm', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().rpc('confirm_reconciliation', { p_organization_id: req.organization.id, p_match_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_request_id: req.requestId }));
  res.json(data);
}));

router.post('/reconciliation/:id/reject', requireOrganizationRole(...ACCOUNTING_ROLES), asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().rpc('reject_reconciliation', { p_organization_id: req.organization.id, p_match_id: requireUuid(req.params.id), p_actor_id: req.user.id, p_request_id: req.requestId }));
  res.json(data);
}));

router.get('/vat/summary', asyncRoute(async (req, res) => {
  let query = getServiceClient().from('vat_summary_v').select('*').eq('organization_id', req.organization.id).order('period_month', { ascending: false });
  if (req.query.from) query = query.gte('period_month', validIsoDate(req.query.from, 'from'));
  if (req.query.to) query = query.lte('period_month', validIsoDate(req.query.to, 'to'));
  res.json({ data: unwrap(await query) || [] });
}));

for (const [path, view, order] of [
  ['general-ledger', 'general_ledger_v', 'entry_date'], ['trial-balance', 'trial_balance_v', 'account_number'], ['financial-statements', 'financial_statement_v', 'statement'],
]) {
  router.get(`/reports/${path}`, asyncRoute(async (req, res) => {
    const page = pagination(req.query);
    let query = getServiceClient().from(view).select('*', { count: 'exact' }).eq('organization_id', req.organization.id).order(order, { ascending: path !== 'general-ledger' }).range(page.from, page.to);
    if (path === 'general-ledger' && req.query.from) query = query.gte('entry_date', validIsoDate(req.query.from, 'from'));
    if (path === 'general-ledger' && req.query.to) query = query.lte('entry_date', validIsoDate(req.query.to, 'to'));
    const result = await query;
    if (result.error) throw result.error;
    res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
  }));
}

router.get('/dashboard', asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('dashboard_v').select('*').eq('organization_id', req.organization.id).maybeSingle());
  res.json({ data: data || { organization_id: req.organization.id, invoice_count: 0, posted_entry_count: 0, income_ttc: 0, expense_ttc: 0 } });
}));

router.get('/audit', requireOrganizationRole('owner','admin','accountant'), asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  const result = await getServiceClient().from('audit_events').select('id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata,created_at', { count: 'exact' }).eq('organization_id', req.organization.id).order('created_at', { ascending: false }).range(page.from, page.to);
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.get('/notifications', asyncRoute(async (req, res) => {
  const page = pagination(req.query);
  const result = await getServiceClient().from('notifications').select('*', { count: 'exact' }).eq('organization_id', req.organization.id).eq('user_id', req.user.id).order('created_at', { ascending: false }).range(page.from, page.to);
  if (result.error) throw result.error;
  res.json({ data: result.data || [], page: { limit: page.limit, offset: page.offset, total: result.count || 0 } });
}));

router.post('/notifications/:id/read', asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', requireUuid(req.params.id)).eq('organization_id', req.organization.id).eq('user_id', req.user.id).select().maybeSingle());
  if (!data) throw errors.notFound();
  res.json({ data });
}));

router.post('/notifications/read-all', asyncRoute(async (req, res) => {
  const data = unwrap(await getServiceClient().from('notifications').update({ read_at: new Date().toISOString() })
    .eq('organization_id', req.organization.id).eq('user_id', req.user.id).is('read_at', null).select('id'));
  res.json({ updated: data?.length || 0 });
}));

const aiTools = {
  invoice_lookup: { table: 'invoices', select: 'id,invoice_number,invoice_date,due_date,status,currency,amount_ht,vat_amount,amount_ttc,third_party_id', search: 'invoice_number' },
  account_lookup: { table: 'accounts', select: 'id,account_number,label,class,category,reporting_category,is_active', search: 'account_number' },
  third_party_lookup: { table: 'third_parties', select: 'id,type,name,tax_id,status', search: 'normalized_name' },
  journal_lookup: { table: 'journal_entries', select: 'id,entry_number,entry_date,reference,description,status,posted_at', search: 'entry_number' },
};
router.post('/ai/tools/:tool', asyncRoute(async (req, res) => {
  if (req.params.tool === 'vat_summary') {
    return res.json({ data: unwrap(await getServiceClient().from('vat_summary_v').select('*').eq('organization_id', req.organization.id).order('period_month', { ascending: false }).limit(24)) || [] });
  }
  if (req.params.tool === 'reporting_lookup') {
    return res.json({ data: unwrap(await getServiceClient().from('trial_balance_v').select('account_number,label,class,reporting_category,total_debit,total_credit,balance').eq('organization_id', req.organization.id).order('account_number').limit(100)) || [] });
  }
  if (req.params.tool === 'anomaly_lookup') {
    const [drafts, unmatched] = await Promise.all([
      getServiceClient().from('journal_entries').select('id,entry_number,entry_date,description,status').eq('organization_id', req.organization.id).in('status', ['draft','review']).order('entry_date').limit(50),
      getServiceClient().from('bank_transactions').select('id,transaction_date,amount,reference,status').eq('organization_id', req.organization.id).eq('status', 'unmatched').order('transaction_date').limit(50),
    ]);
    if (drafts.error) throw drafts.error;
    if (unmatched.error) throw unmatched.error;
    return res.json({ data: { unpostedEntries: drafts.data || [], unmatchedBankTransactions: unmatched.data || [] } });
  }
  const config = aiTools[req.params.tool];
  if (!config) throw errors.notFound();
  const term = cleanString(req.body?.query, 120, { required: true });
  let query = getServiceClient().from(config.table).select(config.select).eq('organization_id', req.organization.id).limit(20);
  query = query.ilike(config.search, `%${term.replace(/[%_]/g, '\\$&')}%`);
  res.json({ data: unwrap(await query) || [] });
}));

router.use((error, req, res, next) => next(mapDatabaseError(error)));

export default router;
