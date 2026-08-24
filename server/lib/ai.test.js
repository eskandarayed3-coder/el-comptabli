import test from 'node:test';
import assert from 'node:assert/strict';
import { providerInfo, resolveGroqChatModel, scanInvoice } from '../ai.js';

test('Groq chat replaces retired models with the supported multilingual model', () => {
  assert.equal(resolveGroqChatModel(''), 'qwen/qwen3.6-27b');
  assert.equal(resolveGroqChatModel('llama-3.3-70b-versatile'), 'qwen/qwen3.6-27b');
  assert.equal(resolveGroqChatModel('llama-3.1-8b-instant'), 'qwen/qwen3.6-27b');
  assert.equal(resolveGroqChatModel('openai/gpt-oss-120b'), 'openai/gpt-oss-120b');
});

test('Groq OCR defaults to the current supported vision model', () => {
  const previous = {
    provider: process.env.AI_PROVIDER,
    chat: process.env.AI_CHAT_MODEL,
    vision: process.env.AI_VISION_MODEL,
    groq: process.env.GROQ_API_KEY,
  };
  process.env.AI_PROVIDER = 'groq';
  delete process.env.AI_CHAT_MODEL;
  delete process.env.AI_VISION_MODEL;
  process.env.GROQ_API_KEY = 'phase0-test-key';
  try {
    const info = providerInfo();
    assert.equal(info.provider, 'groq');
    assert.equal(info.model, 'qwen/qwen3.6-27b');
    assert.equal(info.visionModel, 'qwen/qwen3.6-27b');
    assert.equal(info.keyPresent, true);
  } finally {
    if (previous.provider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = previous.provider;
    if (previous.chat === undefined) delete process.env.AI_CHAT_MODEL; else process.env.AI_CHAT_MODEL = previous.chat;
    if (previous.vision === undefined) delete process.env.AI_VISION_MODEL; else process.env.AI_VISION_MODEL = previous.vision;
    if (previous.groq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = previous.groq;
  }
});

test('Groq OCR retries without JSON mode when provider validation fails', async () => {
  const previous = {
    provider: process.env.AI_PROVIDER,
    groq: process.env.GROQ_API_KEY,
    fetch: globalThis.fetch,
  };
  process.env.AI_PROVIDER = 'groq';
  process.env.GROQ_API_KEY = 'phase0-test-key';
  const requests = [];
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    if (requests.length === 1) {
      return new Response(JSON.stringify({ error: { code: 'json_validate_failed', type: 'invalid_request_error' } }), { status: 400 });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: '```json\n{"vendor":"PHASE0 TEST SARL","invoiceNumber":"PHASE0-2026-001"}\n```' } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const result = await scanInvoice({
      images: [{ mimeType: 'image/png', dataBase64: 'cGhhc2Uw' }],
      prompt: 'Extract the invoice.',
      schema: {},
    });
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0].response_format, { type: 'json_object' });
    assert.equal(requests[0].reasoning_effort, 'none');
    assert.equal(requests[1].response_format, undefined);
    assert.equal(result.vendor, 'PHASE0 TEST SARL');
    assert.equal(result.invoiceNumber, 'PHASE0-2026-001');
  } finally {
    globalThis.fetch = previous.fetch;
    if (previous.provider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = previous.provider;
    if (previous.groq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = previous.groq;
  }
});
