const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']],
]);

async function json(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body?.error?.message || 'Erreur réseau'), { friendly: body?.error });
  return body;
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  return fetch(path, { credentials: 'same-origin', ...options, headers });
}

function validateFile(file) {
  const extension = `.${String(file?.name || '').split('.').pop().toLowerCase()}`;
  if (!file || !ALLOWED_UPLOAD_TYPES.get(file.type)?.includes(extension)) throw new Error('Format accepté : JPG, PNG, WebP ou PDF.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Fichier trop volumineux (8 Mo maximum).');
}

async function filePayload(file) {
  validateFile(file);
  const dataBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { mimeType: file.type, dataBase64 };
}

export async function chatStream({ messages, profile, agentId, onChunk, signal }) {
  const res = await apiFetch('/api/chat', {
    method: 'POST', body: JSON.stringify({ messages, profile, agentId }), signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body?.error?.message || 'Erreur réseau'), { friendly: body?.error });
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
        const item = JSON.parse(payload);
        if (item.error) throw Object.assign(new Error(item.error.message), { friendly: item.error });
        if (item.t) { full += item.t; onChunk?.(full, item.t); }
      } catch (error) {
        if (error.friendly) throw error;
      }
    }
  }
  return full;
}

export async function scanDocument(file) {
  const res = await apiFetch('/api/scan', { method: 'POST', body: JSON.stringify(await filePayload(file)) });
  return (await json(res)).fields;
}

export async function fileToImagePayload(file) {
  const payload = await filePayload(file);
  if (payload.mimeType === 'application/pdf') throw new Error('Choisis une image pour cet exercice.');
  return payload;
}

export async function solveExam({ prompt, image, maxTokens }) {
  const res = await apiFetch('/api/exam', { method: 'POST', body: JSON.stringify({ prompt, image, maxTokens }) });
  return (await json(res)).text;
}

export async function activateCode(code) {
  const res = await apiFetch('/api/activate', { method: 'POST', body: JSON.stringify({ code }) });
  return json(res);
}

export async function activateTrial() {
  return json(await apiFetch('/api/activate/trial', { method: 'POST', body: '{}' }));
}

export async function loadCloudState() {
  return json(await apiFetch('/api/state'));
}

export async function saveCloudState(data) {
  await json(await apiFetch('/api/state', { method: 'PUT', body: JSON.stringify({ data }) }));
}

export async function generateInsight({ prompt, data, profile, maxTokens }) {
  const res = await apiFetch('/api/insights', { method: 'POST', body: JSON.stringify({ prompt, data, profile, maxTokens }) });
  return (await json(res)).text;
}

export async function emailExport(email, rows) {
  return json(await apiFetch('/api/exports/email', { method: 'POST', body: JSON.stringify({ email, rows }) }));
}

export async function adminFetch(path, options = {}) {
  const response = await apiFetch(`/api/admin${path}`, options);
  return json(response);
}
