import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { postedCategoryTotals } from '../../../shared/accountingReporting.js';

export default function RevenueCharts() {
  const { state } = useStore();
  const { t } = useT();

  const trend = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const t2 = monthTotals(state.transactions, d.toISOString().slice(0, 7), state.generalLedger);
    return { name: d.toLocaleDateString('fr-FR', { month: 'short' }), value: Math.round(t2.income) };
  }), [state.transactions, state.generalLedger]);

  const topRevenueCategories = useMemo(() => {
    const map = new Map();
    for (let offset = 0; offset < 12; offset += 1) {
      const date = new Date(); date.setMonth(date.getMonth() - offset);
      for (const row of postedCategoryTotals(state.generalLedger, date.toISOString().slice(0, 7), 7)) {
        map.set(row.id, (map.get(row.id) || 0) + row.value);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [state.generalLedger]);

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('analytics.revenue')}</h1></div>
      <div className="card">
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer><LineChart data={trend}><XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" /><Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
        </div>
      </div>
      <p className="tiny muted">Répartition par catégorie comptable sur les 12 derniers mois publiés.</p>
      <div className="col" style={{ gap: 8 }}>
        {topRevenueCategories.map(([name, v]) => {
          const max = topRevenueCategories[0][1];
          return (
            <div key={name} className="col" style={{ gap: 4 }}>
              <div className="row between small"><span>{name || 'Client'}</span><span className="num">{fmtDT(v, { decimals: 0 })}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
      {trend.some((row) => row.value) ? <div className="card tint-teal"><span className="small">Meilleur mois : {trend.reduce((a, b) => (b.value > a.value ? b : a), trend[0]).name}</span></div> : <p className="small muted center">Aucun produit comptabilisé pour cette période.</p>}
    </div>
  );
}
