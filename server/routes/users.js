import { Router } from 'express';
import * as users from '../lib/users.js';

const router = Router();

// Called once onboarding collects a real email — upserts by email, so
// re-running it (e.g. after activating a plan) just updates the same row.
router.post('/', async (req, res) => {
  if (!users.usersConfigured()) {
    return res.status(503).json({ error: { code: 'not_configured', message: 'Base de données non configurée.' } });
  }
  const { name, email, plan, regime, userType, city, activity } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: { code: 'bad_email', message: 'Email invalide.' } });
  }
  try {
    await users.upsertUser({ name, email, plan, regime, userType, city, activity });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: { code: 'server_error', message: e.message } });
  }
});

// Owner-only: full user list for the admin panel.
router.get('/', async (req, res) => {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(403).json({ error: { code: 'forbidden', message: 'Accès refusé.' } });
  }
  if (!users.usersConfigured()) return res.json([]);
  try {
    res.json(await users.listUsers());
  } catch (e) {
    res.status(500).json({ error: { code: 'server_error', message: e.message } });
  }
});

export default router;
