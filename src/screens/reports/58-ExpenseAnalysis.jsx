import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import { postedCategoryTotals } from '../../../shared/accountingReporting.js';

const COLORS = ['#0F766E', '#14B8A6', '#D97706', '#4F46E5', '#DC2626', '#6B7280'];

export default function ExpenseAnalysis() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const ymLast = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();

  const data = useMemo(() => {
    const rows = postedCategoryTotals(state.generalLedger, ym, 6);
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    return { total, items: rows.map(({ id, value }) => ({ id, label: categoryLabel(id, lang), v: value, pct: total ? Math.round((value / total) * 100) : 0 })) };
  }, [state.generalLedger, ym, lang]);

  const insight = useMemo(() => {
    // Only surfaces if a category genuinely grew month-over-month — no
    // fixed example text.
    let best = null;
    for (const c of data.items) {
      const lastValue = postedCategoryTotals(state.generalLedger, ymLast, 6).find((row) => row.id === c.id)?.value || 0;
      if (lastValue > 0 && c.v > lastValue * 1.15 && (!best || c.v - lastValue > best.diff)) {
        best = { label: c.label, thisValue: c.v, lastValue, diff: c.v - lastValue };
      }
    }
    return best;
  }, [data.items, state.generalLedger, ymLast]);

  return (
    <div className="screen stagger">
      <TopBar title={t('reports.expenseAnalysis')} />
      <div className="card center">
        <div style={{ width: 160, height: 160, margin: '0 auto', position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.items} dataKey="v" nameKey="label" innerRadius={48} outerRadius={78}>
                {data.items.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="num" style={{ fontWeight: 700 }}>{fmtDT(data.total, { decimals: 0 })}</span>
          </div>
        </div>
      </div>
      <div className="col" style={{ gap: 8 }}>
        {data.items.map((c, i) => (
          <div key={c.id} className="row between small">
            <span className="row" style={{ gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} /> {c.label}</span>
            <span className="num">{c.pct}%</span>
          </div>
        ))}
      </div>
      {insight && (
        <div className="card tint-indigo"><span className="small">💡 {insight.label} en hausse : {fmtDT(insight.thisValue, { decimals: 0 })} ce mois vs {fmtDT(insight.lastValue, { decimals: 0 })} le mois dernier</span></div>
      )}
      <button className="btn btn-ghost btn-block" onClick={() => navigate('/documents/export')}>Exporter l’analyse</button>
    </div>
  );
}
