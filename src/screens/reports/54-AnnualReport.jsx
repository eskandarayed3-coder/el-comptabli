import { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

export default function AnnualReport() {
  const { state } = useStore();
  const { t } = useT();

  const monthly = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(i);
    const ym = d.toISOString().slice(0, 7);
    const income = state.transactions.filter((x) => x.kind === 'income' && x.date.startsWith(ym)).reduce((s, x) => s + x.amountTTC, 0);
    return { name: d.toLocaleDateString('fr-FR', { month: 'short' }), value: Math.round(income) };
  }), [state.transactions]);

  const totals = { income: 38400, expense: 23500, profit: 14900 };

  return (
    <div className="screen stagger">
      <TopBar title="Année 2026" />
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
        {['T1', 'T2', 'T3'].map((q, i) => (
          <div key={q} className="stat-card" style={{ background: 'var(--tint-teal)' }}>
            <span className="value num">{fmtDT(9000 + i * 1200, { decimals: 0 })}</span>
            <span className="label">{q} {i > 0 ? '↑' : ''}</span>
          </div>
        ))}
      </div>
      <div className="card tint-gray"><span className="small">Impôts payés : <b className="num">{fmtDT(1664)}</b></span></div>
      <button className="btn btn-primary btn-block">Rapport annuel complet PDF <span className="pill premium" style={{ marginInlineStart: 8 }}>Premium</span></button>
    </div>
  );
}
