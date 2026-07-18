// Routes reachable even with no active pass — onboarding, auth, and the
// screens needed to actually buy/activate a pass. Everything else is behind
// the hard paywall once onboarding is done.
const ALLOW_EXACT = [
  '/', '/splash', '/welcome', '/language', '/user-type', '/business-info',
  '/tax-regime', '/ai-intro', '/subscription-select', '/permissions', '/setup-complete',
  '/login', '/register', '/forgot-password', '/otp',
];
const ALLOW_PREFIX = ['/pricing', '/payment', '/billing', '/profile', '/security'];

export function isPaywallAllowed(pathname) {
  if (ALLOW_EXACT.includes(pathname)) return true;
  return ALLOW_PREFIX.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
