// Retenue à la source (withholding tax) — categories from the official
// "Déclaration mensuelle des impôts" form (idaraty). Rates default to
// commonly-cited Code IRPP/IS values but are ALWAYS user-editable: this
// form was scanned/OCR'd, and tax rates change with each Loi de Finances,
// so nothing here should be trusted blindly — see the disclaimer on screen.
// labelKey maps into i18n's declMensuelle.cat_* — see fr.js / ar.js.
export const WITHHOLDING_CATEGORIES = [
  { id: 'honoraires_residents', labelKey: 'cat_honoraires_residents', defaultRate: 10 },
  { id: 'honoraires_non_residents', labelKey: 'cat_honoraires_non_residents', defaultRate: 15 },
  { id: 'honoraires_regime_reel', labelKey: 'cat_honoraires_regime_reel', defaultRate: 5 },
  { id: 'interets_epargne', labelKey: 'cat_interets_epargne', defaultRate: 20 },
  { id: 'dividendes', labelKey: 'cat_dividendes', defaultRate: 10 },
  { id: 'marches_publics', labelKey: 'cat_marches_publics', defaultRate: 1.5 },
  { id: 'contribution_solidarite', labelKey: 'cat_contribution_solidarite', defaultRate: 0.5 },
  { id: 'autres', labelKey: 'cat_autres', defaultRate: 0 },
];
