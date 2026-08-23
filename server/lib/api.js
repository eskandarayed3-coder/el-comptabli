export class ApiError extends Error {
  constructor(code, status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const errors = {
  auth: () => new ApiError('AUTH_REQUIRED', 401, 'Connecte-toi pour continuer.'),
  forbidden: () => new ApiError('FORBIDDEN', 403, 'Tu n’as pas la permission d’effectuer cette action.'),
  validation: (details) => new ApiError('VALIDATION_ERROR', 400, 'Les données envoyées sont invalides.', details),
  notFound: () => new ApiError('NOT_FOUND', 404, 'Ressource introuvable.'),
  duplicate: () => new ApiError('DUPLICATE', 409, 'Cette ressource existe déjà.'),
  conflict: (message = 'La ressource a été modifiée. Recharge puis réessaie.') => new ApiError('CONFLICT', 409, message),
};

export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function sendApiError(error, req, res) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details, requestId: req.requestId } });
  }
  const databaseCode = String(error?.code || '');
  const databaseMessage = String(error?.message || '');
  if (databaseCode === '23505') return sendApiError(errors.duplicate(), req, res);
  if (databaseCode === '42501' || /FORBIDDEN/.test(databaseMessage)) return sendApiError(errors.forbidden(), req, res);
  if (/PERIOD_CLOSED/.test(databaseMessage)) return res.status(409).json({ error: { code: 'PERIOD_CLOSED', message: 'La période comptable est clôturée.', requestId: req.requestId } });
  if (/ACCOUNTING_MAPPING_REQUIRES_HUMAN_VALIDATION/.test(databaseMessage)) return res.status(409).json({ error: { code: 'ACCOUNTING_MAPPING_REQUIRES_HUMAN_VALIDATION', message: 'Une validation humaine du mapping comptable est requise.', requestId: req.requestId } });
  if (/ACCOUNTING_MAPPING_REQUIRED|JOURNAL_REQUIRED|MAPPING_MISMATCH|INVOICE_NOT_CONFIRMED/.test(databaseMessage)) return res.status(409).json({ error: { code: 'ACCOUNTING_MAPPING_REQUIRED', message: 'Le mapping comptable ou le journal ne permet pas encore de comptabiliser cette facture.', requestId: req.requestId } });
  if (/UNBALANCED_ENTRY/.test(databaseMessage)) return res.status(422).json({ error: { code: 'UNBALANCED_ENTRY', message: 'Le total débit doit être égal au total crédit.', requestId: req.requestId } });
  if (/INVALID_ACCOUNT|INVALID_JOURNAL/.test(databaseMessage)) return res.status(422).json({ error: { code: 'INVALID_ACCOUNT', message: 'Un compte ou journal sélectionné est invalide.', requestId: req.requestId } });
  if (/VALIDATION_ERROR|REVERSAL_ENTRY_REQUIRED/.test(databaseMessage)) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Les données envoyées sont invalides.', requestId: req.requestId } });
  if (/INVALID_STATE|LAST_OWNER_REQUIRED|POSTED_ENTRY_IMMUTABLE/.test(databaseMessage)) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Cette opération n’est pas permise dans l’état actuel.', requestId: req.requestId } });
  if (/CROSS_TENANT_REFERENCE/.test(databaseMessage)) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Référence inaccessible pour cette organisation.', requestId: req.requestId } });
  if (/OVERALLOCATED/.test(databaseMessage)) return res.status(422).json({ error: { code: 'CONFLICT', message: 'Les affectations dépassent le montant disponible.', requestId: req.requestId } });
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Une erreur inattendue est survenue.', requestId: req.requestId } });
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

export function requireUuid(value, field = 'id') {
  if (!isUuid(value)) throw errors.validation({ [field]: 'UUID invalide' });
  return String(value).toLowerCase();
}

export function cleanString(value, max = 200, { required = false } = {}) {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  if (required && !text) throw errors.validation({ value: 'Champ obligatoire' });
  return text;
}

export function moneyString(value, { positive = false, allowZero = true } = {}) {
  const raw = String(value ?? '').trim().replace(',', '.');
  if (!/^-?\d{1,15}(?:\.\d{1,3})?$/.test(raw)) throw errors.validation({ amount: 'Montant invalide' });
  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction = ''] = unsigned.split('.');
  const mills = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'));
  const signed = negative ? -mills : mills;
  if (positive && signed <= 0n) throw errors.validation({ amount: 'Le montant doit être positif' });
  if (!allowZero && signed === 0n) throw errors.validation({ amount: 'Le montant ne peut pas être nul' });
  const abs = signed < 0n ? -signed : signed;
  return `${signed < 0n ? '-' : ''}${abs / 1000n}.${String(abs % 1000n).padStart(3, '0')}`;
}

export function pagination(query) {
  const limit = Math.min(100, Math.max(1, Number.parseInt(query?.limit, 10) || 25));
  const offset = Math.min(100000, Math.max(0, Number.parseInt(query?.offset, 10) || 0));
  return { limit, offset, from: offset, to: offset + limit - 1 };
}

export function validIsoDate(value, field = 'date') {
  const text = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(new Date(`${text}T00:00:00Z`).valueOf())) {
    throw errors.validation({ [field]: 'Date invalide' });
  }
  return text;
}
