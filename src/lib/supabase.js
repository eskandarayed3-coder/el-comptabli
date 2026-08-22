import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

// This client is used only to complete Supabase's email-link flow. Sessions
// are immediately exchanged for HttpOnly, same-site application cookies so
// financial data is never accessed from a browser database client.
export const supabase = supabaseConfigured
  ? createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
  })
  : null;
