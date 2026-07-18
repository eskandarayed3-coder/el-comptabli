// Gemini REST helpers. The API key never leaves this process.
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export function model() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': (process.env.GEMINI_API_KEY || '').trim(),
  };
}

// Normalize Google errors into something the UI can show kindly.
export function friendlyError(status, payload) {
  const reason = payload?.error?.details?.find((d) => d.reason)?.reason
    || payload?.error?.status;
  if (status === 403 && String(payload?.error?.message || '').includes('has not been used in project')) {
    return {
      code: 'api_disabled',
      message: "L'API Gemini n'est pas encore activée sur ton projet Google.",
      activationUrl: payload?.error?.details
        ?.flatMap((d) => d.links || [])
        ?.find((l) => l.url)?.url || null,
    };
  }
  if (status === 429) return { code: 'rate_limited', message: 'Trop de demandes, réessaie dans un instant.' };
  if (status === 400 && reason === 'API_KEY_INVALID') {
    return { code: 'bad_key', message: 'La clé API Gemini est invalide.' };
  }
  return { code: 'upstream_error', message: "L'IA est momentanément indisponible. Réessaie." };
}

export async function generateContent(body) {
  const res = await fetch(`${BASE}/${model()}:generateContent`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = friendlyError(res.status, json);
    const e = new Error(err.message);
    e.friendly = err;
    e.status = res.status;
    throw e;
  }
  return json;
}

export function textOf(response) {
  return response?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}

// Returns the raw fetch Response for SSE streaming (caller pipes it).
export async function streamGenerateContent(body) {
  const res = await fetch(`${BASE}/${model()}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const err = friendlyError(res.status, json);
    const e = new Error(err.message);
    e.friendly = err;
    e.status = res.status;
    throw e;
  }
  return res;
}
