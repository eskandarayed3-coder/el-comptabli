export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_OCR_PAGES = 4;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

function hasExpectedSignature(type, data) {
  const bytes = Buffer.from(data, 'base64');
  if (type === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === 'image/webp') return bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  return bytes.length >= 5 && bytes.subarray(0, 5).toString() === '%PDF-';
}

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
  if (!data) return { ok: false, message: 'Le fichier est vide.' };
  if (!/^[a-z0-9+/=\r\n]+$/i.test(data)) return { ok: false, message: 'Fichier invalide.' };
  const bytes = Buffer.from(data, 'base64').length;
  if (!bytes) return { ok: false, message: 'Le fichier est vide.' };
  if (bytes > MAX_IMAGE_BYTES) return { ok: false, message: 'Fichier trop volumineux (8 Mo maximum).' };
  if (!hasExpectedSignature(type, data)) return { ok: false, message: 'Le contenu du fichier ne correspond pas au format annoncé.' };
  return { ok: true, mimeType: type, dataBase64: data };
}

export function validateScanPayload(body = {}) {
  const source = Array.isArray(body.images)
    ? body.images
    : [{ mimeType: body.mimeType, dataBase64: body.dataBase64, pageNumber: 1 }];
  if (!source.length || source.length > MAX_OCR_PAGES) {
    return { ok: false, message: `Le scan accepte de 1 à ${MAX_OCR_PAGES} pages par analyse.` };
  }
  let totalBytes = 0;
  let previousPage = 0;
  const images = [];
  for (const item of source) {
    const pageNumber = Number(item?.pageNumber);
    if (!Number.isInteger(pageNumber) || pageNumber <= previousPage) {
      return { ok: false, message: 'Les pages du PDF sont invalides ou désordonnées.' };
    }
    const validated = validateImagePayload(item);
    if (!validated.ok || validated.mimeType === 'application/pdf') {
      return { ok: false, message: validated.message || 'Chaque page OCR doit être une image.' };
    }
    totalBytes += Buffer.from(validated.dataBase64, 'base64').length;
    if (totalBytes > MAX_IMAGE_BYTES) return { ok: false, message: 'Pages trop volumineuses (8 Mo maximum au total).' };
    previousPage = pageNumber;
    images.push({ ...validated, pageNumber });
  }
  const totalPages = Math.max(Number(body?.pdf?.totalPages) || images.length, previousPage);
  return {
    ok: true,
    images,
    pdf: {
      totalPages,
      selectedPages: images.map((item) => item.pageNumber),
      limited: Boolean(body?.pdf?.limited),
    },
  };
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
