const REQUIRED_PRODUCTION_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
];

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function serviceRoleKey() {
  // Keep the previous name as a temporary deployment migration path. New
  // environments must use SUPABASE_SERVICE_ROLE_KEY.
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
}

export function publishableKey() {
  return process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
}

export function assertProductionConfig() {
  if (!isProduction()) return;
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => {
    if (name === 'SUPABASE_SERVICE_ROLE_KEY') return !serviceRoleKey();
    if (name === 'SUPABASE_PUBLISHABLE_KEY') return !publishableKey();
    return !String(process.env[name] || '').trim();
  });
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}
