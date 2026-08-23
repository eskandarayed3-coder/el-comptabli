import { cleanText } from './validation.js';
import { getServiceClient, supabaseConfigured } from './supabase.js';

export function usersConfigured() {
  return supabaseConfigured();
}

function profileFromState(user, state = {}) {
  const profile = state.profile || {};
  // Anonymous Supabase users have no email. Store a private, unique placeholder
  // so the profiles email uniqueness constraint still protects real accounts.
  const email = cleanText(user.email, 254).toLowerCase() || `anonymous-${user.id}@trial.invalid`;
  return {
    id: user.id,
    email,
    name: cleanText(profile.name, 120),
    regime: cleanText(profile.regime, 40),
    user_type: cleanText(profile.userType, 40),
    city: cleanText(profile.city, 100),
    activity: cleanText(profile.activity, 160),
    phone: cleanText(profile.phone, 40),
    sector: cleanText(profile.sector, 120),
    updated_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  };
}

export async function ensureAccount(user, state) {
  const profile = profileFromState(user, state);
  const client = getServiceClient();
  const { error } = await client.from('profiles').upsert(profile, { onConflict: 'id' });
  if (!error) return ensureOrganization(user, profile);
  // Two parallel first requests can race on the secondary lower(email) index
  // before the primary-key upsert sees the row. Once the winning insert is
  // committed, updating that exact user is safe and makes initialization
  // idempotent without weakening email uniqueness.
  if (error.code === '23505') {
    const { data, error: retryError } = await client.from('profiles')
      .update(profile)
      .eq('id', user.id)
      .select('id')
      .maybeSingle();
    if (!retryError && data?.id === user.id) return ensureOrganization(user, profile);
  }
  throw new Error(`Profile sync failed: ${error.message}`);
}

async function ensureOrganization(user, profile) {
  const client = getServiceClient();
  const { data: membership, error } = await client.from('organization_members')
    .select('organization_id').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle();
  if (error) throw new Error(`Organization lookup failed: ${error.message}`);
  if (membership?.organization_id) return membership.organization_id;
  const name = cleanText(profile.name, 160) || cleanText(String(profile.email || '').split('@')[0], 160) || 'Mon organisation';
  const { data, error: createError } = await client.rpc('ensure_user_organization', { p_actor_id: user.id, p_name: name });
  if (createError) throw new Error(`Organization initialization failed: ${createError.message}`);
  return data || null;
}

export async function getSubscription(userId) {
  const { data, error } = await getServiceClient().from('subscriptions').select('plan, premium_until').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(`Subscription lookup failed: ${error.message}`);
  return data || { plan: 'free', premium_until: null };
}

export async function listUsers() {
  const { data, error } = await getServiceClient()
    .from('profiles')
    .select('id, name, email, regime, user_type, city, activity, created_at, last_active_at, subscriptions(plan, premium_until)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`User list failed: ${error.message}`);
  return (data || []).map((row) => {
    const subscription = Array.isArray(row.subscriptions) ? row.subscriptions[0] : row.subscriptions;
    return { ...row, plan: subscription?.plan || 'free', premium_until: subscription?.premium_until || null };
  });
}
