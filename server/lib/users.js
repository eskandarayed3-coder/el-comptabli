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
    updated_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  };
}

export async function ensureAccount(user, state) {
  const { error } = await getServiceClient().from('profiles').upsert(profileFromState(user, state), { onConflict: 'id' });
  if (error) throw new Error(`Profile sync failed: ${error.message}`);
}

export async function saveState(user, state) {
  await ensureAccount(user, state);
  const { error } = await getServiceClient().from('app_state').upsert({
    user_id: user.id,
    data: state,
    schema_version: Number(state.__v || 1),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw new Error(`State sync failed: ${error.message}`);
}

export async function getState(user) {
  await ensureAccount(user);
  const [{ data: stateRow, error: stateError }, { data: subscription, error: subscriptionError }] = await Promise.all([
    getServiceClient().from('app_state').select('data, updated_at').eq('user_id', user.id).maybeSingle(),
    getServiceClient().from('subscriptions').select('plan, premium_until').eq('user_id', user.id).maybeSingle(),
  ]);
  if (stateError || subscriptionError) throw new Error('Account state lookup failed.');
  return { data: stateRow?.data || null, updatedAt: stateRow?.updated_at || null, subscription: subscription || { plan: 'free', premium_until: null } };
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
