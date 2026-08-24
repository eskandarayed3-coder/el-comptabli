// Investment appraisal math — corporate finance (VAN, TRI, DRCI, DRA, IP).
// All amounts in DT. `flows` = array of net cash flows for years 1..n.
// `invest` = initial outlay at t0 (a positive number). `rate` = discount rate (e.g. 0.10).

// VAN / NPV = -I0 + Σ CFt / (1+r)^t
export function computeVAN(invest, flows, rate) {
  const I0 = Math.max(0, Number(invest) || 0);
  const r = Number(rate) || 0;
  let npv = -I0;
  flows.forEach((cf, i) => {
    npv += (Number(cf) || 0) / Math.pow(1 + r, i + 1);
  });
  return npv;
}

// TRI / IRR — the rate where VAN = 0. Solved by bisection on [-0.99, 10].
// Returns null if no sign change (no real IRR in range).
export function computeTRI(invest, flows) {
  const f = (r) => computeVAN(invest, flows, r);
  let lo = -0.9;
  let hi = 10;
  let flo = f(lo);
  const fhi = f(hi);
  if (flo * fhi > 0) return null; // no sign change → no IRR found
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const fmid = f(mid);
    if (Math.abs(fmid) < 1e-6) return mid;
    if (flo * fmid < 0) { hi = mid; }
    else { lo = mid; flo = fmid; }
  }
  return (lo + hi) / 2;
}

// IP / Profitability Index = (Σ discounted CF) / I0. > 1 means value-creating.
export function computeIP(invest, flows, rate) {
  const I0 = Math.max(0, Number(invest) || 0);
  if (I0 === 0) return null;
  const r = Number(rate) || 0;
  const pv = flows.reduce((s, cf, i) => s + (Number(cf) || 0) / Math.pow(1 + r, i + 1), 0);
  return pv / I0;
}

// Payback helper: walks cumulative cash flows until they cover I0.
// If `discounted`, each flow is divided by (1+r)^t first.
// Returns years as a decimal (linear interpolation within the crossing year), or null if never recovered.
function payback(invest, flows, rate, discounted) {
  const I0 = Math.max(0, Number(invest) || 0);
  const r = Number(rate) || 0;
  let cum = 0;
  for (let i = 0; i < flows.length; i++) {
    const raw = Number(flows[i]) || 0;
    const cf = discounted ? raw / Math.pow(1 + r, i + 1) : raw;
    const before = cum;
    cum += cf;
    if (cum >= I0) {
      const need = I0 - before;      // amount still missing at start of this year
      const frac = cf > 0 ? need / cf : 0;
      return i + frac;                // e.g. 2.4 = during year 3
    }
  }
  return null; // capital never fully recovered
}

// DRCI — Délai de Récupération du Capital Investi (simple payback, undiscounted).
export function computeDRCI(invest, flows) {
  return payback(invest, flows, 0, false);
}

// DRA — Délai de Récupération Actualisé (discounted payback).
export function computeDRA(invest, flows, rate) {
  return payback(invest, flows, rate, true);
}

// One call → every indicator, plus the discounted-flow table for display.
export function appraiseInvestment({ invest, flows, rate }) {
  const r = Number(rate) || 0;
  const van = computeVAN(invest, flows, r);
  const tri = computeTRI(invest, flows);
  const ip = computeIP(invest, flows, r);
  const drci = computeDRCI(invest, flows);
  const dra = computeDRA(invest, flows, r);
  const rows = flows.map((cf, i) => {
    const t = i + 1;
    const discounted = (Number(cf) || 0) / Math.pow(1 + r, t);
    return { year: t, flow: Number(cf) || 0, discounted };
  });
  return { van, tri, ip, drci, dra, rows };
}
