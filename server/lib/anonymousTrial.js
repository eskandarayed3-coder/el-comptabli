const TRIAL_MS = 24 * 60 * 60 * 1000;

// The Supabase token is verified before this fallback is used. The fallback
// only keeps the no-email preview usable while persistence tables are being
// repaired; it never creates a session or grants access by itself.
export function anonymousTrialSubscription(user, now = Date.now()) {
  const createdAt = Date.parse(user?.created_at || '');
  if (!Number.isFinite(createdAt)) return { plan: 'free', premium_until: null };
  const premiumUntil = new Date(createdAt + TRIAL_MS).toISOString();
  return createdAt + TRIAL_MS > now
    ? { plan: 'premium', premium_until: premiumUntil }
    : { plan: 'free', premium_until: premiumUntil };
}

export { TRIAL_MS };
