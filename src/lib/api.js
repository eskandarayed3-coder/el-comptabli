// Client for the local Express API (the Gemini key lives server-side only).

export async function chatStream({ messages, profile, agentId, onChunk, signal }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, profile, agentId }),
    signal,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error(json?.error?.message || 'Erreur réseau'), { friendly: json?.error });
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
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
        if (json.error) throw Object.assign(new Error(json.error.message), { friendly: json.error });
        if (json.t) {
          full += json.t;
          onChunk?.(full, json.t);
        }
      } catch (e) {
        if (e.friendly) throw e;
      }
    }
  }
  return full;
}

export async function scanDocument(file) {
  const dataBase64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: file.type || 'image/jpeg', dataBase64 }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json?.error?.message || 'Scan impossible'), { friendly: json?.error });
  return json.fields;
}

// Reads an image File → { mimeType, dataBase64 }, for vision-capable calls.
export async function fileToImagePayload(file) {
  const dataBase64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  return { mimeType: file.type || 'image/jpeg', dataBase64 };
}

// Solve an exercise from typed text and/or a photographed exercise (vision).
export async function solveExam({ system, prompt, image, maxTokens }) {
  const res = await fetch('/api/exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, prompt, image, maxTokens }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json?.error?.message || 'Erreur IA'), { friendly: json?.error });
  return json.text;
}

// Confirm an activation code with the server → { planId, days, price }.
export async function activateCode(code) {
  const res = await fetch('/api/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json?.error?.message || 'Code invalide'), { friendly: json?.error });
  return json;
}

export async function generateInsight({ prompt, data, profile, system, maxTokens }) {
  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, data, profile, system, maxTokens }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json?.error?.message || 'Erreur IA'), { friendly: json?.error });
  return json.text;
}
