import test from 'node:test';
import assert from 'node:assert/strict';
import {
  postedCategoryTotals,
  postedEntryCount,
  postedMonthTotals,
  postedVatPosition,
  postedWeeklyRevenue,
  postedYearTotals,
} from '../../shared/accountingReporting.js';

const lines = [
  { entry_id: 'sale-1', entry_date: '2026-08-03', account_class: 7, reporting_category: 'sales', debit: '0.000', credit: '100.000' },
  { entry_id: 'sale-1', entry_date: '2026-08-03', account_class: 4, debit: '119.000', credit: '0.000' },
  { entry_id: 'expense-1', entry_date: '2026-08-29', account_class: 6, reporting_category: 'fuel', debit: '40.000', credit: '0.000' },
  { entry_id: 'expense-1', entry_date: '2026-08-29', account_class: 4, debit: '0.000', credit: '47.600' },
  { entry_id: 'old-sale', entry_date: '2026-07-15', account_class: 7, reporting_category: 'sales', debit: '0.000', credit: '999.000' },
];

test('all reporting KPIs derive only from posted ledger rows for the selected period', () => {
  assert.deepEqual(postedMonthTotals(lines, '2026-08'), { income: 100, expense: 40, profit: 60 });
  assert.equal(postedEntryCount(lines, '2026-08'), 2);
  assert.equal(postedEntryCount(lines, '2026-08', 7), 1);
  assert.deepEqual(postedCategoryTotals(lines, '2026-08', 6), [{ id: 'fuel', value: 40 }]);
  assert.deepEqual(postedWeeklyRevenue(lines, '2026-08'), [100, 0, 0, 0, 0]);
  assert.equal(postedYearTotals(lines, '2026')[7].profit, 60);
});

test('VAT dashboard uses only posted VAT summary rows and preserves a VAT credit', () => {
  const rows = [
    { period_month: '2026-08-01', kind: 'income', tax_amount: '19.000' },
    { period_month: '2026-08-01', kind: 'expense', tax_amount: '30.000' },
    { period_month: '2026-07-01', kind: 'income', tax_amount: '99.000' },
  ];
  assert.deepEqual(postedVatPosition(rows, '2026-08'), { collected: 19, deductible: 30, due: -11 });
});
