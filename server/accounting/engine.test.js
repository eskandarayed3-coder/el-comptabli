import test from 'node:test';
import assert from 'node:assert/strict';
import { millisToMoney, moneyToMillis, statementSection, validateBalancedLines, vatNet } from './engine.js';

test('money stays exact to Tunisian millimes', () => {
  assert.equal(moneyToMillis('123456789.123'), 123456789123n);
  assert.equal(millisToMoney(-7123n), '-7.123');
});

test('journal validation rejects meaningless and unbalanced lines', () => {
  assert.equal(validateBalancedLines([{ debit: '100', credit: '0' }, { debit: '0', credit: '100' }]).ok, true);
  assert.equal(validateBalancedLines([{ debit: '100', credit: '1' }, { debit: '0', credit: '99' }]).ok, false);
  assert.equal(validateBalancedLines([{ debit: '0', credit: '0' }, { debit: '0', credit: '0' }]).ok, false);
});

test('VAT and statement mapping are deterministic', () => {
  assert.equal(vatNet({ collected: '19.000', deductible: '7.000', adjustments: '-1.000' }), '11.000');
  assert.equal(statementSection(6), 'expense');
  assert.equal(statementSection(7), 'revenue');
  assert.equal(statementSection(4), 'balance_sheet');
});
