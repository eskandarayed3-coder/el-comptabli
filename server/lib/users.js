// Real signed-up users — mirrors supabaseCodes.js's pattern: only the
// public anon key is ever used, all access goes through narrow
// security-definer RPCs (upsert_app_user, list_app_users) defined in
// schema.sql, so the table itself stays fully locked behind RLS.
import { createClient } from '@supabase/supabase-js';

export function usersConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY));
}

let client = null;
function getClient() {
  if (!client) {
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
    client = createClient(process.env.SUPABASE_URL, key, { auth: { persistSession: false } });
  }
  return client;
}

export async function upsertUser({ name, email, plan, regime, userType, city, activity }) {
  const sb = getClient();
  const { error } = await sb.rpc('upsert_app_user', {
    p_name: name || '',
    p_email: email,
    p_plan: plan || 'gratuit',
    p_regime: regime || '',
    p_user_type: userType || '',
    p_city: city || '',
    p_activity: activity || '',
  });
  if (error) throw new Error(error.message);
}

export async function listUsers() {
  const sb = getClient();
  const { data, error } = await sb.rpc('list_app_users');
  if (error) throw new Error(error.message);
  return data || [];
}
