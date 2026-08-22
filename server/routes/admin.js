import { Router } from 'express';
import { requireAdmin } from '../lib/supabase.js';
import * as users from '../lib/users.js';
import * as codes from '../lib/supabaseCodes.js';

const router = Router();
router.use(requireAdmin);

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/users', async (_req, res) => {
  try { res.json(await users.listUsers()); } catch { res.status(500).json({ error: { code: 'admin_read_failed', message: 'Impossible de charger les utilisateurs.' } }); }
});

router.get('/activation/stock', async (_req, res) => {
  try { res.json({ backend: 'supabase', ...(await codes.batchStats()) }); } catch { res.status(500).json({ error: { code: 'admin_read_failed', message: 'Impossible de charger le stock.' } }); }
});

router.get('/activation/next', async (req, res) => {
  const plan = ['jour', 'semaine', 'mois'].includes(req.query.plan) ? req.query.plan : 'jour';
  try {
    const code = await codes.peekUnusedCode(plan);
    if (!code) return res.status(404).json({ error: { code: 'empty', message: 'Plus de codes disponibles pour ce plan.' } });
    return res.json({ plan, code });
  } catch {
    return res.status(500).json({ error: { code: 'admin_read_failed', message: 'Impossible de charger le code.' } });
  }
});

router.get('/activation/transactions', async (_req, res) => {
  try { res.json(await codes.listActivationLog()); } catch { res.status(500).json({ error: { code: 'admin_read_failed', message: 'Impossible de charger les transactions.' } }); }
});

export default router;
