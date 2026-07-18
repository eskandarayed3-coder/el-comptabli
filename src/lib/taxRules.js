// Tunisian tax rules used by the calculators.
// ⚠️ Repères pédagogiques — à VÉRIFIER contre le JORT / Loi de finances en vigueur.
export const BAREME_YEAR = 2026;

export const TVA_RATES = [19, 13, 7];

// Barème IRPP progressif (8 tranches). Source à confirmer : LF 2025/2026.
export const IRPP_BRACKETS = [
  { upTo: 5000, rate: 0 },
  { upTo: 10000, rate: 0.15 },
  { upTo: 20000, rate: 0.25 },
  { upTo: 30000, rate: 0.30 },
  { upTo: 40000, rate: 0.33 },
  { upTo: 50000, rate: 0.36 },
  { upTo: 70000, rate: 0.38 },
  { upTo: Infinity, rate: 0.40 },
];

// Déductions pour charges de famille (appliquées sur l'impôt dû).
// Montants indicatifs — à confirmer avec la LF en vigueur.
export const DEDUCTION_CHEF_FAMILLE = 150;      // DT
export const DEDUCTION_PAR_ENFANT = 100;        // DT / enfant à charge
export const MAX_ENFANTS_DEDUITS = 4;
export const DEDUCTION_ENFANT_HANDICAPE = 1000; // DT / enfant en situation de handicap (pas de max)
export const DEDUCTION_PAR_PARENT = 150;        // DT / parent à charge
export const MAX_PARENTS_DEDUITS = 2;

// Returns { gross, deductions, deductionDetail, total, lines }.
// opts: { chefFamille, enfants, enfantsHandicapes, parentsACharge }
export function computeIRPP(netAnnual, opts = {}) {
  const net = Math.max(0, Number(netAnnual) || 0);
  const chefFamille = Boolean(opts.chefFamille);
  const enfants = Math.max(0, Math.min(MAX_ENFANTS_DEDUITS, Number(opts.enfants) || 0));
  const enfantsHandicapes = Math.max(0, Number(opts.enfantsHandicapes) || 0);
  const parentsACharge = Math.max(0, Math.min(MAX_PARENTS_DEDUITS, Number(opts.parentsACharge) || 0));

  let prev = 0;
  let gross = 0;
  const lines = [];
  for (const { upTo, rate } of IRPP_BRACKETS) {
    if (net <= prev) break;
    const base = Math.min(net, upTo) - prev;
    const tax = base * rate;
    gross += tax;
    lines.push({ from: prev, to: upTo, base, rate, tax });
    prev = upTo;
  }

  const deductionDetail = [
    chefFamille && { label: 'Chef de famille', amount: DEDUCTION_CHEF_FAMILLE },
    enfants > 0 && { label: `${enfants} enfant${enfants > 1 ? 's' : ''} à charge`, amount: enfants * DEDUCTION_PAR_ENFANT },
    enfantsHandicapes > 0 && { label: `${enfantsHandicapes} enfant${enfantsHandicapes > 1 ? 's' : ''} en situation de handicap`, amount: enfantsHandicapes * DEDUCTION_ENFANT_HANDICAPE },
    parentsACharge > 0 && { label: `${parentsACharge} parent${parentsACharge > 1 ? 's' : ''} à charge`, amount: parentsACharge * DEDUCTION_PAR_PARENT },
  ].filter(Boolean);

  const deductions = deductionDetail.reduce((s, d) => s + d.amount, 0);
  const total = Math.max(0, Math.round(gross - deductions));
  return { gross: Math.round(gross), deductions, deductionDetail, total, lines };
}

// CNSS — régime des travailleurs non-salariés (indépendants / TNS).
// Le revenu de référence est choisi par classe, en multiples du SMIG mensuel.
// Montants indicatifs — à confirmer auprès de la CNSS.
export const SMIG_MENSUEL = 528.32;   // DT / mois (régime 48h)
export const CNSS_TNS_RATE = 0.1471;  // 14,71 % du revenu de référence
export const CNSS_CLASSES = [1, 1.5, 2, 3, 4, 6, 9, 12, 15, 18]; // × SMIG

export function computeCNSS(classe) {
  const c = Number(classe) || 1;
  const revenuMensuel = c * SMIG_MENSUEL;
  const mensuel = revenuMensuel * CNSS_TNS_RATE;
  return {
    classe: c,
    revenuMensuel,
    mensuel,
    trimestriel: mensuel * 3,
    annuel: mensuel * 12,
  };
}

export function computeTVA({ amount, rate = 19, direction = 'HT_TO_TTC' }) {
  const a = Number(amount) || 0;
  const r = rate / 100;
  if (direction === 'HT_TO_TTC') {
    const tva = a * r;
    return { ht: a, tva, ttc: a + tva, formula: `${a} × ${(1 + r).toLocaleString('fr-FR')} = ${(a + tva).toLocaleString('fr-FR')}` };
  }
  const ht = a / (1 + r);
  return { ht, tva: a - ht, ttc: a, formula: `${a} ÷ ${(1 + r).toLocaleString('fr-FR')} = ${ht.toLocaleString('fr-FR')}` };
}

// Simplified estimator for screen 51 (segmented TVA | IRPP over annual figures).
export function estimateTaxes({ caAnnual, charges, regime = 'reel' }) {
  const ca = Number(caAnnual) || 0;
  const ch = Number(charges) || 0;
  const net = Math.max(0, ca - ch);
  if (regime === 'forfaitaire') {
    // Forfaitaire: liberatory levy on turnover (simplified: 0.5% CA, min 200/400 DT).
    const impot = Math.max(ca * 0.005, ca > 0 ? 200 : 0);
    return { tva: 0, irpp: Math.round(impot), net: Math.round(net - impot), lines: [`${ca} × 0,5 % = ${Math.round(ca * 0.005)} DT (minimum 200 DT)`] };
  }
  const tvaDue = Math.round(ca * 0.19 * 0.25); // rough: 19% collected minus deductible ≈ 25% net position
  const { total: irpp, lines } = computeIRPP(net);
  return {
    tva: tvaDue,
    irpp,
    net: Math.round(net - irpp),
    lines: lines.filter((l) => l.base > 0).map((l) => `${l.base.toLocaleString('fr-FR')} × ${Math.round(l.rate * 100)} % = ${Math.round(l.tax).toLocaleString('fr-FR')} DT`),
  };
}

export const CATEGORIES = [
  { id: 'loyer', fr: 'Loyer', ar: 'الكراء', icon: 'Home' },
  { id: 'achats', fr: 'Achats', ar: 'الشراءات', icon: 'ShoppingBag' },
  { id: 'carburant', fr: 'Carburant', ar: 'الإسانس', icon: 'Fuel' },
  { id: 'electricite', fr: 'Électricité & eau', ar: 'الضو والماء', icon: 'Zap' },
  { id: 'telecom', fr: 'Télécom & internet', ar: 'التيليفون والإنترنات', icon: 'Wifi' },
  { id: 'salaires', fr: 'Salaires', ar: 'الشهريات', icon: 'Users' },
  { id: 'impots', fr: 'Impôts & taxes', ar: 'الضرايب', icon: 'Landmark' },
  { id: 'ventes', fr: 'Ventes & services', ar: 'البيع والخدمات', icon: 'TrendingUp' },
  { id: 'autres', fr: 'Autres', ar: 'أخرى', icon: 'MoreHorizontal' },
];

export function categoryLabel(id, lang = 'fr') {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c[lang === 'ar' ? 'ar' : 'fr'] : (id || '');
}
