import assert from 'node:assert/strict';
import test from 'node:test';
import { accountingRows, buildDossier, filterTransactions, toCsv, toExcelXml } from '../../src/lib/accountant.js';

const transactions = [
  { id: 'income', date: '2026-08-12', kind: 'income', label: '=SUM(A1:A2)', category: 'ventes', amountHT: 100, tva: 19, amountTTC: 119, scanned: true },
  { id: 'expense', date: '2026-08-02', kind: 'expense', vendor: 'Fournisseur', category: 'achats', amountHT: 50, tva: 9.5, amountTTC: 59.5 },
];

test('accountant export escapes formulas and keeps financial totals numeric', () => {
  const rows = accountingRows(transactions);
  assert.equal(rows[1].label, "'=SUM(A1:A2)");
  assert.match(toCsv(rows), /'=SUM\(A1:A2\)/);
  const dossier = buildDossier(transactions, []);
  assert.equal(dossier.vatCollected, 19);
  assert.equal(dossier.vatDeductible, 9.5);
  assert.match(toExcelXml(rows, dossier), /ss:Type="Number">119/);
});

test('accountant export filters a custom accounting period inclusively', () => {
  const filtered = filterTransactions(transactions, { period: 'custom', from: '2026-08-02', to: '2026-08-02' });
  assert.deepEqual(filtered.map((transaction) => transaction.id), ['expense']);
});
