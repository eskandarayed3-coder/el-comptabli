import { MAX_OCR_PDF_PAGES, selectPdfPages } from '../../shared/pdfPages.js';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']],
]);

async function json(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const retryAfter = Number(response.headers.get('Retry-After')) || null;
    const friendly = { ...body?.error, retryAfter };
    throw Object.assign(new Error(body?.error?.message || 'Erreur réseau'), { friendly, retryAfter, status: response.status });
  }
  return body;
}

export async function apiFetch(path, options = {}) {
  const { timeoutMs = 20_000, ...fetchOptions } = options;
  const headers = { ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}), ...fetchOptions.headers };
  const signal = fetchOptions.signal || AbortSignal.timeout(timeoutMs);
  try {
    return await fetch(path, { credentials: 'same-origin', ...fetchOptions, headers, signal });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw Object.assign(new Error('La demande a pris trop de temps. Réessaie.'), {
        friendly: { code: 'request_timeout', message: 'La demande a pris trop de temps. Tes corrections sont conservées.' },
      });
    }
    throw error;
  }
}

function validateFile(file) {
  const extension = `.${String(file?.name || '').split('.').pop().toLowerCase()}`;
  if (!file || !ALLOWED_UPLOAD_TYPES.get(file.type)?.includes(extension)) throw new Error('Format accepté : JPG, PNG, WebP ou PDF.');
  if (!file.size) throw new Error('Le fichier est vide.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Fichier trop volumineux (8 Mo maximum).');
}

async function pdfToOcrImages(file) {
  try {
    const [{ getDocument, GlobalWorkerOptions }, { default: workerSrc }] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]);
    GlobalWorkerOptions.workerSrc = workerSrc;
    const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (!pdf.numPages) throw new Error('empty pdf');
    const selectedPages = selectPdfPages(pdf.numPages);
    const images = [];
    for (const pageNumber of selectedPages) {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(2.2, 1400 / Math.max(base.width, base.height));
      const viewport = page.getViewport({ scale: Math.max(1.15, scale) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('canvas unavailable');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.84));
      if (!blob?.size) throw new Error('pdf rendering failed');
      images.push({
        ...(await filePayload(new File([blob], `${file.name.replace(/\.pdf$/i, '')}-page-${pageNumber}.jpg`, { type: 'image/jpeg' }))),
        pageNumber,
      });
    }
    return {
      images,
      pdf: { totalPages: pdf.numPages, selectedPages, limited: pdf.numPages > MAX_OCR_PDF_PAGES },
    };
  } catch {
    throw new Error('Ce PDF est vide, corrompu ou illisible. Essaie un autre fichier.');
  }
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

export async function chatStream({ messages, profile, agentId, onChunk, onMeta, signal }) {
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
        if (item.meta) onMeta?.(item.meta);
        if (item.t) { full += item.t; onChunk?.(full, item.t); }
      } catch (error) {
        if (error.friendly) throw error;
      }
    }
  }
  return full;
}

export async function scanDocument(file) {
  validateFile(file);
  const scanPayload = file.type === 'application/pdf'
    ? await pdfToOcrImages(file)
    : { images: [{ ...(await filePayload(file)), pageNumber: 1 }], pdf: { totalPages: 1, selectedPages: [1], limited: false } };
  const res = await apiFetch('/api/scan', { method: 'POST', body: JSON.stringify(scanPayload), timeoutMs: 55_000 });
  return json(res);
}

export async function confirmScannedInvoice({ file, documentId, transactionId, fields, rawOcr, acceptInconsistency = false }) {
  const payload = await filePayload(file);
  return json(await apiFetch('/api/documents/confirm', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      documentId,
      transactionId,
      fileName: file.name,
      fields,
      rawOcr,
      acceptInconsistency,
    }), timeoutMs: 55_000,
  }));
}

export async function uploadDocument(file, documentId) {
  const payload = await filePayload(file);
  const res = await apiFetch('/api/documents/upload', {
    method: 'POST',
    body: JSON.stringify({ ...payload, documentId, fileName: file.name }),
  });
  return json(res);
}

export async function getDocumentSignedUrl(documentId) {
  return json(await apiFetch('/api/documents/signed-url', {
    method: 'POST',
    body: JSON.stringify({ documentId }),
  }));
}

export async function deleteDocument(documentId) {
  await json(await apiFetch('/api/documents/delete', {
    method: 'POST',
    body: JSON.stringify({ documentId }),
  }));
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

export async function v1(path, options = {}) {
  const response = await apiFetch(`/api/v1${path}`, options);
  return response.status === 204 ? null : json(response);
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
