// Supabase-backed single-use codes — same interface as singleUseCodes.js
// (redeemSingleUseCode, batchStats, seedBatch), but permanent: redemption
// state lives in Supabase's Postgres, not on Render's disk, so it survives
// every redeploy and restart. activate.js auto-picks this over the file-
// based version the moment SUPABASE_URL + SUPABASE_SERVICE_KEY are set —
// no other code changes needed.
//
// Setup (one time, ~3 minutes):
//   1. supabase.com → New project (free tier, no card required)
//   2. SQL Editor → paste server/lib/schema.sql → Run
//   3. Project Settings → API → copy "Project URL" and the "service_role"
//      secret key (NOT the "anon public" key — that one must never see codes)
//   4. Add to Render env: SUPABASE_URL=..., SUPABASE_SERVICE_KEY=...
//   5. Run `node server/lib/seed-supabase.js` once (see that file) to load
//      your 300 codes into the new table.
import { createClient } from '@supabase/supabase-js';
import { PLANS } from './codes.js';

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

let client = null;
function getClient() {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function redeemSingleUseCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return null;
  const sb = getClient();

  // Atomic redemption: this UPDATE only succeeds if the row is still
  // used = false, so concurrent requests for the same code can't both win.
  const { data, error } = await sb
    .from('activation_codes')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('code', code)
    .eq('used', false)
    .select('plan')
    .maybeSingle();

  if (error) {
    console.error('supabase redeem error:', error.message);
    return null;
  }
  if (data) {
    const p = PLANS[data.plan];
    return { planId: p.id, days: p.days, price: p.price };
  }

  // Either the code doesn't exist, or it does but was already used — tell
  // those apart so the UI can say "code invalide" vs "déjà utilisé".
  const { data: existing } = await sb.from('activation_codes').select('used').eq('code', code).maybeSingle();
  if (existing?.used) return { alreadyUsed: true };
  return null;
}

export async function batchStats() {
  const sb = getClient();
  const byPlan = {};
  for (const plan of Object.keys(PLANS)) {
    if (plan === 'owner') continue;
    const { count: total } = await sb.from('activation_codes').select('*', { count: 'exact', head: true }).eq('plan', plan);
    const { count: used } = await sb.from('activation_codes').select('*', { count: 'exact', head: true }).eq('plan', plan).eq('used', true);
    byPlan[plan] = { total: total || 0, used: used || 0 };
  }
  return byPlan;
}

// One-time bulk insert, used by seed-supabase.js. ignoreDuplicates means
// re-running this is always safe — an already-redeemed code's `used` flag
// is never touched, only genuinely new codes get added.
export async function insertBatch(rows) {
  const sb = getClient();
  const { error } = await sb.from('activation_codes').upsert(rows, { onConflict: 'code', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}
