import test from 'node:test';
import assert from 'node:assert/strict';
import { anonymousTrialSubscription, TRIAL_MS } from './lib/anonymousTrial.js';

test('anonymous trial is derived from the verified user creation time', () => {
  const createdAt = '2026-08-23T00:00:00.000Z';
  const active = anonymousTrialSubscription({ created_at: createdAt }, Date.parse(createdAt) + 60_000);
  assert.equal(active.plan, 'premium');
  assert.equal(active.premium_until, new Date(Date.parse(createdAt) + TRIAL_MS).toISOString());
});

test('anonymous trial expires after one day and malformed users get no access', () => {
  const createdAt = '2026-08-23T00:00:00.000Z';
  const expired = anonymousTrialSubscription({ created_at: createdAt }, Date.parse(createdAt) + TRIAL_MS + 1);
  assert.equal(expired.plan, 'free');
  assert.equal(anonymousTrialSubscription({}, Date.now()).plan, 'free');
});
