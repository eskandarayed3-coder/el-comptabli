import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

const COLORS = ['#0F766E', '#14B8A6', '#D97706', '#4F46E5', '#DC2626', '#6B7280'];

export default function ExpenseAnalysis() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const ymLast = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })();

  const data = useMemo(() => {
    const map = {};
    state.transactions.filter((tx) => tx.kind === 'expense' && tx.date.startsWith(ym)).forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amountTTC;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return { total, items: Object.entries(map).map(([id, v]) => ({ id, label: categoryLabel(id, lang), v, pct: Math.round((v / total) * 100) })) };
  }, [state.transactions, ym, lang]);

  const insight = useMemo(() => {
    // Only surfaces if a category genuinely grew month-over-month — no
    // fixed example text.
    let best = null;
    for (const c of data.items) {
      const lastCount = state.transactions.filter((tx) => tx.kind === 'expense' && tx.category === c.id && tx.date.startsWith(ymLast)).length;
      const thisCount = state.transactions.filter((tx) => tx.kind === 'expense' && tx.category === c.id && tx.date.startsWith(ym)).length;
      if (thisCount > lastCount && (!best || thisCount - lastCount > best.diff)) {
        best = { label: c.label, thisCount, lastCount, diff: thisCount - lastCount };
      }
    }
    return best;
  }, [data.items, state.transactions, ym, ymLast]);

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
        <div className="card tint-indigo"><span className="small">💡 {insight.label} en hausse : {insight.thisCount} opérations ce mois vs {insight.lastCount} le mois dernier</span></div>
      )}
      <button className="btn btn-ghost btn-block" onClick={() => navigate('/documents/export')}>Exporter l’analyse</button>
    </div>
  );
}
