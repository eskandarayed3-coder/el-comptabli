import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const root = new URL('../../', import.meta.url);
const sqlFile = async (path) => (await readFile(new URL(path, root), 'utf8'))
  .replace(/create extension if not exists pgcrypto;\s*/gi, '');

test('V1 migrations apply and enforce accounting and tenant invariants', async () => {
  const db = new PGlite();
  const userA = randomUUID();
  const userB = randomUUID();
  const userC = randomUUID();
  try {
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create role service_role nologin;
      create schema auth;
      create table auth.users(id uuid primary key, email text);
      create or replace function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      create or replace function auth.jwt() returns jsonb language sql stable as $$
        select '{"is_anonymous":false}'::jsonb
      $$;
    `);
    await db.exec(await sqlFile('server/lib/schema.sql'));
    await db.query('insert into auth.users(id,email) values ($1,$2),($3,$4),($5,$6)', [userA, 'a@example.test', userB, 'b@example.test', userC, 'viewer@example.test']);
    await db.query(`insert into public.profiles(id,email,name) values ($1,$2,'Org A'),($3,$4,'Org B')`, [userA, 'a@example.test', userB, 'b@example.test']);
    await db.query(`insert into public.app_state(user_id,data) values ($1,'{"transactions":[],"documents":[],"activities":[]}'),($2,'{"transactions":[],"documents":[],"activities":[]}')`, [userA, userB]);

    await db.exec(await sqlFile('supabase/migrations/20260823082312_v1_backend_foundation.sql'));
    await db.exec(await sqlFile('supabase/migrations/20260823082947_v1_accounting_invariants.sql'));
    await db.exec(await sqlFile('supabase/migrations/20260823084601_v1_backend_workflows.sql'));
    await db.exec(await sqlFile('supabase/migrations/20260823085344_v1_rls_and_indexes_hardening.sql'));
    await db.exec(await sqlFile('supabase/migrations/20260823091316_beta_ready_authoritative_state.sql'));

    const memberships = await db.query('select organization_id,user_id,role from public.organization_members order by user_id');
    assert.equal(memberships.rows.length, 2);
    assert.equal(memberships.rows.every((row) => row.role === 'owner'), true);
    const orgA = memberships.rows.find((row) => row.user_id === userA).organization_id;
    const orgB = memberships.rows.find((row) => row.user_id === userB).organization_id;

    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userA]);
    assert.equal((await db.query('select private.has_org_role($1,$2::text[]) allowed', [orgA, ['owner']])).rows[0].allowed, true);
    assert.equal((await db.query('select private.has_org_role($1,$2::text[]) allowed', [orgB, ['owner']])).rows[0].allowed, false);

    const member = await db.query('select public.set_organization_member($1,$2,$3,$4,$5,$6) result', [orgA, userA, userC, 'viewer', 'active', 'req-member']);
    assert.equal(member.rows[0].result.member.role, 'viewer');
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userC]);
    assert.equal((await db.query('select private.has_org_role($1,$2::text[]) allowed', [orgA, ['viewer']])).rows[0].allowed, true);
    assert.equal((await db.query('select private.has_org_role($1,$2::text[]) allowed', [orgB, ['viewer']])).rows[0].allowed, false);

    const account1 = randomUUID();
    const account2 = randomUUID();
    const journal = randomUUID();
    await db.query(`insert into public.accounts(id,organization_id,account_number,label,normalized_label,class,category) values
      ($1,$3,'601','Achats','achats',6,'expense'),($2,$3,'401','Fournisseurs','fournisseurs',4,'liability')`, [account1, account2, orgA]);
    await db.query(`insert into public.journals(id,organization_id,code,name,type) values ($1,$2,'AC','Achats','purchases')`, [journal, orgA]);

    const sourceId = randomUUID();
    const entryPayload = { journalId: journal, entryNumber: 'AC-0001', entryDate: '2026-08-23', reference: 'TEST', description: 'Écriture test', sourceType: 'test', sourceId };
    const lines = [
      { accountId: account1, debit: '100.000', credit: '0.000' },
      { accountId: account2, debit: '0.000', credit: '100.000' },
    ];
    const created = await db.query('select public.create_journal_entry($1,$2,$3::jsonb,$4::jsonb,$5) result', [orgA, userA, JSON.stringify(entryPayload), JSON.stringify(lines), 'req-test']);
    const entryId = created.rows[0].result.entry.id;
    const repeated = await db.query('select public.create_journal_entry($1,$2,$3::jsonb,$4::jsonb,$5) result', [orgA, userA, JSON.stringify(entryPayload), JSON.stringify(lines), 'req-test-2']);
    assert.equal(repeated.rows[0].result.idempotent, true);

    const reviewed = await db.query('select public.review_journal_entry($1,$2,$3,$4) result', [orgA, entryId, userA, 'req-review']);
    assert.equal(reviewed.rows[0].result.entry.status, 'review');
    const reviewedAgain = await db.query('select public.review_journal_entry($1,$2,$3,$4) result', [orgA, entryId, userA, 'req-review-2']);
    assert.equal(reviewedAgain.rows[0].result.idempotent, true);
    await assert.rejects(db.query('select public.post_journal_entry($1,$2,$3,$4)', [orgA, entryId, userB, 'req-cross-tenant']), /FORBIDDEN/);

    const posted = await db.query('select public.post_journal_entry($1,$2,$3,$4) result', [orgA, entryId, userA, 'req-post']);
    assert.equal(posted.rows[0].result.entry.status, 'posted');
    const balance = await db.query('select sum(total_debit) debit,sum(total_credit) credit from public.trial_balance_v where organization_id=$1', [orgA]);
    assert.equal(String(balance.rows[0].debit), String(balance.rows[0].credit));

    const supplier = randomUUID();
    const customer = randomUUID();
    await db.query(`insert into public.third_parties(id,organization_id,type,name,normalized_name) values
      ($1,$3,'supplier','Synthetic Supplier','synthetic supplier'),($2,$3,'customer','Synthetic Customer','synthetic customer')`, [supplier, customer, orgA]);
    const invoice = randomUUID();
    await db.query(`insert into public.invoices(id,user_id,organization_id,document_id,transaction_id,fingerprint,kind,supplier,third_party_id,invoice_number,invoice_date,amount_ht,vat_amount,amount_ttc,storage_path,mime_type,validated_fields,validated_at,status)
      values($1,$2,$3,$4,$5,$6,'expense','Synthetic Supplier',$7,'INV-TEST','2026-08-23',100,19,119,$8,'application/pdf','{}',now(),'confirmed')`,
    [invoice, userA, orgA, `doc-${invoice}`, `tx-${invoice}`, `fp-${invoice}`, supplier, `${userA}/${invoice}.pdf`]);
    const paymentPayload = { thirdPartyId: supplier, invoiceId: invoice, amount: '119.000', currency: 'TND', paymentDate: '2026-08-23', paymentMethod: 'bank_transfer', reference: 'PAY-TEST', idempotencyKey: 'pay-test-1' };
    const payment = await db.query('select public.create_payment($1,$2,$3::jsonb,$4::jsonb,$5) result', [orgA, userA, JSON.stringify(paymentPayload), JSON.stringify([{ invoiceId: invoice, allocatedAmount: '119.000' }]), 'req-pay']);
    const paymentId = payment.rows[0].result.payment.id;
    assert.equal((await db.query('select public.create_payment($1,$2,$3::jsonb,$4::jsonb,$5) result', [orgA, userA, JSON.stringify(paymentPayload), '[]', 'req-pay-repeat'])).rows[0].result.idempotent, true);
    assert.equal((await db.query('select public.post_payment($1,$2,$3,$4) result', [orgA, paymentId, userA, 'req-pay-post'])).rows[0].result.payment.status, 'posted');
    assert.equal((await db.query('select public.reverse_payment($1,$2,$3,$4,$5,$6) result', [orgA, paymentId, userA, null, null, 'req-pay-reverse'])).rows[0].result.payment.status, 'reversed');

    const bankAccount = randomUUID();
    await db.query(`insert into public.bank_accounts(id,organization_id,bank_name,account_label,currency) values($1,$2,'Synthetic Bank','Test account','TND')`, [bankAccount, orgA]);
    const imported = await db.query('select public.import_bank_transactions($1,$2,$3,$4::jsonb,$5) result', [orgA, userA, bankAccount, JSON.stringify([{ transactionDate: '2026-08-23', valueDate: '2026-08-23', amount: '-119.000', reference: 'BANK-TEST', description: 'Synthetic payment', importedHash: 'a'.repeat(64) }]), 'req-bank']);
    assert.equal(imported.rows[0].result.inserted, 1);
    const transactionId = (await db.query('select id from public.bank_transactions where bank_account_id=$1', [bankAccount])).rows[0].id;
    const suggestion = await db.query('select public.create_reconciliation_suggestion($1,$2,$3,$4,$5,$6,$7,$8) result', [orgA, userA, transactionId, paymentId, null, '0.9000', 'amount_date', 'req-match']);
    const matchId = suggestion.rows[0].result.match.id;
    assert.equal((await db.query('select public.reject_reconciliation($1,$2,$3,$4) result', [orgA, matchId, userA, 'req-reject'])).rows[0].result.match.status, 'rejected');
    assert.equal((await db.query('select status from public.bank_transactions where id=$1', [transactionId])).rows[0].status, 'unmatched');

    // Exercise RLS independently from the service-only Data API grants.
    await db.exec('grant select,insert on public.accounts to authenticated');
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userA]);
    await db.exec('set role authenticated');
    assert.equal(Number((await db.query('select count(*) count from public.accounts')).rows[0].count), 2);
    await db.exec('reset role');
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userB]);
    await db.exec('set role authenticated');
    assert.equal(Number((await db.query('select count(*) count from public.accounts')).rows[0].count), 0);
    await assert.rejects(db.query(`insert into public.accounts(organization_id,account_number,label,normalized_label,class,category) values($1,'999','Forbidden','forbidden',9,'other')`, [orgA]), /row-level security|policy/i);
    await db.exec('reset role');
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userC]);
    await db.exec('set role authenticated');
    await assert.rejects(db.query(`insert into public.accounts(organization_id,account_number,label,normalized_label,class,category) values($1,'998','Viewer denied','viewer denied',9,'other')`, [orgA]), /row-level security|policy/i);
    await db.exec('reset role');

    const financialId = randomUUID();
    await db.query(`insert into public.financial_transactions(id,organization_id,created_by,kind,counterparty,label,category,transaction_date,amount_ht,vat_amount,amount_ttc)
      values($1,$2,$3,'income','Synthetic customer','Synthetic sale','services','2026-08-23',100,19,119)`, [financialId, orgA, userA]);
    await db.exec('grant select,insert on public.financial_transactions to authenticated');
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userB]);
    await db.exec('set role authenticated');
    assert.equal(Number((await db.query('select count(*) count from public.financial_transactions')).rows[0].count), 0, 'user B cannot read user A financial transactions');
    await db.exec('reset role');
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [userC]);
    await db.exec('set role authenticated');
    await assert.rejects(db.query(`insert into public.financial_transactions(organization_id,created_by,kind,transaction_date,amount_ttc) values($1,$2,'income','2026-08-23',1)`, [orgA, userC]), /row-level security|policy/i);
    await db.exec('reset role');

    await assert.rejects(
      db.query('select public.create_journal_entry($1,$2,$3::jsonb,$4::jsonb,$5)', [orgA, userA, JSON.stringify({ ...entryPayload, entryNumber: 'AC-0002', sourceId: randomUUID() }), JSON.stringify([{ accountId: account1, debit: '99', credit: '0' }, { accountId: account2, debit: '0', credit: '100' }]), 'req-bad']),
      /UNBALANCED_ENTRY/,
    );

    await assert.rejects(db.query('update public.audit_events set event_type=$1 where entity_id=$2', ['tampered', entryId]), /immutable/);
    assert.equal(Number((await db.query('select count(*) count from public.audit_events where organization_id=$1', [orgA])).rows[0].count) > 10, true);

    const tableNames = (await db.query(`select table_name from information_schema.tables where table_schema='public'`)).rows.map((row) => row.table_name);
    for (const required of ['organizations','documents','ocr_results','third_parties','accounts','journals','journal_entries','journal_lines','payments','bank_transactions','vat_periods','audit_events','financial_transactions','user_preferences','user_tasks','tax_deadlines','chat_sessions','ai_reports','calculation_history','activity_events']) {
      assert.equal(tableNames.includes(required), true, `missing ${required}`);
    }
    assert.equal(tableNames.includes('app_state'), false, 'legacy app_state must be removed');
    assert.equal((await db.query(`select count(*)::int count from information_schema.tables where table_schema='private' and table_name='app_state_legacy_backup'`)).rows[0].count, 1, 'legacy rows remain recoverable outside public');
  } finally {
    await db.close();
  }
});
