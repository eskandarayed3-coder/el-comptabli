import test from 'node:test';
import assert from 'node:assert/strict';
import { getDisplayIdentity, isUnsafeIdentityValue } from '../../shared/displayIdentity.js';
import { profilePresentation } from './profilePresentation.js';

const trialEmail = 'anonymous-a502462e-3431-4ec1-a0ae-a4431c4a8c6b@trial.invalid';

test('French trial user receives the friendly trial label with no email', () => {
  const identity = getDisplayIdentity({ isAnonymous: true, email: trialEmail }, {}, 'fr');
  assert.equal(identity.displayName, 'Compte d’essai gratuit');
  assert.equal(identity.displayEmail, '');
  assert.equal(identity.showEmail, false);
});

test('Arabic trial user receives the exact localized trial label', () => {
  assert.equal(getDisplayIdentity({ isAnonymous: true, email: trialEmail }, {}, 'ar').displayName, 'حساب تجريبي مجاني');
});

test('real email replaces a stale trial profile email', () => {
  const identity = getDisplayIdentity({ email: 'sana.ben.ali@example.com' }, { email: trialEmail }, 'fr');
  assert.equal(identity.displayEmail, 'sana.ben.ali@example.com');
  assert.equal(identity.displayName, 'Sana ben ali');
});

test('real profile name has priority over email-derived name', () => {
  assert.equal(getDisplayIdentity({ email: 'sana@example.com' }, { name: 'Sana Ben Ali' }).displayName, 'Sana Ben Ali');
});

test('real user without name gets a safe email-derived name', () => {
  const identity = getDisplayIdentity({ email: 'eskandar.ayed3@example.com' }, {}, 'fr');
  assert.equal(identity.displayName, 'Eskandar ayed3');
  assert.equal(identity.isTrial, false);
});

test('missing real-user identity uses a localized generic user label, not trial', () => {
  const identity = getDisplayIdentity({}, {}, 'fr');
  assert.equal(identity.displayName, 'Utilisateur');
  assert.equal(identity.isTrial, false);
});

test('raw UUID and technical identity are rejected as presentation values', () => {
  assert.equal(isUnsafeIdentityValue('a502462e-3431-4ec1-a0ae-a4431c4a8c6b'), true);
  const rendered = JSON.stringify(getDisplayIdentity({ isAnonymous: true, email: trialEmail }, { name: 'a502462e-3431-4ec1-a0ae-a4431c4a8c6b' }));
  assert.equal(rendered.includes('a502462e-3431-4ec1-a0ae-a4431c4a8c6b'), false);
});

test('profile API presentation removes synthetic identity metadata', () => {
  const dto = profilePresentation({ name: trialEmail, email: trialEmail }, { isAnonymous: true, email: trialEmail }, 'fr');
  assert.equal(dto.name, '');
  assert.equal(dto.email, '');
  assert.equal(JSON.stringify(dto).includes('trial.invalid'), false);
});
