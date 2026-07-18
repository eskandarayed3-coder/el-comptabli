import { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtMonth } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

export default function MonthlyReport() {
  const { state, toast } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym), [state.transactions, ym]);

  const weekly = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    state.transactions.filter((tx) => tx.date.startsWith(ym) && tx.kind === 'income').forEach((tx) => {
      const day = Number(tx.date.slice(8, 10));
      weeks[Math.min(3, Math.floor((day - 1) / 7))] += Number(tx.amountTTC);
    });
    return weeks.map((v, i) => ({ name: `S${i + 1}`, value: Math.round(v) }));
  }, [state.transactions, ym]);

  const topCategories = useMemo(() => {
    const map = {};
    state.transactions.filter((tx) => tx.kind === 'expense' && tx.date.startsWith(ym)).forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + Number(tx.amountTTC);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([id, v]) => ({ id, label: categoryLabel(id, lang), v, pct: Math.round((v / total) * 100) }));
  }, [state.transactions, ym, lang]);

  const collected = totals.income * 0.19;
  const deductible = totals.expense * 0.19 * 0.85;

  return (
    <div className="screen stagger">
      <TopBar title={`${t('reports.monthly')} · ${fmtMonth(`${ym}-01`, lang)}`} />

      <div className="card">
        <div className="grid-3">
          <div className="col"><span className="tiny muted">{t('common.incomes')}</span><span className="num" style={{ fontWeight: 700, color: 'var(--pill-success-fg)' }}>{fmtDT(totals.income, { decimals: 0 })}</span></div>
          <div className="col"><span className="tiny muted">{t('common.expenses')}</span><span className="num" style={{ fontWeight: 700, color: 'var(--pill-danger-fg)' }}>{fmtDT(totals.expense, { decimals: 0 })}</span></div>
          <div className="col"><span className="tiny muted">{t('common.profit')}</span><span className="num" style={{ fontWeight: 700 }}>{fmtDT(totals.profit, { decimals: 0 })}</span></div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>{t('reports.byWeek')}</h3>
        <div style={{ width: '100%', height: 120 }}>
          <ResponsiveContainer>
            <BarChart data={weekly}>
              <XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" />
              <Bar dataKey="value" fill="#14B8A6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>{t('reports.topCategories')}</h3>
        <div className="col" style={{ gap: 10 }}>
          {topCategories.map((c) => (
            <div key={c.id} className="col" style={{ gap: 4 }}>
              <div className="row between small"><span>{c.label}</span><span className="num">{fmtDT(c.v, { decimals: 0 })} · {c.pct}%</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${c.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card tint-amber">
        <span className="small num">{t('tax.collected')} {fmtDT(collected, { decimals: 0 })} − {t('tax.deductible')} {fmtDT(deductible, { decimals: 0 })} = <b>{fmtDT(collected - deductible, { decimals: 0 })}</b></span>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-primary grow" onClick={() => toast(t('reports.exported'))}>📥 {t('reports.exportExcel')}</button>
        <button className="btn btn-ghost grow" onClick={() => toast(t('reports.exported'))}>PDF</button>
      </div>
      <p className="tiny center muted">Généré par El Comptabli · indicatif</p>
    </div>
  );
}
