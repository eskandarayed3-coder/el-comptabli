import { useMemo, useState } from 'react';
import { useT } from '../../i18n/index.js';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { fmtDT } from '../../lib/format.js';
import FilterPills from '../../components/FilterPills.jsx';

export default function KpiDashboard() {
  const { t } = useT();
  const { state } = useStore();
  const [period, setPeriod] = useState('month');

  const kpis = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    const { income, expense, profit } = monthTotals(state.transactions, ym, state.generalLedger);
    const posted = state.generalLedger.filter((line) => String(line.entry_date || '').startsWith(ym));
    const incomeEntries = new Set(posted.filter((line) => Number(line.account_class) === 7).map((line) => line.entry_id));
    const panierMoyen = incomeEntries.size ? income / incomeEntries.size : 0;
    const tvaRecuperee = (state.vatSummary || []).filter((row) => row.kind === 'expense' && String(row.period_month || '').startsWith(ym)).reduce((sum, row) => sum + Number(row.tax_amount || 0), 0);

    return [
      { label: 'CA mensuel', value: fmtDT(income, { decimals: 0 }) },
      { label: 'Marge', value: income ? `${Math.round((profit / income) * 100)}%` : '—' },
      { label: 'Panier moyen', value: incomeTx.length ? fmtDT(panierMoyen, { decimals: 0 }) : '—' },
      { label: 'TVA récupérée', value: fmtDT(tvaRecuperee, { decimals: 0 }) },
      { label: 'Écritures de vente', value: String(incomeEntries.size) },
      { label: 'Dépenses du mois', value: fmtDT(expense, { decimals: 0 }) },
    ];
  }, [state.generalLedger, state.vatSummary]);

  const hasData = state.generalLedger.length > 0;

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('analytics.kpi')} 📈</h1>
        <span className="pill premium">{t('common.premium')}</span>
      </div>
      <FilterPills options={[{ id: 'month', label: 'Mois' }, { id: 'quarter', label: 'Trimestre' }, { id: 'year', label: 'Année' }]} value={period} onChange={setPeriod} />
      {hasData ? (
        <div className="grid-2">
          {kpis.map((k) => (
            <div key={k.label} className="stat-card" style={{ background: 'var(--tint-teal)' }}>
              <span className="value num">{k.value}</span>
              <span className="label">{k.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="small muted center">{t('money.noTx')}</p>
      )}
    </div>
  );
}
