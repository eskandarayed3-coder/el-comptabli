import { useMemo } from 'react';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

export default function ProfitLoss() {
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym, state.generalLedger), [state.transactions, state.generalLedger, ym]);

  const byCategory = useMemo(() => {
    const map = {};
    state.generalLedger.filter((line) => Number(line.account_class) === 6 && String(line.entry_date || '').startsWith(ym)).forEach((line) => {
      const category = line.reporting_category || line.account_label || 'autres';
      map[category] = (map[category] || 0) + Number(line.debit || 0) - Number(line.credit || 0);
    });
    return Object.entries(map).map(([id, v]) => ({ label: categoryLabel(id, lang), v }));
  }, [state.generalLedger, ym, lang]);

  const tax = Math.round(totals.profit * 0.25);

  const row = (label, value, opts = {}) => (
    <div className="row between small" style={{ fontWeight: opts.bold ? 700 : 400, padding: opts.pad ? '10px 0' : '4px 0' }}>
      <span>{label}</span><span className="num">{fmtDT(value, { decimals: 0 })}</span>
    </div>
  );

  return (
    <div className="screen stagger">
      <TopBar title={`${t('reports.pnl')} · Juillet`} />
      <div className="card">
        {row('Produits d’exploitation', totals.income, { bold: true, pad: true })}
        <div style={{ height: 1, background: 'var(--bg-2)', margin: '4px 0' }} />
        <span className="tiny muted">Charges d’exploitation</span>
        {byCategory.map((c) => <div key={c.label} className="row between tiny" style={{ padding: '4px 0', paddingInlineStart: 10 }}><span>{c.label}</span><span className="num">{fmtDT(c.v, { decimals: 0 })}</span></div>)}
        {row('Total charges', -totals.expense, { pad: true })}
        <div style={{ height: 1, background: 'var(--bg-2)', margin: '4px 0' }} />
        <div className="card tint-teal" style={{ margin: '8px 0', padding: 12 }}>{row('Résultat d’exploitation', totals.profit, { bold: true })}</div>
        {row('Impôts estimés', -tax, { pad: true })}
        <div style={{ height: 1, background: 'var(--bg-2)', margin: '4px 0' }} />
        {row('Résultat net', totals.profit - tax, { bold: true, pad: true })}
      </div>
      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow">Excel</button>
        <button className="btn btn-ghost grow">PDF</button>
      </div>
    </div>
  );
}
