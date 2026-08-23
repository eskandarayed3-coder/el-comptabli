import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import StatCard from '../../components/StatCard.jsx';

export default function CashFlow() {
  const { state } = useStore();
  const { t } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym, state.generalLedger), [state.transactions, state.generalLedger, ym]);

  const curve = useMemo(() => {
    let bal = 0;
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (2 - i));
      const t2 = monthTotals(state.transactions, d.toISOString().slice(0, 7), state.generalLedger);
      bal += t2.profit;
      return { name: d.toLocaleDateString('fr-FR', { month: 'short' }), value: Math.round(bal) };
    });
  }, [state.transactions, state.generalLedger]);

  return (
    <div className="screen stagger">
      <TopBar title={t('reports.cashflow')} />
      <div className="card">
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <AreaChart data={curve}>
              <XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" />
              <Area type="monotone" dataKey="value" stroke="#0F766E" fill="var(--tint-teal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid-3">
        <StatCard label="Entrées" value={fmtDT(totals.income, { decimals: 0 })} tone="teal" />
        <StatCard label="Sorties" value={fmtDT(totals.expense, { decimals: 0 })} tone="coral" />
        <StatCard label="Solde fin de mois" value={fmtDT(totals.profit, { decimals: 0 })} tone="indigo" />
      </div>
    </div>
  );
}
