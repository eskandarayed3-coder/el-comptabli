import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

export default function BalanceSheet() {
  const { state } = useStore();
  const { lang } = useT();
  const rows = (state.financialStatements || []).filter((row) => row.statement === 'balance_sheet');

  return (
    <div className="screen stagger">
      <TopBar title={lang === 'ar' ? 'الميزانية المحاسبية' : 'Bilan comptable'} />
      <div className="card">
        <div className="col" style={{ gap: 10 }}>
          {rows.map((row) => (
            <div key={row.reporting_category} className="row between small">
              <span>{row.reporting_category}</span>
              <span className="num">{fmtDT(Number(row.balance || 0))}</span>
            </div>
          ))}
          {!rows.length && <p className="small muted center">Aucun solde comptabilisé. Seules les écritures validées et comptabilisées alimentent ce bilan.</p>}
        </div>
      </div>
      <p className="tiny center muted">Source : grand livre normalisé, écritures au statut comptabilisé ou contrepassé.</p>
    </div>
  );
}
