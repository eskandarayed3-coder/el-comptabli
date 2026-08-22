// One-time script: creates random one-time activation codes in Supabase.
// Run locally after setting SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY:
// CODE_PLAN=mois CODE_COUNT=50 node server/lib/seed-supabase.js
import 'dotenv/config';
import { insertBatch, supabaseConfigured } from './supabaseCodes.js';
import { generateCode, PLANS } from './codes.js';

if (!supabaseConfigured()) {
  console.error('Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY in .env first.');
  process.exit(1);
}
const plan = PLANS[process.env.CODE_PLAN] ? process.env.CODE_PLAN : 'mois';
const count = Math.min(500, Math.max(1, Number(process.env.CODE_COUNT) || 50));
const batch = Array.from({ length: count }, () => ({ code: generateCode(), plan }));
console.log(`Inserting ${batch.length} one-time ${plan} codes into Supabase...`);
const created = await insertBatch(batch);
console.log('Created codes:', created.map((row) => row.code).join(', '));
