import { Router } from 'express';
import { accessTokenFromRequest, clearSessionCookie, getRequestUser, getServiceClient, requireUser, setSessionCookies } from '../lib/supabase.js';
import * as users from '../lib/users.js';
import * as codes from '../lib/supabaseCodes.js';
import { cleanText } from '../lib/validation.js';
import { anonymousTrialSubscription } from '../lib/anonymousTrial.js';

const router = Router();

router.post('/session', async (req, res) => {
  const accessToken = cleanText(req.body?.accessToken, 10000);
  const refreshToken = cleanText(req.body?.refreshToken, 10000);
  if (!accessToken || !refreshToken) return res.status(400).json({ error: { code: 'bad_session', message: 'Session de connexion invalide.' } });
  try {
    const { data, error } = await getServiceClient().auth.getUser(accessToken);
    if (error || !data?.user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Session expirée. Reconnecte-toi.' } });
    let subscription;
    try {
      await users.ensureAccount(data.user);
      // A visitor who starts the no-email trial is still authenticated with
      // Supabase. Grant the one-day pass server-side, never in the browser.
      if (data.user.is_anonymous) await codes.grantTrial(data.user.id);
      subscription = await users.getSubscription(data.user.id);
    } catch (persistenceError) {
      if (!data.user.is_anonymous) throw persistenceError;
      // A valid anonymous token is still safe to use for the temporary trial.
      // Keep the app usable while a missing profile/subscription table is fixed.
      subscription = anonymousTrialSubscription(data.user);
      console.warn('anonymous trial using temporary persistence fallback');
    }
    setSessionCookies(res, accessToken, refreshToken);
    return res.json({
      user: { id: data.user.id, email: data.user.email || '', isAnonymous: Boolean(data.user.is_anonymous) },
      subscription,
    });
  } catch {
    return res.status(503).json({ error: { code: 'service_unavailable', message: 'Le service de compte est indisponible.' } });
  }
});

router.get('/me', async (req, res) => {
  try {
    const user = await getRequestUser(req, res);
    if (!user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Non connecté.' } });
    let subscription;
    try {
      await users.ensureAccount(user);
      subscription = await users.getSubscription(user.id);
    } catch (persistenceError) {
      if (!user.is_anonymous) throw persistenceError;
      subscription = anonymousTrialSubscription(user);
      console.warn('anonymous session using temporary persistence fallback');
    }
    return res.json({ user: { id: user.id, email: user.email || '', isAnonymous: Boolean(user.is_anonymous) }, subscription });
  } catch {
    return res.status(503).json({ error: { code: 'service_unavailable', message: 'Le service de compte est indisponible.' } });
  }
});

router.post('/signout', async (req, res) => {
  const accessToken = accessTokenFromRequest(req);
  if (accessToken) {
    const { error } = await getServiceClient().auth.admin.signOut(accessToken, 'local');
    if (error) console.warn('session revocation failed:', error.message);
  }
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
