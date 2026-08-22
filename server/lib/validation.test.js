import assert from 'node:assert/strict';
import test from 'node:test';
import { generateCode } from './codes.js';
import { MAX_IMAGE_BYTES, validCode, validateImagePayload, validateMessages, validateState } from './validation.js';

test('activation codes are opaque, valid, and not repeated in a reasonable batch', () => {
  const codes = new Set(Array.from({ length: 100 }, () => generateCode()));
  assert.equal(codes.size, 100);
  for (const code of codes) assert.equal(validCode(code), true);
  assert.equal(validCode('88888888'), false);
  assert.equal(validCode('EC-M39174A2'), false);
});

test('image payload validation only permits bounded supported uploads', () => {
  assert.equal(validateImagePayload({ mimeType: 'image/jpeg', dataBase64: '/9j/aGVsbG8=' }).ok, true);
  assert.equal(validateImagePayload({ mimeType: 'text/html', dataBase64: 'aGVsbG8=' }).ok, false);
  assert.equal(validateImagePayload({ mimeType: 'application/pdf', dataBase64: 'aGVsbG8=' }).ok, false);
  assert.equal(validateImagePayload({ mimeType: 'image/png', dataBase64: 'x'.repeat(Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 4) }).ok, false);
});

test('AI and cloud payloads are capped before reaching providers or storage', () => {
  assert.equal(validateMessages([{ role: 'user', text: 'bonjour' }])?.[0].text, 'bonjour');
  assert.equal(validateMessages([]), null);
  assert.equal(validateMessages(Array.from({ length: 21 }, () => ({ text: 'x' }))), null);
  assert.deepEqual(validateState({ __v: 1, profile: { name: 'Naji' } }), { __v: 1, profile: { name: 'Naji' } });
  assert.equal(validateState('not-json'), null);
});
