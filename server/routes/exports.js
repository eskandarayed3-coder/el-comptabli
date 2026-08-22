import { Router } from 'express';
import { requireUser } from '../lib/supabase.js';
import { cleanText, validEmail } from '../lib/validation.js';

const router = Router();
router.use(requireUser);

function safeText(value) {
  const text = cleanText(value, 500);
  return /^[=+@-]/.test(text) ? `'${text}` : text;
}

function safeAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && Math.abs(amount) < 1_000_000_000 ? Math.round(amount * 1000) / 1000 : 0;
}

function csvEscape(value) {
  const text = safeText(value);
  return /[;\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

router.post('/email', async (req, res) => {
  const email = cleanText(req.body?.email, 254).toLowerCase();
  const rows = Array.isArray(req.body?.rows) ? req.body.rows.slice(0, 10000) : [];
  if (!validEmail(email)) return res.status(400).json({ error: { code: 'bad_email', message: 'Email invalide.' } });
  if (!rows.length) return res.status(400).json({ error: { code: 'empty_export', message: 'Aucune donnée à envoyer.' } });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return res.status(503).json({ error: { code: 'email_not_configured', message: 'L’envoi email n’est pas encore configuré.' } });
  }
  const header = ['Date', 'Type', 'Libellé', 'Catégorie', 'Référence', 'HT', 'TVA', 'TTC', 'Justificatif'];
  const csv = [header, ...rows.map((candidate) => {
    const row = candidate && typeof candidate === 'object' ? candidate : {};
    return [
      row.date,
      row.type || (row.kind === 'income' ? 'Recette' : 'Dépense'),
      row.label || row.vendor,
      row.category,
      row.reference || row.invoice?.number,
      safeAmount(row.amountHT),
      safeAmount(row.tva),
      safeAmount(row.amountTTC),
      row.proof || (row.scanned ? 'Scanné IA' : 'Justificatif à joindre'),
    ];
  })]
    .map((line) => line.map(csvEscape).join(';')).join('\n');
  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [email],
        subject: 'Export El Comptabli',
        text: 'Bonjour,\n\nTu trouveras en pièce jointe l’export El Comptabli demandé.',
        attachments: [{ filename: 'el-comptabli-export.csv', content: Buffer.from('\ufeff' + csv).toString('base64') }],
      }),
    });
    if (!upstream.ok) throw new Error('provider error');
    return res.status(202).json({ ok: true });
  } catch {
    return res.status(502).json({ error: { code: 'email_failed', message: 'L’email n’a pas pu être envoyé. Réessaie.' } });
  }
});

export default router;
