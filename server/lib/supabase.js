import { createClient } from '@supabase/supabase-js';
import { publishableKey, serviceRoleKey } from './env.js';

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && serviceRoleKey() && publishableKey());
}

let serviceClient = null;
export function getServiceClient() {
  if (!supabaseConfigured()) throw new Error('Supabase is not configured.');
  if (!serviceClient) {
    serviceClient = createClient(process.env.SUPABASE_URL, serviceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}

// User access/refresh tokens must never be installed on the singleton
// service-role client. Supabase auth.refreshSession mutates its client session;
// sharing that client would make later privileged queries run as the user.
export function createRequestAuthClient(factory = createClient) {
  if (!supabaseConfigured()) throw new Error('Supabase is not configured.');
  return factory(process.env.SUPABASE_URL, publishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function readCookie(req, name) {
  const header = String(req.headers.cookie || '');
  const item = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!item) return '';
  try { return decodeURIComponent(item.slice(name.length + 1)); } catch { return ''; }
}

export function accessTokenFromRequest(req) {
  const bearer = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer || readCookie(req, 'ec_session');
}

export async function getRequestUser(req, res) {
  const token = accessTokenFromRequest(req);
  if (!supabaseConfigured()) return null;
  const authClient = createRequestAuthClient();
  if (token) {
    const { data, error } = await authClient.auth.getUser(token);
    if (!error && data?.user) return data.user;
  }
  const refreshToken = readCookie(req, 'ec_refresh');
  if (!refreshToken) return null;
  const refreshed = await authClient.auth.refreshSession({ refresh_token: refreshToken });
  if (refreshed.error || !refreshed.data?.session?.user) return null;
  if (res) setSessionCookies(res, refreshed.data.session.access_token, refreshed.data.session.refresh_token);
  return refreshed.data.session.user;
}

export async function requireUser(req, res, next) {
  try {
    const user = await getRequestUser(req, res);
    if (!user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Connecte-toi pour continuer.' } });
    req.user = user;
    return next();
  } catch {
    return res.status(503).json({ error: { code: 'service_unavailable', message: 'Le service de compte est indisponible.' } });
  }
}

export async function requireAdmin(req, res, next) {
  const user = await getRequestUser(req, res);
  const allowed = String(process.env.ADMIN_EMAILS || '')
    .split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!user || !user.email || !allowed.includes(user.email.toLowerCase())) {
    return res.status(403).json({ error: { code: 'forbidden', message: 'Accès administrateur requis.' } });
  }
  req.user = user;
  return next();
}

export function setSessionCookies(res, token, refreshToken, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', [
    `ec_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`,
    `ec_refresh=${encodeURIComponent(refreshToken)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secure}`,
  ]);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', [
    `ec_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
    `ec_refresh=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
  ]);
}
