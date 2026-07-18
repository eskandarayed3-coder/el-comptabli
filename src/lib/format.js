// Currency / date helpers. Amounts stay in Latin digits even in Arabic UI
// (standard practice in Tunisian fintech), wrapped in .num for LTR isolation.
// toLocaleString('fr-FR') already joins digit groups ("1 276") with a
// non-breaking U+202F, so a plain breakable space before "DT" is enough to
// let long balances wrap between the number and the unit -- never mid-number --
// instead of overflowing narrow containers like stat cards.

export function fmtDT(n, { sign = false, decimals = null } = {}) {
  if (n == null || Number.isNaN(Number(n))) return 'N/D';
  const num = Number(n);
  const d = decimals == null ? (Number.isInteger(num) ? 0 : 3) : decimals;
  const abs = Math.abs(num).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const s = sign && num > 0 ? '+' : num < 0 ? '−' : '';
  return `${s}${abs} DT`;
}

export function fmtDate(iso, lang = 'fr', opts = { day: 'numeric', month: 'long' }) {
  if (!iso) return 'N/D';
  const d = typeof iso === 'string' ? new Date(`${iso.slice(0, 10)}T12:00:00`) : iso;
  return d.toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-TN', opts);
}

export function fmtMonth(iso, lang = 'fr') {
  return fmtDate(iso, lang, { month: 'long', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(iso) {
  const a = new Date(`${todayISO()}T12:00:00`);
  const b = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
