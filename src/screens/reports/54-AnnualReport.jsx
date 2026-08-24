import { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import { postedYearTotals } from '../../../shared/accountingReporting.js';

export default function AnnualReport() {
  const { state } = useStore();
  const { t } = useT();
  const year = String(new Date().getFullYear());
  const yearTotals = useMemo(() => postedYearTotals(state.generalLedger, year), [state.generalLedger, year]);

  const monthly = yearTotals.map((row, monthIndex) => ({
    name: new Date(Number(year), monthIndex, 1).toLocaleDateString('fr-FR', { month: 'short' }),
    value: Math.round(row.income),
  }));

  const totals = yearTotals.reduce((sum, row) => ({ income: sum.income + row.income, expense: sum.expense + row.expense, profit: sum.profit + row.profit }), { income: 0, expense: 0, profit: 0 });
  const quarters = [0, 1, 2, 3].map((quarter) => yearTotals.slice(quarter * 3, quarter * 3 + 3).reduce((sum, row) => sum + row.profit, 0));

  return (
    <div className="screen stagger">
      <TopBar title={`Année ${year}`} />
      <div className="hero-card">
        <div className="grid-3">
          <div className="col"><span className="tiny">{t('common.incomes')}</span><span className="num" style={{ fontWeight: 700 }}>{fmtDT(totals.income, { decimals: 0 })}</span></div>
          <div className="col"><span className="tiny">{t('common.expenses')}</span><span className="num" style={{ fontWeight: 700 }}>{fmtDT(totals.expense, { decimals: 0 })}</span></div>
          <div className="col"><span className="tiny">{t('common.profit')}</span><span className="num" style={{ fontWeight: 700 }}>{fmtDT(totals.profit, { decimals: 0 })}</span></div>
        </div>
      </div>
      <div className="card">
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer><BarChart data={monthly}><XAxis dataKey="name" fontSize={10} stroke="var(--text-2)" /><Bar dataKey="value" fill="#0F766E" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>
      <div className="grid-3">
        {['T1', 'T2', 'T3', 'T4'].map((q, i) => (
          <div key={q} className="stat-card" style={{ background: 'var(--tint-teal)' }}>
            <span className="value num">{fmtDT(quarters[i], { decimals: 0 })}</span>
            <span className="label">{q}</span>
          </div>
        ))}
      </div>
      {!state.generalLedger.some((line) => String(line.entry_date || '').startsWith(year)) && <p className="small muted center">Aucune écriture publiée pour cette année.</p>}
    </div>
  );
}
