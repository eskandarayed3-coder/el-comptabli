import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPostingPreview, expectedJournalType, mappingPayload } from '../../src/lib/accountingMapping.js';

const accounts = [
  { id: 'main', account_number: 'A', label: 'Compte principal' },
  { id: 'vat', account_number: 'B', label: 'Compte TVA' },
  { id: 'counterparty', account_number: 'C', label: 'Compte tiers' },
];
const selection = { targetAccountId: 'main', vatAccountId: 'vat', counterpartyAccountId: 'counterparty', journalId: 'journal' };
const expense = {
  kind: 'expense', document_type: 'facture', amount_ht: '100.000', vat_amount: '19.000', amount_ttc: '119.000',
  category: 'services', third_party_id: 'supplier', invoice_tax_lines: [{ tax_type: 'vat', tax_rate: '19.000', tax_amount: '19.000' }],
};

test('human mapping payload never invents an account or confidence', () => {
  assert.deepEqual(mappingPayload(expense, selection), {
    thirdPartyId: 'supplier', invoiceCategory: 'services', targetAccountId: 'main', counterpartyAccountId: 'counterparty',
    vatAccountId: 'vat', journalId: 'journal', source: 'human', confidence: null,
    sourceCondition: { invoiceKind: 'expense', documentType: 'facture' },
  });
});

test('expense invoice preview is balanced to Tunisian millimes', () => {
  const preview = buildPostingPreview(expense, selection, accounts);
  assert.equal(preview.balanced, true);
  assert.equal(preview.totalDebit, 119);
  assert.equal(preview.totalCredit, 119);
  assert.equal(preview.lines.length, 3);
  assert.equal(expectedJournalType(expense), 'purchases');
});

test('income credit note reverses the normal accounting direction', () => {
  const invoice = { ...expense, kind: 'income', document_type: 'avoir' };
  const preview = buildPostingPreview(invoice, selection, accounts);
  assert.equal(preview.lines[0].debit, 100);
  assert.equal(preview.lines[1].debit, 19);
  assert.equal(preview.lines.at(-1).credit, 119);
  assert.equal(preview.balanced, true);
  assert.equal(expectedJournalType(invoice), 'sales');
});

test('income invoice debits the customer and credits VAT and revenue', () => {
  const preview = buildPostingPreview({ ...expense, kind: 'income' }, selection, accounts);
  assert.equal(preview.lines[0].debit, 119);
  assert.equal(preview.lines[1].credit, 19);
  assert.equal(preview.lines.at(-1).credit, 100);
  assert.equal(preview.balanced, true);
});

test('expense credit note debits the supplier and credits VAT and expense', () => {
  const preview = buildPostingPreview({ ...expense, document_type: 'avoir' }, selection, accounts);
  assert.equal(preview.lines[0].debit, 119);
  assert.equal(preview.lines[1].credit, 19);
  assert.equal(preview.lines.at(-1).credit, 100);
  assert.equal(preview.balanced, true);
});

test('VAT invoice cannot be posted without validated tax lines and VAT account', () => {
  assert.throws(() => buildPostingPreview({ ...expense, invoice_tax_lines: [] }, selection, accounts), /lignes de TVA/);
  assert.throws(() => mappingPayload(expense, { ...selection, vatAccountId: '' }), /compte de TVA/);
});

test('unsupported discount, stamp or withholding flow remains blocked for professional validation', () => {
  assert.throws(() => buildPostingPreview({ ...expense, amount_ttc: '120.000', stamp_duty: '1.000' }, selection, accounts), /validation professionnelle/);
  assert.throws(() => buildPostingPreview({ ...expense, withholding_tax: '1.000' }, selection, accounts), /validation professionnelle/);
});
