export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export function cleanText(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validCode(value) {
  return /^EC-[A-Z0-9]{16,64}$/.test(String(value || '').trim().toUpperCase());
}

export function validateImagePayload({ mimeType, dataBase64 } = {}) {
  const type = String(mimeType || '').toLowerCase();
  const data = String(dataBase64 || '');
  if (!ALLOWED_IMAGE_TYPES.has(type)) return { ok: false, message: 'Format de fichier non pris en charge.' };
  if (!/^[a-z0-9+/=\r\n]+$/i.test(data)) return { ok: false, message: 'Fichier invalide.' };
  const bytes = Math.floor((data.length * 3) / 4);
  if (!data || bytes > MAX_IMAGE_BYTES) return { ok: false, message: 'Fichier trop volumineux (8 Mo maximum).' };
  return { ok: true, mimeType: type, dataBase64: data };
}

export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20) return null;
  const clean = messages.map((message) => ({
    role: message?.role === 'model' ? 'model' : 'user',
    text: cleanText(message?.text, 8000),
  })).filter((message) => message.text);
  return clean.length ? clean : null;
}

export function validateState(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const serialized = JSON.stringify(data);
  if (serialized.length > 2 * 1024 * 1024) return null;
  return JSON.parse(serialized);
}
