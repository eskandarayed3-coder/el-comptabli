// Supabase-backed single-use codes — same interface as singleUseCodes.js
// (redeemSingleUseCode, batchStats, seedBatch), but permanent: redemption
// state lives in Supabase's Postgres, not on Render's disk, so it survives
// every redeploy and restart. activate.js auto-picks this over the file-
// based version the moment SUPABASE_URL + SUPABASE_ANON_KEY are set —
// no other code changes needed.
//
// Security note: redemption goes through the `redeem_activation_code` and
// `activation_code_stats` Postgres functions (security definer, see
// schema.sql), so only the PUBLIC anon key is ever needed here — never the
// service_role secret. The anon key has zero direct table access (RLS with
// no policies); it can only call these two narrow, single-purpose functions.
//
// Setup (one time):
//   1. supabase.com → New project (free tier, no card required)
//   2. SQL Editor → paste server/lib/schema.sql → Run
//   3. Project Settings → API → copy "Project URL" and the "anon public" key
//   4. Add to Render env: SUPABASE_URL=..., SUPABASE_ANON_KEY=...
//   5. To seed codes into a fresh project, use `insertBatch` below with the
//      service_role key set locally as SUPABASE_SERVICE_KEY (one-time only,
//      never deployed) — see seed-supabase.js.
import { createClient } from '@supabase/supabase-js';
import { PLANS } from './codes.js';

export function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY));
}

let client = null;
function getClient() {
  if (!client) {
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
    client = createClient(process.env.SUPABASE_URL, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function redeemSingleUseCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return null;
  const sb = getClient();

  // Atomic redemption via RPC (see redeem_activation_code in schema.sql) —
  // the UPDATE inside only succeeds if the row is still used = false, so
  // concurrent requests for the same code can't both win.
  const { data, error } = await sb.rpc('redeem_activation_code', { p_code: code });

  if (error) {
    console.error('supabase redeem error:', error.message);
    return null;
  }
  const row = data?.[0];
  if (!row) return null;
  if (row.already_used) return { alreadyUsed: true };
  const p = PLANS[row.plan];
  return { planId: p.id, days: p.days, price: p.price };
}

export async function batchStats() {
  const sb = getClient();
  const { data, error } = await sb.rpc('activation_code_stats');
  if (error) {
    console.error('supabase stats error:', error.message);
    return {};
  }
  const byPlan = {};
  for (const row of data || []) {
    byPlan[row.plan] = { total: Number(row.total), used: Number(row.used) };
  }
  return byPlan;
}

// One-time bulk insert, used by seed-supabase.js only. This needs the
// service_role key specifically (RLS blocks anon from writing directly) —
// run locally with SUPABASE_SERVICE_KEY set in your shell, never deployed.
// ignoreDuplicates means re-running this is always safe — an already-
// redeemed code's `used` flag is never touched, only new codes get added.
export async function insertBatch(rows) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY required for insertBatch (seeding), not for normal server operation.');
  }
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
  const { error } = await sb.from('activation_codes').upsert(rows, { onConflict: 'code', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}
