import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestAuthClient } from './supabase.js';

test('request auth uses the publishable key and never the service-role key', () => {
  const previous = {
    url: process.env.SUPABASE_URL,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishable: process.env.SUPABASE_PUBLISHABLE_KEY,
  };
  process.env.SUPABASE_URL = 'https://phase0.example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'phase0-service-secret';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'phase0-publishable';

  let received;
  const marker = {};
  try {
    const client = createRequestAuthClient((url, key, options) => {
      received = { url, key, options };
      return marker;
    });
    assert.equal(client, marker);
    assert.equal(received.url, process.env.SUPABASE_URL);
    assert.equal(received.key, process.env.SUPABASE_PUBLISHABLE_KEY);
    assert.notEqual(received.key, process.env.SUPABASE_SERVICE_ROLE_KEY);
    assert.deepEqual(received.options.auth, {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    });
  } finally {
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.service === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.service;
    if (previous.publishable === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = previous.publishable;
  }
});

test('request auth creates an isolated client for every request', () => {
  const previous = {
    url: process.env.SUPABASE_URL,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
    publishable: process.env.SUPABASE_PUBLISHABLE_KEY,
  };
  process.env.SUPABASE_URL = 'https://phase0.example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'phase0-service-secret';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'phase0-publishable';

  let sequence = 0;
  try {
    const factory = () => ({ sequence: ++sequence });
    const first = createRequestAuthClient(factory);
    const second = createRequestAuthClient(factory);
    assert.notEqual(first, second);
    assert.deepEqual([first.sequence, second.sequence], [1, 2]);
  } finally {
    if (previous.url === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previous.url;
    if (previous.service === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previous.service;
    if (previous.publishable === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = previous.publishable;
  }
});
