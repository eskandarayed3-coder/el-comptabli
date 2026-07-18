// Activation-code engine — runs server-side so the signing salt is never
// shipped to the browser. Codes look like "EC-M39174A2": EC- + plan letter
// (J/S/M) + 4 digits + a 4-char HMAC check. A random string won't pass the
// check, so users can't invent free codes; only the server (with the salt)
// can mint valid ones.
import crypto from 'node:crypto';

const SALT = process.env.CODE_SALT || 'elcomptabli-change-this-salt-in-env';

// Owner's evergreen code: always valid, grants a month pass. Overridable via
// MASTER_CODE in .env; set it to "off" to disable entirely.
const MASTER_CODE = (process.env.MASTER_CODE || '88888888').trim().toUpperCase();

export const PLANS = {
  jour:    { id: 'jour',    letter: 'J', days: 1,  price: 1 },
  semaine: { id: 'semaine', letter: 'S', days: 7,  price: 5 },
  mois:    { id: 'mois',    letter: 'M', days: 30, price: 20 },
};

function checksum(body) {
  return crypto.createHmac('sha256', SALT).update(body).digest('hex').toUpperCase().slice(0, 4);
}

export function generateCode(planId) {
  const p = PLANS[planId];
  if (!p) return null;
  const digits = String(1000 + Math.floor(Math.random() * 9000));
  const body = `${p.letter}${digits}`;
  return `EC-${body}${checksum(body)}`;
}

export function validateCode(raw) {
  const input = String(raw || '').trim().toUpperCase();
  if (MASTER_CODE !== 'OFF' && input === MASTER_CODE) {
    const p = PLANS.mois;
    return { planId: p.id, days: p.days, price: p.price };
  }
  const m = /^EC-([JSM])(\d{4})([0-9A-F]{4})$/.exec(input);
  if (!m) return null;
  const [, letter, digits, chk] = m;
  const body = `${letter}${digits}`;
  if (checksum(body) !== chk) return null;
  const plan = Object.values(PLANS).find((p) => p.letter === letter);
  return { planId: plan.id, days: plan.days, price: plan.price };
}
