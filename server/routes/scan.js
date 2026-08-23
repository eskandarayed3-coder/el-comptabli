import { Router } from 'express';
import { providerInfo, scanInvoice } from '../ai.js';
import { validateScanPayload } from '../lib/validation.js';
import { normalizeOcrExtraction, safeOcrSnapshot } from '../../shared/invoice.js';
import { logEvent, userHash } from '../lib/observability.js';

const router = Router();

const SCAN_PROMPT = `Analyse ce document comptable tunisien : facture, reçu, avoir, devis ou document fiscal.
Extrais uniquement ce qui est lisible, en français ou en arabe. Montants en dinars tunisiens.
Si un champ est illisible ou absent, mets null. Pour "category", choisis parmi :
loyer, achats, carburant, electricite, telecom, salaires, impots, ventes, autres.
Pour "kind" : "income" si c'est une facture émise par l'utilisateur, sinon "expense".
"supplierTaxId" est le matricule fiscal du fournisseur. "invoiceNumber" est le numéro de facture.
"vatRates" contient tous les taux de TVA visibles. "confidence" contient pour chaque champ une confiance de 0 à 1.
Extrais aussi "discount" (remise), "stampDuty" (timbre fiscal), "withholdingTax" (retenue à la source), "taxExempt" et "documentType" (facture ou avoir).
Les images sont des pages du même document, fournies dans l'ordre. Consolide une seule facture, sans additionner deux fois les montants répétés. Les totaux récapitulatifs de la dernière page priment.
Ne déduis jamais un montant, un matricule fiscal ou un numéro : laisse null si tu ne peux pas le lire.`;

// Gemini responseSchema (ignored by OpenAI-compatible providers, which use json_object).
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    vendor: { type: 'STRING', nullable: true },
    supplierTaxId: { type: 'STRING', nullable: true },
    invoiceNumber: { type: 'STRING', nullable: true },
    date: { type: 'STRING', description: 'YYYY-MM-DD', nullable: true },
    amountHT: { type: 'NUMBER', nullable: true },
    tva: { type: 'NUMBER', nullable: true },
    amountTTC: { type: 'NUMBER', nullable: true },
    discount: { type: 'NUMBER', nullable: true },
    stampDuty: { type: 'NUMBER', nullable: true },
    withholdingTax: { type: 'NUMBER', nullable: true },
    taxExempt: { type: 'BOOLEAN', nullable: true },
    tvaRate: { type: 'NUMBER', nullable: true },
    vatRates: { type: 'ARRAY', items: { type: 'NUMBER' } },
    category: { type: 'STRING', nullable: true },
    kind: { type: 'STRING', nullable: true },
    reference: { type: 'STRING', nullable: true },
    documentType: { type: 'STRING', nullable: true },
    confidence: {
      type: 'OBJECT',
      properties: {
        vendor: { type: 'NUMBER', nullable: true },
        supplierTaxId: { type: 'NUMBER', nullable: true },
        invoiceNumber: { type: 'NUMBER', nullable: true },
        date: { type: 'NUMBER', nullable: true },
        amountHT: { type: 'NUMBER', nullable: true },
        tva: { type: 'NUMBER', nullable: true },
        amountTTC: { type: 'NUMBER', nullable: true },
        tvaRate: { type: 'NUMBER', nullable: true },
      },
    },
  },
};

// POST /api/scan  { images: [{ mimeType, dataBase64, pageNumber }], pdf }
router.post('/', async (req, res) => {
  const payload = validateScanPayload(req.body);
  if (!payload.ok) return res.status(400).json({ error: { code: 'bad_file', message: payload.message } });
  const startedAt = Date.now();
  const provider = providerInfo();
  const metadata = {
    requestId: req.requestId,
    userHash: userHash(req.user?.id),
    provider: provider.provider,
    model: provider.visionModel,
    pages: payload.images.length,
    totalPages: payload.pdf.totalPages,
    limited: payload.pdf.limited,
  };
  logEvent('info', 'ocr_attempt', metadata);
  try {
    const raw = await scanInvoice({ images: payload.images, prompt: SCAN_PROMPT, schema: SCHEMA });
    const fields = normalizeOcrExtraction(raw);
    logEvent('info', 'ocr_success', { ...metadata, durationMs: Date.now() - startedAt });
    res.json({ fields, raw: safeOcrSnapshot(raw), pageInfo: payload.pdf });
  } catch (e) {
    logEvent('error', 'ocr_failure', {
      ...metadata,
      durationMs: Date.now() - startedAt,
      category: e?.friendly?.code || e?.name || 'upstream_error',
      upstreamStatus: e?.status,
      upstreamCode: e?.upstream?.code,
      upstreamType: e?.upstream?.type,
      upstreamParam: e?.upstream?.param,
    });
    const friendly = e.friendly || { code: 'upstream_error', message: 'Le scan a échoué. Réessaie.' };
    res.status(e.status === 403 ? 403 : e.status === 400 ? 400 : 502).json({ error: friendly });
  }
});

export default router;
