import { Router } from 'express';
import { validateCode, generateCode, PLANS } from '../lib/codes.js';
import * as fileCodes from '../lib/singleUseCodes.js';
import * as supabaseCodes from '../lib/supabaseCodes.js';

const router = Router();

// Supabase (permanent) is used automatically once SUPABASE_URL +
// SUPABASE_SERVICE_KEY are set; otherwise falls back to the local file —
// same interface either way, so nothing else in this file needs to change
// when you upgrade.
function backend() {
  return supabaseCodes.supabaseConfigured() ? supabaseCodes : fileCodes;
}

// User enters the code they received on WhatsApp → we confirm it and tell the
// client which plan + how many days to unlock. Single-use batch codes are
// checked first (so a real sale always consumes stock); owner/master/
// algorithmic codes remain reusable by design.
router.post('/', async (req, res) => {
  const raw = req.body?.code;
  const single = await backend().redeemSingleUseCode(raw);
  if (single?.alreadyUsed) {
    return res.status(400).json({ error: { code: 'code_used', message: 'Ce code a déjà été utilisé.' } });
  }
  const result = single || validateCode(raw);
  if (!result) {
    return res.status(400).json({ error: { code: 'bad_code', message: 'Code invalide.' } });
  }
  res.json(result);
});

// Owner-only stock check: how many single-use codes remain per plan.
router.get('/stock', async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(403).json({ error: { code: 'forbidden', message: 'Accès refusé.' } });
  }
  res.json({ backend: supabaseCodes.supabaseConfigured() ? 'supabase' : 'file', ...(await backend().batchStats()) });
});

// Owner-only code generator. Protected by ADMIN_SECRET (set it in .env).
// Example: /api/activate/gen?secret=XXX&plan=mois&n=10
router.get('/gen', (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(403).json({ error: { code: 'forbidden', message: 'Accès refusé.' } });
  }
  const plan = PLANS[req.query.plan] ? req.query.plan : 'mois';
  const n = Math.min(50, Math.max(1, Number(req.query.n) || 1));
  const codes = Array.from({ length: n }, () => generateCode(plan));
  res.json({ plan, price: PLANS[plan].price, days: PLANS[plan].days, codes });
});

export default router;
