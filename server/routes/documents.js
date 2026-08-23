import { Router } from 'express';
import { getServiceClient, requireUser } from '../lib/supabase.js';
import { cleanText, validateImagePayload } from '../lib/validation.js';
import { ensureAccount } from '../lib/users.js';
import { safeOcrSnapshot, validateConfirmedInvoice } from '../../shared/invoice.js';

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

export function ownedPath(userId, storagePath) {
  const path = cleanText(storagePath, 240);
  if (!path || path.includes('..') || path.includes('\\') || !path.startsWith(`${userId}/`)) return null;
  return path;
}

function validFileName(fileName, mimeType) {
  const extension = `.${String(fileName || '').split('.').pop().toLowerCase()}`;
  const allowed = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
  };
  return allowed[mimeType]?.includes(extension);
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
  if (!validFileName(fileName, payload.mimeType)) return res.status(400).json({ error: { code: 'bad_file_extension', message: 'L’extension ne correspond pas au format du fichier.' } });

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

// Archives the original and commits the reviewed invoice plus dashboard state.
// Storage cannot participate in a Postgres transaction, so a failed database
// commit is compensated immediately by deleting the uploaded object.
router.post('/confirm', async (req, res) => {
  const documentId = cleanText(req.body?.documentId, 64);
  const transactionId = cleanText(req.body?.transactionId, 64);
  const fileName = cleanText(req.body?.fileName, 180).replace(/[\u0000-\u001f\\/]/g, '').trim();
  if (!isDocumentId(documentId) || !isDocumentId(transactionId)) {
    return res.status(400).json({ error: { code: 'bad_document_id', message: 'Identifiant de facture invalide.' } });
  }
  const payload = validateImagePayload(req.body);
  if (!payload.ok) return res.status(400).json({ error: { code: 'bad_file', message: payload.message } });
  if (!validFileName(fileName, payload.mimeType)) return res.status(400).json({ error: { code: 'bad_file_extension', message: 'L’extension ne correspond pas au format du fichier.' } });

  let confirmation;
  try {
    confirmation = validateConfirmedInvoice(req.body?.fields);
  } catch {
    return res.status(400).json({ error: { code: 'bad_invoice', message: 'Les champs confirmés sont invalides.' } });
  }
  if (!confirmation.ok) {
    return res.status(400).json({ error: { code: 'bad_invoice', message: 'Complète le fournisseur, le numéro, la date et le TTC.', fields: confirmation.errors } });
  }
  if (!confirmation.consistency.consistent && req.body?.acceptInconsistency !== true) {
    return res.status(422).json({ error: { code: 'invoice_inconsistent', message: 'Le total HT + TVA ne correspond pas au TTC. Vérifie les montants.' } });
  }

  const bytes = Buffer.from(payload.dataBase64, 'base64');
  const storagePath = `${req.user.id}/${documentId}.${MIME_EXTENSIONS[payload.mimeType]}`;
  const now = new Date().toISOString();
  const fields = confirmation.normalized;
  const document = {
    id: documentId,
    name: fileName,
    type: 'facture',
    date: fields.date,
    size: `${Math.max(1, Math.round(bytes.length / 1024))} Ko`,
    scanned: true,
    reviewed: true,
    vendor: fields.vendor,
    supplierTaxId: fields.supplierTaxId,
    reference: fields.invoiceNumber,
    amountTTC: fields.amountTTC,
    documentType: fields.documentType,
    source: 'ai-scan',
    status: 'verified',
    storagePath,
    mimeType: payload.mimeType,
    storageSizeBytes: bytes.length,
    uploadedAt: now,
    transactionId,
  };
  const transaction = {
    id: transactionId,
    kind: fields.kind,
    vendor: fields.vendor,
    label: fields.vendor,
    supplierTaxId: fields.supplierTaxId,
    category: fields.category,
    reference: fields.invoiceNumber,
    date: fields.date,
    amountHT: fields.amountHT || 0,
    tva: fields.tva || 0,
    amountTTC: fields.amountTTC,
    tvaRate: fields.tvaRate,
    vatRates: fields.vatRates,
    scanned: true,
    documentId,
  };
  const rawOcr = safeOcrSnapshot(req.body?.rawOcr);

  try {
    await ensureAccount(req.user);
    await ensureBucket();
    const storage = getServiceClient().storage.from(BUCKET);
    const uploaded = await storage.upload(storagePath, bytes, {
      contentType: payload.mimeType,
      cacheControl: '3600',
      upsert: false,
    });
    if (uploaded.error) {
      if (/already exists|duplicate/i.test(uploaded.error.message || '')) {
        return res.status(409).json({ error: { code: 'document_exists', message: 'Ce document est déjà archivé.' } });
      }
      throw uploaded.error;
    }

    const { data, error } = await getServiceClient().rpc('confirm_scanned_invoice', {
      p_user_id: req.user.id,
      p_fingerprint: confirmation.fingerprint,
      p_invoice: { id: documentId, ...fields, storagePath, rawOcr, validatedAt: now },
      p_transaction: transaction,
      p_document: document,
      p_activity: { id: `scan_${transactionId}`, text: `Facture ${fields.vendor} scannée`, icon: 'ScanLine', at: now },
    });
    if (error) {
      await storage.remove([storagePath]).catch(() => {});
      if (error.code === '23505' || /duplicate|unique/i.test(error.message || '')) {
        return res.status(409).json({ error: { code: 'duplicate_invoice', message: 'Cette facture existe déjà pour ce fournisseur et cette date.' } });
      }
      throw error;
    }
    return res.status(201).json({ state: data?.state || data, invoice: data?.invoice || null, document, transaction });
  } catch (error) {
    console.error('invoice confirmation error:', error?.message || error);
    return res.status(503).json({ error: { code: 'invoice_save_failed', message: 'La facture n’a pas pu être enregistrée. Aucune donnée incomplète n’a été conservée.' } });
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
