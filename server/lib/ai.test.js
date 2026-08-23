import test from 'node:test';
import assert from 'node:assert/strict';
import { providerInfo } from '../ai.js';

test('Groq OCR defaults to the current supported vision model', () => {
  const previous = {
    provider: process.env.AI_PROVIDER,
    vision: process.env.AI_VISION_MODEL,
    groq: process.env.GROQ_API_KEY,
  };
  process.env.AI_PROVIDER = 'groq';
  delete process.env.AI_VISION_MODEL;
  process.env.GROQ_API_KEY = 'phase0-test-key';
  try {
    const info = providerInfo();
    assert.equal(info.provider, 'groq');
    assert.equal(info.visionModel, 'qwen/qwen3.6-27b');
    assert.equal(info.keyPresent, true);
  } finally {
    if (previous.provider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = previous.provider;
    if (previous.vision === undefined) delete process.env.AI_VISION_MODEL; else process.env.AI_VISION_MODEL = previous.vision;
    if (previous.groq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = previous.groq;
  }
});
