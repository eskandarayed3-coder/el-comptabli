import { Router } from 'express';
import { validateCode, generateCode, PLANS } from '../lib/codes.js';

const router = Router();

// User enters the code they received on WhatsApp → we confirm it and tell the
// client which plan + how many days to unlock.
router.post('/', (req, res) => {
  const result = validateCode(req.body?.code);
  if (!result) {
    return res.status(400).json({ error: { code: 'bad_code', message: 'Code invalide.' } });
  }
  res.json(result);
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
