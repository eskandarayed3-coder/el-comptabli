// Provider-agnostic AI layer. Picks the active provider from whichever API key
// is present in .env — so a free Groq key works with zero code changes.
//
//   GROQ_API_KEY       → Groq (free, no card, very fast)   ← recommended
//   MISTRAL_API_KEY    → Mistral (free tier, great French)
//   OPENROUTER_API_KEY → OpenRouter (has free models)
//   XAI_API_KEY        → xAI / Grok (NOT free — needs paid credits on console.x.ai)
//   GEMINI_API_KEY     → Google Gemini (free tier, needs the API enabled)
//
// Force one with AI_PROVIDER=groq|mistral|openrouter|xai|gemini.
import { streamGenerateContent, generateContent, textOf } from './gemini.js';

const RETIRED_GROQ_CHAT_MODELS = new Set([
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
]);

export function resolveGroqChatModel(requested = process.env.AI_CHAT_MODEL) {
  const model = String(requested || '').trim();
  return !model || RETIRED_GROQ_CHAT_MODELS.has(model) ? 'qwen/qwen3.6-27b' : model;
}

function nonThinkingOptions(provider, model) {
  return provider === 'groq' && model === 'qwen/qwen3.6-27b'
    ? { reasoning_effort: 'none' }
    : {};
}

const OPENAI_COMPAT = {
  groq: {
    base: 'https://api.groq.com/openai/v1',
    chat: resolveGroqChatModel(),
    vision: process.env.AI_VISION_MODEL || 'qwen/qwen3.6-27b',
    keyEnv: 'GROQ_API_KEY',
  },
  mistral: {
    base: 'https://api.mistral.ai/v1',
    chat: process.env.AI_CHAT_MODEL || 'mistral-large-latest',
    vision: process.env.AI_VISION_MODEL || 'pixtral-12b-2409',
    keyEnv: 'MISTRAL_API_KEY',
  },
  openrouter: {
    base: 'https://openrouter.ai/api/v1',
    chat: process.env.AI_CHAT_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    vision: process.env.AI_VISION_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free',
    keyEnv: 'OPENROUTER_API_KEY',
  },
  xai: {
    base: 'https://api.x.ai/v1',
    chat: process.env.AI_CHAT_MODEL || 'grok-4',
    vision: process.env.AI_VISION_MODEL || 'grok-4',
    keyEnv: 'XAI_API_KEY',
  },
};

function keyOf(name) {
  return (process.env[name] || '').trim();
}

// Free-tier models occasionally leak single characters from foreign scripts
// (CJK, Cyrillic, Greek...) into French/darija answers. The persona prompt
// forbids it but can't guarantee it, so every AI text passes through this
// last-resort filter: keep Latin, Arabic, digits, punctuation and emoji —
// drop anything from scripts the app never legitimately displays.
const FOREIGN_SCRIPTS = new RegExp(
  '[' +
  '\u0370-\u03FF' +               // Greek
  '\u0400-\u04FF\u0500-\u052F' + // Cyrillic
  '\u0E00-\u0E7F' +               // Thai
  '\u1100-\u11FF\uAC00-\uD7AF' + // Hangul
  '\u3040-\u30FF\u31F0-\u31FF' + // Hiragana / Katakana
  '\u2E80-\u2FDF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF' + // CJK
  ']', 'g'
);
export function sanitizeAiText(text) {
  return String(text || '').replace(FOREIGN_SCRIPTS, '');
}

export function activeProvider() {
  const forced = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (forced) return forced;
  if (keyOf('GROQ_API_KEY')) return 'groq';
  if (keyOf('MISTRAL_API_KEY')) return 'mistral';
  if (keyOf('OPENROUTER_API_KEY')) return 'openrouter';
  if (keyOf('XAI_API_KEY')) return 'xai';
  return 'gemini';
}

export function providerInfo() {
  const p = activeProvider();
  const cfg = OPENAI_COMPAT[p];
  const keyPresent = p === 'gemini' ? Boolean(keyOf('GEMINI_API_KEY')) : Boolean(keyOf(cfg?.keyEnv));
  const model = p === 'gemini' ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash') : cfg?.chat;
  return { provider: p, model, visionModel: p === 'gemini' ? model : cfg?.vision || null, keyPresent };
}

function friendly(status, provider, raw) {
  if (provider === 'gemini' && status === 403 && String(raw).includes('has not been used in project')) {
    return { code: 'api_disabled', message: "L'API Gemini n'est pas encore activée sur ton projet Google." };
  }
  if (status === 403 && /credit|licen[cs]e/i.test(String(raw))) {
    return { code: 'no_credits', message: `Ton compte ${provider} n'a pas encore de crédits, ajoute-en sur leur console pour activer l'IA.` };
  }
  if (status === 401 || status === 403) {
    return { code: 'bad_key', message: `La clé API ${provider} est invalide ou manquante.` };
  }
  if (status === 429) return { code: 'rate_limited', message: 'Trop de demandes, réessaie dans un instant.' };
  return { code: 'upstream_error', message: "L'IA est momentanément indisponible. Réessaie." };
}

function safeUpstreamMetadata(json) {
  const error = json?.error;
  if (!error || typeof error !== 'object') return undefined;
  const clean = (value) => typeof value === 'string' ? value.slice(0, 120) : undefined;
  return {
    code: clean(error.code),
    type: clean(error.type),
    param: clean(error.param),
  };
}

function parseJsonResponse(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw || '{}');
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new SyntaxError('OCR response did not contain a JSON object');
  }
}

// ---------- OpenAI-compatible helpers (Groq / Mistral / OpenRouter) ----------
async function openaiChatStream({ cfg, key, provider, system, messages, onText }) {
  const body = {
    model: cfg.chat,
    stream: true,
    temperature: 0.4,
    max_tokens: 1024,
    ...nonThinkingOptions(provider, cfg.chat),
    messages: [
      { role: 'system', content: system },
      ...messages.slice(-20).map((m) => ({ role: m.role === 'model' ? 'assistant' : 'user', content: String(m.text || '').slice(0, 8000) })),
    ],
  };
  const res = await fetch(`${cfg.base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const e = new Error('upstream'); e.friendly = friendly(res.status, provider, txt); e.status = res.status; throw e;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const t = json?.choices?.[0]?.delta?.content;
        if (t) onText(t);
      } catch { /* partial */ }
    }
  }
}

async function geminiChatStream({ system, messages, onText }) {
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.slice(-20).map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '').slice(0, 8000) }],
    })),
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  };
  const upstream = await streamGenerateContent(body); // throws with .friendly on error
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const json = JSON.parse(payload);
        const t = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
        if (t) onText(t);
      } catch { /* partial */ }
    }
  }
}

// Public: stream a chat completion, calling onText(chunk) for each text piece.
export async function streamChat({ system, messages, onText }) {
  const p = activeProvider();
  const cleanOnText = (t) => { const s = sanitizeAiText(t); if (s) onText(s); };
  if (p === 'gemini') return geminiChatStream({ system, messages, onText: cleanOnText });
  const cfg = OPENAI_COMPAT[p];
  if (!cfg) { const e = new Error('bad provider'); e.friendly = { code: 'bad_key', message: `Fournisseur IA inconnu : ${p}` }; throw e; }
  const key = keyOf(cfg.keyEnv);
  if (!key) { const e = new Error('no key'); e.friendly = { code: 'bad_key', message: `Clé ${cfg.keyEnv} manquante dans .env` }; e.status = 401; throw e; }
  return openaiChatStream({ cfg, key, provider: p, system, messages, onText: cleanOnText });
}

// Public: one-shot text generation (insights / reports).
export async function generateText({ system, prompt, maxTokens = 1024 }) {
  const p = activeProvider();
  if (p === 'gemini') {
    const response = await generateContent({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens },
    });
    return sanitizeAiText(textOf(response));
  }
  const cfg = OPENAI_COMPAT[p];
  const key = keyOf(cfg.keyEnv);
  if (!key) { const e = new Error('no key'); e.friendly = { code: 'bad_key', message: `Clé ${cfg.keyEnv} manquante.` }; e.status = 401; throw e; }
  const res = await fetch(`${cfg.base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: cfg.chat, temperature: 0.4, max_tokens: maxTokens,
      ...nonThinkingOptions(p, cfg.chat),
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error('upstream');
    e.friendly = friendly(res.status, p, JSON.stringify(json));
    e.status = res.status;
    e.upstream = safeUpstreamMetadata(json);
    throw e;
  }
  return sanitizeAiText(json?.choices?.[0]?.message?.content || '');
}

// Public: extract structured invoice fields from an image/PDF (vision).
export async function scanInvoice({ images, prompt, schema }) {
  const orderedImages = Array.isArray(images) ? images : [];
  if (!orderedImages.length) throw new Error('no OCR pages');
  const p = activeProvider();
  if (p === 'gemini') {
    const response = await generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          ...orderedImages.map(({ mimeType, dataBase64, pageNumber }) => ({
            inlineData: { mimeType, data: dataBase64 },
            pageNumber,
          })).map(({ inlineData }) => ({ inlineData })),
        ],
      }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: schema },
    });
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(text);
  }
  const cfg = OPENAI_COMPAT[p];
  if (!cfg?.vision) {
    const e = new Error('no vision'); e.friendly = { code: 'no_vision', message: `Le scan par IA nécessite Gemini ou un modèle vision. Le fournisseur ${p} n'en a pas de configuré.` }; e.status = 400; throw e;
  }
  const key = keyOf(cfg.keyEnv);
  const messages = [{
    role: 'user',
    content: [
      { type: 'text', text: prompt + '\nRéponds UNIQUEMENT en JSON avec les clés: vendor, supplierTaxId, invoiceNumber, date, amountHT, tva, amountTTC, discount, stampDuty, withholdingTax, taxExempt, tvaRate, vatRates, category, kind, reference, documentType, confidence.' },
      ...orderedImages.map(({ mimeType, dataBase64 }) => ({ type: 'image_url', image_url: { url: `data:${mimeType};base64,${dataBase64}` } })),
    ],
  }];
  const request = async (jsonMode) => {
    const body = {
      model: cfg.vision,
      temperature: 0,
      max_completion_tokens: 2048,
      reasoning_effort: 'none',
      messages,
    };
    if (jsonMode) body.response_format = { type: 'json_object' };
    return fetch(`${cfg.base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45_000),
    });
  };
  let res = await request(true);
  let json = await res.json().catch(() => ({}));
  if (!res.ok && json?.error?.code === 'json_validate_failed') {
    res = await request(false);
    json = await res.json().catch(() => ({}));
  }
  if (!res.ok) {
    const e = new Error('upstream');
    e.friendly = friendly(res.status, p, JSON.stringify(json));
    e.status = res.status;
    e.upstream = safeUpstreamMetadata(json);
    throw e;
  }
  const text = json?.choices?.[0]?.message?.content || '{}';
  return parseJsonResponse(text);
}

// Public: free-text answer from a system prompt + text + optional image (vision).
// Used by the exam solver — reads a photographed exercise and solves it in detail.
export async function generateTextWithImage({ system, prompt, image, maxTokens = 1024 }) {
  const p = activeProvider();
  if (p === 'gemini') {
    const parts = [{ text: prompt }];
    if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.dataBase64 } });
    const response = await generateContent({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens },
    });
    return sanitizeAiText(textOf(response));
  }
  const cfg = OPENAI_COMPAT[p];
  if (image && !cfg?.vision) {
    const e = new Error('no vision'); e.friendly = { code: 'no_vision', message: `La lecture d'image nécessite Gemini ou un modèle vision. Le fournisseur ${p} n'en a pas de configuré.` }; e.status = 400; throw e;
  }
  const key = keyOf(cfg.keyEnv);
  if (!key) { const e = new Error('no key'); e.friendly = { code: 'bad_key', message: `Clé ${cfg.keyEnv} manquante.` }; e.status = 401; throw e; }
  const content = image
    ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.dataBase64}` } }]
    : prompt;
  const res = await fetch(`${cfg.base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: image ? cfg.vision : cfg.chat, temperature: 0.3, max_tokens: maxTokens,
      ...nonThinkingOptions(p, image ? cfg.vision : cfg.chat),
      messages: [{ role: 'system', content: system }, { role: 'user', content }],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error('upstream'); e.friendly = friendly(res.status, p, JSON.stringify(json)); e.status = res.status; throw e; }
  return sanitizeAiText(json?.choices?.[0]?.message?.content || '');
}
