import { Router } from 'express';
import { generateCode, PLANS } from '../lib/codes.js';
import { requireAdmin, requireUser } from '../lib/supabase.js';
import { validCode } from '../lib/validation.js';
import * as codes from '../lib/supabaseCodes.js';

const router = Router();

router.post('/', requireUser, async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!validCode(code)) return res.status(400).json({ error: { code: 'bad_code', message: 'Code invalide.' } });
  try {
    const result = await codes.redeemSingleUseCode(code, req.user.id);
    if (result?.alreadyUsed) return res.status(400).json({ error: { code: 'code_used', message: 'Ce code a déjà été utilisé.' } });
    if (!result) return res.status(400).json({ error: { code: 'bad_code', message: 'Code invalide.' } });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: { code: 'activation_failed', message: 'Activation impossible. Réessaie dans un instant.' } });
  }
});

router.post('/trial', requireUser, async (req, res) => {
  try {
    const result = await codes.grantTrial(req.user.id);
    if (result.alreadyUsed) return res.status(409).json({ error: { code: 'trial_used', message: 'L’essai gratuit a déjà été utilisé.' } });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: { code: 'trial_failed', message: 'Activation de l’essai impossible.' } });
  }
});

router.post('/gen', requireAdmin, async (req, res) => {
  const plan = PLANS[req.body?.plan] ? req.body.plan : 'mois';
  const n = Math.min(50, Math.max(1, Number(req.body?.n) || 1));
  try {
    const created = await codes.insertBatch(Array.from({ length: n }, () => ({ code: generateCode(), plan })));
    return res.status(201).json({ plan, price: PLANS[plan].price, days: PLANS[plan].days, codes: created.map((row) => row.code) });
  } catch {
    return res.status(500).json({ error: { code: 'generation_failed', message: 'Création des codes impossible.' } });
  }
});

export default router;
