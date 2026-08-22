import { Router } from 'express';
import { getServiceClient, requireUser } from '../lib/supabase.js';
import { cleanText, validateImagePayload } from '../lib/validation.js';

const router = Router();
const BUCKET = 'documents';
const BUCKET_LIMIT = 8 * 1024 * 1024;
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};
let bucketReady = null;

function isDocumentId(value) {
  return /^[A-Za-z0-9_-]{8,64}$/.test(String(value || ''));
}

function ownedPath(userId, storagePath) {
  const path = cleanText(storagePath, 240);
  if (!path || path.includes('..') || path.includes('\\') || !path.startsWith(`${userId}/`)) return null;
  return path;
}

async function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const storage = getServiceClient().storage;
      const existing = await storage.getBucket(BUCKET);
      if (!existing.error && existing.data) {
        if (existing.data.public) {
          const secured = await storage.updateBucket(BUCKET, { public: false });
          if (secured.error) throw secured.error;
        }
        return;
      }
      const created = await storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: BUCKET_LIMIT,
        allowedMimeTypes: Object.keys(MIME_EXTENSIONS),
      });
      if (created.error && !/already exists|duplicate/i.test(created.error.message || '')) throw created.error;
    })();
  }
  try {
    await bucketReady;
  } catch (error) {
    bucketReady = null;
    throw error;
  }
}

router.use(requireUser);

router.post('/upload', async (req, res) => {
  const documentId = cleanText(req.body?.documentId, 64);
  const fileName = cleanText(req.body?.fileName, 180).replace(/[\u0000-\u001f\\/]/g, '').trim();
  if (!isDocumentId(documentId)) return res.status(400).json({ error: { code: 'bad_document_id', message: 'Identifiant de document invalide.' } });
  const payload = validateImagePayload(req.body);
  if (!payload.ok) return res.status(400).json({ error: { code: 'bad_file', message: payload.message } });

  try {
    await ensureBucket();
    const bytes = Buffer.from(payload.dataBase64, 'base64');
    const storagePath = `${req.user.id}/${documentId}.${MIME_EXTENSIONS[payload.mimeType]}`;
    const { error } = await getServiceClient().storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: payload.mimeType,
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      if (/already exists|duplicate/i.test(error.message || '')) {
        return res.status(409).json({ error: { code: 'document_exists', message: 'Ce document est déjà archivé.' } });
      }
      throw error;
    }
    return res.status(201).json({
      document: {
        id: documentId,
        name: fileName || `document.${MIME_EXTENSIONS[payload.mimeType]}`,
        storagePath,
        mimeType: payload.mimeType,
        storageSizeBytes: bytes.length,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('document upload error:', error?.message || error);
    return res.status(503).json({ error: { code: 'document_upload_failed', message: 'Le document n’a pas pu être archivé. Réessaie.' } });
  }
});

router.post('/signed-url', async (req, res) => {
  const storagePath = ownedPath(req.user.id, req.body?.storagePath);
  if (!storagePath) return res.status(403).json({ error: { code: 'forbidden_document', message: 'Document non autorisé.' } });
  try {
    const { data, error } = await getServiceClient().storage.from(BUCKET).createSignedUrl(storagePath, 10 * 60);
    if (error || !data?.signedUrl) throw error || new Error('signed url unavailable');
    return res.json({ url: data.signedUrl, expiresIn: 600 });
  } catch {
    return res.status(404).json({ error: { code: 'document_not_found', message: 'Original introuvable.' } });
  }
});

router.post('/delete', async (req, res) => {
  const storagePath = ownedPath(req.user.id, req.body?.storagePath);
  if (!storagePath) return res.status(403).json({ error: { code: 'forbidden_document', message: 'Document non autorisé.' } });
  try {
    const { error } = await getServiceClient().storage.from(BUCKET).remove([storagePath]);
    if (error) throw error;
    return res.status(204).end();
  } catch {
    return res.status(503).json({ error: { code: 'document_delete_failed', message: 'Suppression impossible pour le moment.' } });
  }
});

export default router;
