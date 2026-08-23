import { Router } from 'express';
import { scanInvoice } from '../ai.js';
import { validateImagePayload } from '../lib/validation.js';
import { normalizeOcrExtraction, safeOcrSnapshot } from '../../shared/invoice.js';

const router = Router();

const SCAN_PROMPT = `Analyse ce document comptable tunisien : facture, reçu, avoir, devis ou document fiscal.
Extrais uniquement ce qui est lisible, en français ou en arabe. Montants en dinars tunisiens.
Si un champ est illisible ou absent, mets null. Pour "category", choisis parmi :
loyer, achats, carburant, electricite, telecom, salaires, impots, ventes, autres.
Pour "kind" : "income" si c'est une facture émise par l'utilisateur, sinon "expense".
"supplierTaxId" est le matricule fiscal du fournisseur. "invoiceNumber" est le numéro de facture.
"vatRates" contient tous les taux de TVA visibles. "confidence" contient pour chaque champ une confiance de 0 à 1.
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

// POST /api/scan  { mimeType, dataBase64 }
router.post('/', async (req, res) => {
  const payload = validateImagePayload(req.body);
  if (!payload.ok) return res.status(400).json({ error: { code: 'bad_file', message: payload.message } });
  try {
    const raw = await scanInvoice({ ...payload, prompt: SCAN_PROMPT, schema: SCHEMA });
    const fields = normalizeOcrExtraction(raw);
    res.json({ fields, raw: safeOcrSnapshot(raw) });
  } catch (e) {
    console.error('scan route error:', e?.message || e);
    const friendly = e.friendly || { code: 'upstream_error', message: 'Le scan a échoué. Réessaie.' };
    res.status(e.status === 403 ? 403 : e.status === 400 ? 400 : 502).json({ error: friendly });
  }
});

export default router;
