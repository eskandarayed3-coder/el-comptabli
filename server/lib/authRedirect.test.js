import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authCallbackDestination,
  buildMagicLinkRedirect,
  resolveAppOrigin,
  safeInternalNext,
} from '../../src/lib/authRedirect.js';

test('production origin resolves to the deployed ElComptabli domain', () => {
  assert.equal(
    resolveAppOrigin({ browserOrigin: 'https://el-comptabli.vercel.app' }),
    'https://el-comptabli.vercel.app',
  );
});

test('local development origin remains supported', () => {
  assert.equal(resolveAppOrigin({ browserOrigin: 'http://localhost:5173' }), 'http://localhost:5173');
  assert.equal(resolveAppOrigin({ browserOrigin: 'http://127.0.0.1:5173' }), 'http://127.0.0.1:5173');
});

test('safe internal next navigation preserves /scanner', () => {
  assert.equal(safeInternalNext('/scanner'), '/scanner');
});

test('external and encoded protocol-relative next URLs are rejected', () => {
  assert.equal(safeInternalNext('https://evil.example/steal'), '/home');
  assert.equal(safeInternalNext('//evil.example/steal'), '/home');
  assert.equal(safeInternalNext('/%2F%2Fevil.example/steal'), '/home');
  assert.equal(safeInternalNext('/\\evil.example/steal'), '/home');
});

test('magic-link redirect generation includes the production callback and safe next', () => {
  assert.equal(
    buildMagicLinkRedirect({
      browserOrigin: 'https://el-comptabli.vercel.app',
      next: '/scanner',
    }),
    'https://el-comptabli.vercel.app/auth/callback?next=%2Fscanner',
  );
});

test('authenticated callback uses a safe destination and rejects an external target', () => {
  assert.equal(authCallbackDestination('?next=%2Fscanner'), '/scanner');
  assert.equal(authCallbackDestination('?next=https%3A%2F%2Fevil.example'), '/home');
  assert.equal(authCallbackDestination(''), '/home');
});
