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
    const { income, expense, profit } = monthTotals(state.transactions, ym);
    const incomeTx = state.transactions.filter((tx) => tx.kind === 'income' && (tx.date || '').startsWith(ym));
    const expenseTx = state.transactions.filter((tx) => tx.kind === 'expense' && (tx.date || '').startsWith(ym));
    const panierMoyen = incomeTx.length ? income / incomeTx.length : 0;
    const tvaRecuperee = expenseTx.reduce((s, tx) => s + (tx.tva ?? 0), 0);
    const clientsActifs = new Set(incomeTx.map((tx) => tx.vendor).filter(Boolean)).size;

    return [
      { label: 'CA mensuel', value: fmtDT(income, { decimals: 0 }) },
      { label: 'Marge', value: income ? `${Math.round((profit / income) * 100)}%` : '—' },
      { label: 'Panier moyen', value: incomeTx.length ? fmtDT(panierMoyen, { decimals: 0 }) : '—' },
      { label: 'TVA récupérée', value: fmtDT(tvaRecuperee, { decimals: 0 }) },
      { label: 'Clients actifs', value: String(clientsActifs) },
      { label: 'Dépenses du mois', value: fmtDT(expense, { decimals: 0 }) },
    ];
  }, [state.transactions]);

  const hasData = state.transactions.length > 0;

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
