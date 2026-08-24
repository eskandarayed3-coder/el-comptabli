import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtMonth } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import { postedCategoryTotals, postedVatPosition, postedWeeklyRevenue } from '../../../shared/accountingReporting.js';

export default function MonthlyReport() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym, state.generalLedger), [state.transactions, state.generalLedger, ym]);

  const weekly = useMemo(() => {
    const weeks = postedWeeklyRevenue(state.generalLedger, ym);
    return weeks.map((v, i) => ({ name: `S${i + 1}`, value: Math.round(v) }));
  }, [state.generalLedger, ym]);

  const topCategories = useMemo(() => {
    const categories = postedCategoryTotals(state.generalLedger, ym, 6);
    const total = categories.reduce((sum, row) => sum + row.value, 0) || 1;
    return categories.sort((a, b) => b.value - a.value).slice(0, 3)
      .map(({ id, value }) => ({ id, label: categoryLabel(id, lang), v: value, pct: Math.round((value / total) * 100) }));
  }, [state.generalLedger, ym, lang]);

  const { collected, deductible } = postedVatPosition(state.vatSummary, ym);

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
        <button className="btn btn-primary grow" onClick={() => navigate('/documents/export')}>📥 {t('reports.exportExcel')}</button>
        <button className="btn btn-ghost grow" onClick={() => navigate('/documents/export')}>PDF</button>
      </div>
      <p className="tiny center muted">Généré par El Comptabli · indicatif</p>
    </div>
  );
}
