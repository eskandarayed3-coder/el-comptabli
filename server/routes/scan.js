import { Router } from 'express';
import { scanInvoice } from '../ai.js';

const router = Router();

const SCAN_PROMPT = `Analyse ce document (facture, reçu ou document fiscal tunisien).
Extrais les champs demandés. Montants en dinars tunisiens (nombre décimal, sans "DT").
Si un champ est illisible ou absent, mets null. Pour "category", choisis parmi :
loyer, achats, carburant, electricite, telecom, salaires, impots, autres.
Pour "kind" : "income" si c'est une facture émise par l'utilisateur, sinon "expense".`;

// Gemini responseSchema (ignored by OpenAI-compatible providers, which use json_object).
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    vendor: { type: 'STRING', nullable: true },
    date: { type: 'STRING', description: 'YYYY-MM-DD', nullable: true },
    amountHT: { type: 'NUMBER', nullable: true },
    tva: { type: 'NUMBER', nullable: true },
    amountTTC: { type: 'NUMBER', nullable: true },
    tvaRate: { type: 'NUMBER', nullable: true },
    category: { type: 'STRING', nullable: true },
    kind: { type: 'STRING', nullable: true },
    reference: { type: 'STRING', nullable: true },
  },
};

// POST /api/scan  { mimeType, dataBase64 }
router.post('/', async (req, res) => {
  const { mimeType, dataBase64 } = req.body || {};
  if (!mimeType || !dataBase64) {
    return res.status(400).json({ error: { code: 'no_file', message: 'Fichier manquant.' } });
  }
  try {
    const fields = await scanInvoice({ mimeType, dataBase64, prompt: SCAN_PROMPT, schema: SCHEMA });
    res.json({ fields });
  } catch (e) {
    console.error('scan route error:', e?.message || e);
    const friendly = e.friendly || { code: 'upstream_error', message: 'Le scan a échoué. Réessaie.' };
    res.status(e.status === 403 ? 403 : e.status === 400 ? 400 : 502).json({ error: friendly });
  }
});

export default router;
