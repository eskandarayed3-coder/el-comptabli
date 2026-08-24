import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtMonth } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0F766E', '#14B8A6', '#D97706', '#4F46E5', '#DC2626', '#6B7280'];

export default function FinancialOverview() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const [offset, setOffset] = useState(0);

  const month = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toISOString().slice(0, 7);
  }, [offset]);

  const totals = useMemo(() => monthTotals(state.transactions, month, state.generalLedger), [state.transactions, state.generalLedger, month]);

  const byCategory = useMemo(() => {
    const map = {};
    state.generalLedger.filter((line) => Number(line.account_class) === 6 && String(line.entry_date || '').startsWith(month)).forEach((line) => {
      const category = line.reporting_category || line.account_label || 'autres';
      map[category] = (map[category] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
    });
    return Object.entries(map).map(([id, value]) => ({ id, name: categoryLabel(id, lang), value }));
  }, [state.generalLedger, month, lang]);

  const trend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const ym = d.toISOString().slice(0, 7);
      const t2 = monthTotals(state.transactions, ym, state.generalLedger);
      return { name: d.toLocaleDateString('fr-FR', { month: 'short' }), Revenus: Math.round(t2.income), Dépenses: Math.round(t2.expense) };
    });
  }, [state.transactions, state.generalLedger]);

  return (
    <div className="screen stagger">
      <TopBar
        title={t('home.overviewTitle')}
        right={
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" onClick={() => setOffset((o) => o - 1)}>‹</button>
            <button className="icon-btn" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 0}>›</button>
          </div>
        }
        subtitle={fmtMonth(`${month}-01`, lang)}
      />

      <div className="grid-2">
        <div className="stat-card" style={{ background: 'var(--tint-teal)' }}>
          <span className="value num">{fmtDT(totals.income, { decimals: 0 })}</span>
          <span className="label">{t('common.incomes')}</span>
        </div>
        <div className="stat-card" style={{ background: 'var(--tint-coral)' }}>
          <span className="value num">{fmtDT(totals.expense, { decimals: 0 })}</span>
          <span className="label">{t('common.expenses')}</span>
        </div>
        <div className="stat-card" style={{ background: 'var(--tint-indigo)' }}>
          <span className="value num">{fmtDT(totals.profit, { sign: true, decimals: 0 })}</span>
          <span className="label">{t('common.profit')}</span>
        </div>
        <div className="stat-card" style={{ background: 'var(--tint-amber)' }}>
            <span className="value num">{fmtDT((state.vatSummary || []).filter((row) => String(row.period_month || '').startsWith(month)).reduce((sum, row) => sum + (row.kind === 'income' ? Number(row.tax_amount || 0) : -Number(row.tax_amount || 0)), 0), { decimals: 0 })}</span>
          <span className="label">{t('tax.vatToPay')}</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>{t('reports.monthly')}</h3>
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" />
              <Tooltip />
              <Line type="monotone" dataKey="Revenus" stroke="#0F766E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Dépenses" stroke="#DC2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>{t('home.byCategory')}</h3>
        <div className="row" style={{ gap: 20, alignItems: 'center' }}>
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={32} outerRadius={56}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="col" style={{ gap: 6 }}>
            {byCategory.map((c, i) => (
              <div key={c.id} className="row small" style={{ gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-ghost btn-block" onClick={() => navigate('/reports/monthly')}>{t('home.fullReport')}</button>
    </div>
  );
}
