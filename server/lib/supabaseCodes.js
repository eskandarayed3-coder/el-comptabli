import { PLANS } from './codes.js';
import { getServiceClient, supabaseConfigured } from './supabase.js';

export { supabaseConfigured };

export async function redeemSingleUseCode(rawCode, userId) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code || !userId) return null;
  const { data, error } = await getServiceClient().rpc('redeem_activation_code', {
    p_code: code,
    p_user_id: userId,
  });
  if (error) throw new Error(`Activation redemption failed: ${error.message}`);
  const row = data?.[0];
  if (!row) return null;
  if (row.already_used) return { alreadyUsed: true };
  const plan = PLANS[row.plan];
  return {
    planId: row.plan,
    days: Number(row.days || plan?.days || 0),
    price: Number(row.price || plan?.price || 0),
    premiumUntil: row.premium_until,
  };
}

export async function grantTrial(userId) {
  const { data, error } = await getServiceClient().rpc('grant_trial_if_available', { p_user_id: userId });
  if (error) throw new Error(`Trial activation failed: ${error.message}`);
  const row = data?.[0];
  if (!row) return { alreadyUsed: true };
  return { alreadyUsed: false, premiumUntil: row.premium_until, days: Number(row.days) };
}

export async function peekUnusedCode(plan) {
  const { data, error } = await getServiceClient()
    .from('activation_codes').select('code').eq('plan', plan).eq('used', false).order('created_at').limit(1);
  if (error) throw new Error(`Code lookup failed: ${error.message}`);
  return data?.[0]?.code || null;
}

export async function batchStats() {
  const { data, error } = await getServiceClient().from('activation_codes').select('plan, used');
  if (error) throw new Error(`Code stats failed: ${error.message}`);
  const byPlan = {};
  for (const row of data || []) {
    byPlan[row.plan] ||= { total: 0, used: 0 };
    byPlan[row.plan].total += 1;
    if (row.used) byPlan[row.plan].used += 1;
  }
  return byPlan;
}

export async function listActivationLog() {
  const { data, error } = await getServiceClient()
    .from('activation_events').select('id, plan, price, code, created_at, profiles(name, email)')
    .order('created_at', { ascending: false }).limit(500);
  if (error) throw new Error(`Activation history failed: ${error.message}`);
  return data || [];
}

export async function insertBatch(rows) {
  const valid = rows.filter((row) => PLANS[row.plan] && /^EC-[A-Z0-9]{16,64}$/.test(row.code));
  if (!valid.length) return [];
  const { data, error } = await getServiceClient()
    .from('activation_codes')
    .upsert(valid.map(({ code, plan }) => ({ code, plan })), { onConflict: 'code', ignoreDuplicates: true })
    .select('code, plan');
  if (error) throw new Error(`Code creation failed: ${error.message}`);
  return data || [];
}
