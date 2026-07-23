// Retenue à la source (withholding tax) — categories from the official
// "Déclaration mensuelle des impôts" form (idaraty). Rates default to
// commonly-cited Code IRPP/IS values but are ALWAYS user-editable: this
// form was scanned/OCR'd, and tax rates change with each Loi de Finances,
// so nothing here should be trusted blindly — see the disclaimer on screen.
export const WITHHOLDING_CATEGORIES = [
  { id: 'honoraires_residents', label: 'Honoraires, commissions, courtage, loyers (résidents)', defaultRate: 10 },
  { id: 'honoraires_non_residents', label: 'Honoraires, commissions, courtage, loyers (non-résidents)', defaultRate: 15 },
  { id: 'honoraires_regime_reel', label: 'Honoraires à des personnes physiques au régime réel', defaultRate: 5 },
  { id: 'interets_epargne', label: 'Intérêts des dépôts d’épargne', defaultRate: 20 },
  { id: 'dividendes', label: 'Dividendes versés à des personnes physiques', defaultRate: 10 },
  { id: 'marches_publics', label: 'Marchés publics (État, collectivités, EP)', defaultRate: 1.5 },
  { id: 'contribution_solidarite', label: 'Contribution sociale de solidarité', defaultRate: 0.5 },
  { id: 'autres', label: 'Autres (taux libre)', defaultRate: 0 },
];
