import { useMemo, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import FilterPills from '../../components/FilterPills.jsx';

export default function RevenueCharts() {
  const { state } = useStore();
  const { t } = useT();
  const [breakdown, setBreakdown] = useState('client');

  const trend = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const t2 = monthTotals(state.transactions, d.toISOString().slice(0, 7));
    return { name: d.toLocaleDateString('fr-FR', { month: 'short' }), value: Math.round(t2.income) };
  }), [state.transactions]);

  const topClients = useMemo(() => {
    const map = {};
    state.transactions.filter((x) => x.kind === 'income').forEach((x) => { map[x.vendor] = (map[x.vendor] || 0) + x.amountTTC; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [state.transactions]);

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('analytics.revenue')}</h1></div>
      <div className="card">
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer><LineChart data={trend}><XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" /><Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
        </div>
      </div>
      <FilterPills options={[{ id: 'client', label: 'Par client' }, { id: 'category', label: 'Par catégorie' }, { id: 'month', label: 'Par mois' }]} value={breakdown} onChange={setBreakdown} />
      <div className="col" style={{ gap: 8 }}>
        {topClients.map(([name, v], i) => {
          const max = topClients[0][1];
          return (
            <div key={name} className="col" style={{ gap: 4 }}>
              <div className="row between small"><span>{name || 'Client'}</span><span className="num">{fmtDT(v, { decimals: 0 })}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
      <div className="card tint-teal"><span className="small">Meilleur mois : {trend.reduce((a, b) => (b.value > a.value ? b : a), trend[0]).name}</span></div>
    </div>
  );
}
