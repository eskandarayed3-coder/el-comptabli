// One-time script: loads the CODE_BATCH codes into Supabase.
// Run locally after setting SUPABASE_URL + SUPABASE_SERVICE_KEY + CODE_BATCH
// in your .env:   node server/lib/seed-supabase.js
import 'dotenv/config';
import { insertBatch, supabaseConfigured } from './supabaseCodes.js';

if (!supabaseConfigured()) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env first.');
  process.exit(1);
}
if (!process.env.CODE_BATCH) {
  console.error('Set CODE_BATCH in .env first (the same JSON array used for the file-based system).');
  process.exit(1);
}

const batch = JSON.parse(process.env.CODE_BATCH).map(({ code, plan }) => ({ code, plan, used: false }));
console.log(`Inserting ${batch.length} codes into Supabase...`);
await insertBatch(batch);
console.log('Done. Run again any time to add more codes (existing ones are left untouched by conflict).');
