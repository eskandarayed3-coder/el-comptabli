import crypto from 'node:crypto';

export const PLANS = {
  jour: { id: 'jour', days: 1, price: 1 },
  semaine: { id: 'semaine', days: 7, price: 5 },
  mois: { id: 'mois', days: 30, price: 20 },
};

// A code is an opaque 96-bit random secret. It has no reusable master-code or
// algorithmic fallback: redemption is only possible when the code exists in
// the database and its one-time state is still unused.
export function generateCode() {
  return `EC-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
}
