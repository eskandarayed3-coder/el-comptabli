import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import v1Router, { configureV1TestDependencies } from './v1.js';
import { errors, sendApiError } from '../lib/api.js';

const USER = '11111111-1111-4111-8111-111111111111';
const ORG_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ORG_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ENTITY = '22222222-2222-4222-8222-222222222222';

function queryBuilder(row = {}) {
  const response = { data: row, error: null, count: Array.isArray(row) ? row.length : 0 };
  const chain = new Proxy({}, {
    get(_target, prop) {
      if (prop === 'then') return (resolve) => resolve(response);
      if (prop === 'single' || prop === 'maybeSingle') return () => Promise.resolve(response);
      return () => chain;
    },
  });
  return chain;
}

function fakeClient() {
  return {
    from(table) {
      if (table === 'dashboard_v') return queryBuilder({ organization_id: ORG_A, invoice_count: 0, posted_entry_count: 0, income_ttc: 0, expense_ttc: 0 });
      if (table === 'activity_events') return queryBuilder({ id: ENTITY, text: 'Test', icon: 'Activity', created_at: '2026-08-23T00:00:00Z' });
      if (table === 'financial_transactions') return queryBuilder({ id: ENTITY, kind: 'income', counterparty: 'Synthetic', label: 'Synthetic', category: 'services', transaction_date: '2026-08-23', amount_ht: '100.000', vat_amount: '19.000', amount_ttc: '119.000', status: 'paid', source: 'manual' });
      if (table === 'organizations') return queryBuilder({ id: ORG_A, name: 'Org A', tax_id: null });
      return queryBuilder([]);
    },
    rpc() { return Promise.resolve({ data: {}, error: null }); },
  };
}

async function withServer({ authenticated = true, role = 'viewer' }, run) {
  configureV1TestDependencies({
    getServiceClient: fakeClient,
    listOrganizations: async () => [],
    requireUser(req, res, next) {
      if (!authenticated) return res.status(401).json({ error: { code: 'unauthorized' } });
      req.user = { id: USER, email: 'synthetic@example.test' };
      return next();
    },
    requireOrganization(req, _res, next) {
      if (req.headers['x-organization-id'] === ORG_B) return next(errors.forbidden());
      req.organization = { id: ORG_A, role, name: 'Org A', currency: 'TND', status: 'active' };
      return next();
    },
  });
  const app = express();
  app.use(express.json());
  app.use('/api/v1', v1Router);
  app.use((error, req, res, _next) => sendApiError(error, req, res));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  try { await run(base); } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    configureV1TestDependencies();
  }
}

const request = (base, path, method = 'GET', body, headers = {}) => {
  const canHaveBody = !['GET','HEAD'].includes(method);
  return fetch(`${base}${path}`, {
    method, headers: { ...(canHaveBody && body ? { 'content-type': 'application/json' } : {}), ...headers }, body: canHaveBody && body ? JSON.stringify(body) : undefined,
  });
};

test('V1 HTTP authorization and organization boundary matrix', async () => {
  await withServer({ authenticated: false }, async (base) => {
    for (const [method, path] of [['GET','/context'],['GET','/bootstrap'],['POST','/transactions'],['POST','/journal-entries'],['POST','/accounting-mappings'],['POST',`/invoices/${ENTITY}/accounting-validation`],['GET','/audit']]) {
      const response = await request(base, path, method, method === 'GET' ? null : {});
      assert.equal(response.status, 401, `${method} ${path} must reject anonymous callers`);
    }
  });

  await withServer({ role: 'owner' }, async (base) => {
    for (const [method, path] of [['GET','/bootstrap'],['GET','/documents'],['POST','/transactions'],['GET','/reports/trial-balance']]) {
      const response = await request(base, path, method, method === 'GET' ? null : {}, { 'x-organization-id': ORG_B });
      assert.equal(response.status, 403, `${method} ${path} must reject another organization`);
    }
  });

  const viewerDenied = [
    ['PATCH','/organization'], ['PUT',`/organization/members/${ENTITY}`], ['POST','/third-parties'], ['PATCH',`/third-parties/${ENTITY}`],
    ['POST','/accounts'], ['PATCH',`/accounts/${ENTITY}`], ['POST','/journals'], ['POST','/bank-accounts'], ['POST','/fiscal-periods'], ['POST','/vat-periods'],
    ['POST','/accounting-mappings'], ['PATCH',`/accounting-mappings/${ENTITY}`], ['POST',`/invoices/${ENTITY}/accounting-validation`],
    ['PATCH',`/documents/${ENTITY}`], ['POST','/invoices/duplicate-check'], ['PATCH',`/invoices/${ENTITY}`],
    ['POST','/transactions'], ['PATCH',`/transactions/${ENTITY}`], ['DELETE',`/transactions/${ENTITY}`], ['PATCH',`/deadlines/${ENTITY}`],
    ['POST','/journal-entries'], ['POST',`/journal-entries/${ENTITY}/review`], ['POST',`/journal-entries/${ENTITY}/post`], ['POST',`/journal-entries/${ENTITY}/reverse`],
    ['POST','/payments'], ['POST',`/payments/${ENTITY}/post`], ['POST',`/payments/${ENTITY}/reverse`], ['POST','/bank-transactions/import'],
    ['POST','/reconciliation/suggest'], ['POST',`/reconciliation/${ENTITY}/confirm`], ['POST',`/reconciliation/${ENTITY}/reject`], ['GET','/audit'],
    ['POST','/tasks'], ['PATCH',`/tasks/${ENTITY}`], ['POST','/chats'], ['POST','/ai-reports'], ['POST','/calculations'], ['POST','/activities'],
  ];
  await withServer({ role: 'viewer' }, async (base) => {
    for (const [method, path] of viewerDenied) {
      const response = await request(base, path, method, {});
      assert.equal(response.status, 403, `${method} ${path} must reject viewer role`);
    }
    assert.equal((await request(base, '/dashboard')).status, 200, 'viewer may read the dashboard');
  });

  await withServer({ role: 'employee' }, async (base) => {
    assert.equal((await request(base, '/activities', 'POST', { text: 'Test' })).status, 201, 'employee may create a personal activity');
    assert.equal((await request(base, '/transactions', 'POST', {})).status, 403, 'employee may not write financial transactions');
  });
  await withServer({ role: 'accountant' }, async (base) => {
    const response = await request(base, '/transactions', 'POST', { kind: 'income', vendor: 'Synthetic', label: 'Synthetic', category: 'services', date: '2026-08-23', amountHT: '100.000', tva: '19.000', amountTTC: '119.000' });
    assert.equal(response.status, 201, 'accountant may create financial transactions');
  });
  await withServer({ role: 'admin' }, async (base) => {
    assert.equal((await request(base, '/organization', 'PATCH', { name: 'Org A' })).status, 200, 'admin may update organization settings');
  });
});
