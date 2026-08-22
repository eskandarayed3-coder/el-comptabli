import { Router } from 'express';
import { requireUser } from '../lib/supabase.js';
import { validateState } from '../lib/validation.js';
import * as users from '../lib/users.js';

const router = Router();
router.use(requireUser);

router.get('/', async (req, res) => {
  try {
    res.json(await users.getState(req.user));
  } catch {
    res.status(500).json({ error: { code: 'state_read_failed', message: 'Impossible de charger tes données.' } });
  }
});

router.put('/', async (req, res) => {
  const state = validateState(req.body?.data);
  if (!state) return res.status(400).json({ error: { code: 'bad_state', message: 'Données de sauvegarde invalides ou trop volumineuses.' } });
  try {
    await users.saveState(req.user, state);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: { code: 'state_save_failed', message: 'Impossible de sauvegarder tes données.' } });
  }
});

export default router;
