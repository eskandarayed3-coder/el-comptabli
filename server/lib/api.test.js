import test from 'node:test';
import assert from 'node:assert/strict';
import { isUuid, moneyString, pagination } from './api.js';

test('API money validation never stores authoritative floats', () => {
  assert.equal(moneyString('12,3'), '12.300');
  assert.equal(moneyString('999999999999999.999'), '999999999999999.999');
  assert.throws(() => moneyString('NaN'));
  assert.throws(() => moneyString('12.3456'));
});

test('API UUID and pagination inputs are bounded', () => {
  assert.equal(isUuid('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isUuid('not-an-id'), false);
  assert.deepEqual(pagination({ limit: '1000', offset: '-2' }), { limit: 100, offset: 0, from: 0, to: 99 });
});
