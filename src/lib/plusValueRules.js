// Plus-value immobilière (real estate capital gains) — standard case only:
// a property bought (not inherited/donated) and later sold, no oversized
// principal-residence lot (>1000 m² triggers a different formula this tool
// does not attempt). Matches the computation chain on the official
// "Déclaration de la plus-value immobilière" form.
export function computePlusValue({ prixCession, coutAcquisition, depenses, anneeAcquisition, anneeCession, taux }) {
  const px = Number(prixCession) || 0;
  const cout = Number(coutAcquisition) || 0;
  const dep = Number(depenses) || 0;
  const years = Math.max(0, (Number(anneeCession) || 0) - (Number(anneeAcquisition) || 0));

  // 10% forfaitaire per year of possession, applied to both the acquisition
  // cost and the justified expenses (the form applies the same 10%/year
  // logic to both lines).
  const abattementCout = cout * 0.10 * years;
  const abattementDepenses = dep * 0.10 * years;

  const plusValue = Math.max(0, px - cout - dep - abattementCout - abattementDepenses);
  const rate = (Number(taux) || 0) / 100;
  const impot = plusValue * rate;

  return { years, abattementCout, abattementDepenses, plusValue, impot };
}
