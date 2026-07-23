import { Router } from 'express';
import * as users from '../lib/users.js';

const router = Router();

// Called once onboarding collects a real email — upserts by email, so
// re-running it (e.g. after activating a plan) just updates the same row.
router.post('/', async (req, res) => {
  if (!users.usersConfigured()) {
    return res.status(503).json({ error: { code: 'not_configured', message: 'Base de données non configurée.' } });
  }
  const { name, email, plan, regime, userType, city, activity, premiumUntil } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: { code: 'bad_email', message: 'Email invalide.' } });
  }
  try {
    await users.upsertUser({ name, email, plan, regime, userType, city, activity, premiumUntil });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: { code: 'server_error', message: e.message } });
  }
});

// Account recovery: given an email, return enough to restore local state
// on a new device (plan, premiumUntil, profile basics). Not admin-gated —
// this is the whole point, a user recovering their own access — but only
// ever returns non-sensitive fields already visible to the account owner.
router.get('/recover', async (req, res) => {
  if (!users.usersConfigured()) {
    return res.status(503).json({ error: { code: 'not_configured', message: 'Service indisponible.' } });
  }
  const email = String(req.query.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: { code: 'bad_email', message: 'Email invalide.' } });
  }
  try {
    const row = await users.getUserByEmail(email);
    if (!row) return res.status(404).json({ error: { code: 'not_found', message: 'Aucun compte trouvé avec cet email.' } });
    res.json(row);
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
