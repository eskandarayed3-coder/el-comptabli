import { Router } from 'express';
import { clearSessionCookie, getRequestUser, getServiceClient, requireUser, setSessionCookies } from '../lib/supabase.js';
import * as users from '../lib/users.js';
import { cleanText } from '../lib/validation.js';

const router = Router();

router.post('/session', async (req, res) => {
  const accessToken = cleanText(req.body?.accessToken, 10000);
  const refreshToken = cleanText(req.body?.refreshToken, 10000);
  if (!accessToken || !refreshToken) return res.status(400).json({ error: { code: 'bad_session', message: 'Session de connexion invalide.' } });
  try {
    const { data, error } = await getServiceClient().auth.getUser(accessToken);
    if (error || !data?.user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Session expirée. Reconnecte-toi.' } });
    await users.ensureAccount(data.user);
    setSessionCookies(res, accessToken, refreshToken);
    return res.json({ user: { id: data.user.id, email: data.user.email || '' } });
  } catch {
    return res.status(503).json({ error: { code: 'service_unavailable', message: 'Le service de compte est indisponible.' } });
  }
});

router.get('/me', async (req, res) => {
  try {
    const user = await getRequestUser(req, res);
    if (!user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Non connecté.' } });
    await users.ensureAccount(user);
    const subscription = await users.getSubscription(user.id);
    return res.json({ user: { id: user.id, email: user.email || '' }, subscription });
  } catch {
    return res.status(503).json({ error: { code: 'service_unavailable', message: 'Le service de compte est indisponible.' } });
  }
});

router.post('/signout', (_req, res) => {
  clearSessionCookie(res);
  return res.status(204).end();
});

router.delete('/account', requireUser, async (req, res) => {
  try {
    const { error } = await getServiceClient().auth.admin.deleteUser(req.user.id);
    if (error) throw error;
    clearSessionCookie(res);
    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: { code: 'delete_failed', message: 'Suppression impossible pour le moment. Réessaie ou contacte le support.' } });
  }
});

export default router;
