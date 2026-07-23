// Pre-generated, single-use activation codes — for real one-time sales,
// unlike the algorithmic EC- codes (which are re-usable by anyone who learns
// one) or the evergreen MASTER_CODE/OWNER_CODE.
//
// The codes themselves live in the CODE_BATCH env var (a JSON array), never
// in git — this repo is public, so committing them would let anyone on
// GitHub redeem your stock before a real customer does. On first read, the
// batch is copied from CODE_BATCH into a local working file (server/data/
// codes-state.json, gitignored) where "used" flags get written as codes are
// redeemed.
//
// Honest limitation: that working file lives on Render's disk, which is NOT
// persistent — a redeploy or container restart resets it back to the
// CODE_BATCH original (all-unused). The keep-alive workflow (pings every
// 10 min) keeps the process from sleeping, so in practice this survives
// normal operation, but it is not bulletproof. Wire up Supabase (see
// server/lib/supabase.example.js) to make single-use tracking permanent.
import fs from 'node:fs';
import path from 'node:path';
import { PLANS } from './codes.js';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STATE_FILE = path.join(DATA_DIR, 'codes-state.json');

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch { /* corrupt file — rebuild from env */ }
  }
  const raw = process.env.CODE_BATCH;
  if (!raw) return [];
  try {
    const batch = JSON.parse(raw);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(batch));
    return batch;
  } catch {
    return [];
  }
}

function saveState(batch) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(batch));
}

export function redeemSingleUseCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  const batch = loadState();
  const entry = batch.find((c) => c.code === code);
  if (!entry) return null;
  if (entry.used) return { alreadyUsed: true };
  entry.used = true;
  entry.usedAt = new Date().toISOString();
  saveState(batch);
  const p = PLANS[entry.plan];
  return { planId: p.id, days: p.days, price: p.price };
}

// Returns one still-unused code for a plan, without marking it used — lets
// the owner hand it out (e.g. via /admin/codes) knowing it's guaranteed
// fresh, without any manual bookkeeping in a separate list.
export function peekUnusedCode(plan) {
  const batch = loadState();
  const entry = batch.find((c) => c.plan === plan && !c.used);
  return entry ? entry.code : null;
}

// Owner-facing stock counter, e.g. for a small admin check.
export function batchStats() {
  const batch = loadState();
  const byPlan = {};
  for (const c of batch) {
    byPlan[c.plan] ||= { total: 0, used: 0 };
    byPlan[c.plan].total += 1;
    if (c.used) byPlan[c.plan].used += 1;
  }
  return byPlan;
}

// Same append-only transaction log as supabaseCodes.js, but on disk — only
// used when Supabase isn't configured (local dev). Subject to the same
// ephemeral-disk caveat as the codes state file above.
const LOG_FILE = path.join(DATA_DIR, 'activation-log.json');

export function logActivation({ code, plan, price, email }) {
  let log = [];
  if (fs.existsSync(LOG_FILE)) {
    try { log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch { /* corrupt — start fresh */ }
  }
  log.unshift({ code, plan, price, email: email || null, created_at: new Date().toISOString() });
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log.slice(0, 500)));
}

export function listActivationLog() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); } catch { return []; }
}
