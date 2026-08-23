export const DEFAULT_AUTH_NEXT = '/home';

const INTERNAL_BASE = 'https://el-comptabli.invalid';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function normalizeOrigin(value) {
  try {
    const url = new URL(String(value || '').trim());
    const localHttp = url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname);
    if (url.protocol !== 'https:' && !localHttp) return '';
    if (url.username || url.password) return '';
    return url.origin;
  } catch {
    return '';
  }
}

export function resolveAppOrigin({ configuredOrigin, browserOrigin } = {}) {
  const configured = normalizeOrigin(configuredOrigin);
  if (configured) return configured;

  const browser = normalizeOrigin(browserOrigin);
  if (browser) return browser;

  throw new Error('Origine de connexion invalide.');
}

export function safeInternalNext(value, fallback = DEFAULT_AUTH_NEXT) {
  const candidate = String(value || '').trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) return fallback;
  if (/\p{Cc}/u.test(candidate)) return fallback;

  try {
    // Reject encoded protocol-relative paths and encoded backslashes before a
    // router or browser gets a chance to normalize them into another origin.
    let decoded = candidate;
    for (let index = 0; index < 2; index += 1) decoded = decodeURIComponent(decoded);
    if (decoded.startsWith('//') || decoded.includes('\\')) return fallback;

    const url = new URL(candidate, INTERNAL_BASE);
    if (url.origin !== INTERNAL_BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function buildMagicLinkRedirect({ configuredOrigin, browserOrigin, next } = {}) {
  const origin = resolveAppOrigin({ configuredOrigin, browserOrigin });
  const redirect = new URL('/auth/callback', origin);
  redirect.searchParams.set('next', safeInternalNext(next));
  return redirect.toString();
}

export function authCallbackDestination(searchParams) {
  const params = searchParams instanceof URLSearchParams
    ? searchParams
    : new URLSearchParams(String(searchParams || ''));
  return safeInternalNext(params.get('next'));
}
