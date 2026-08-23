import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

const LABELS = { balance_sheet: 'Bilan', revenue: 'Produits', expense: 'Charges', other: 'Autres' };

export default function FinancialReportsAccounting() {
  const { state } = useStore();
  const { t } = useT();
  const rows = state.financialStatements || [];

  return (
    <div className="screen stagger">
      <TopBar title={t('accounting.reports')} />
      <div className="col" style={{ gap: 12 }}>
        {rows.map((row) => (
          <div key={`${row.statement}-${row.reporting_category}`} className="card">
            <div className="row between">
              <span style={{ fontWeight: 700 }}>{LABELS[row.statement] || row.statement}</span>
              <span className="pill teal num">{fmtDT(Number(row.balance || 0))}</span>
            </div>
            <p className="small muted">{row.reporting_category}</p>
            <div className="row between tiny">
              <span>Débit {fmtDT(Number(row.total_debit || 0))}</span>
              <span>Crédit {fmtDT(Number(row.total_credit || 0))}</span>
            </div>
          </div>
        ))}
        {!rows.length && <p className="small muted center">Aucun état financier disponible avant comptabilisation des écritures.</p>}
      </div>
    </div>
  );
}
