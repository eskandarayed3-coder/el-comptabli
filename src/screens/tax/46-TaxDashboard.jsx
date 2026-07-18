import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtMonth } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import StatCard from '../../components/StatCard.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function TaxDashboard() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);

  // Real TVA position for the month = TVA collectée (ventes) − TVA déductible (achats).
  const tva = useMemo(() => {
    const inMonth = state.transactions.filter((x) => (x.date || '').startsWith(ym));
    const collected = inMonth.filter((x) => x.kind === 'income').reduce((s, x) => s + Number(x.tva || 0), 0);
    const deductible = inMonth.filter((x) => x.kind === 'expense').reduce((s, x) => s + Number(x.tva || 0), 0);
    return { collected, deductible, due: Math.max(0, collected - deductible) };
  }, [state.transactions, ym]);

  const paidTva = state.deadlines.filter((d) => d.kind === 'tva' && d.status === 'paid');

  const QUICK = [
    { label: t('tax.quickVat'), to: '/tax/vat' },
    { label: t('tax.quickIrpp'), to: '/tax/irpp' },
    { label: t('tax.quickCnss'), to: '/tax/cnss' },
    { label: t('invest.title'), to: '/tax/investment' },
    { label: t('tax.quickCalendar'), to: '/tax/calendar' },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={t('tax.dashTitle')} />

      <div className="hero-card amber">
        <span className="small" style={{ fontWeight: 700 }}>{t('tax.vatThisMonth', { amount: fmtDT(tva.due, { decimals: 0 }) })}</span>
        <div className="row between" style={{ marginTop: 10 }}>
          <span className="tiny num">{t('tax.collected')} {fmtDT(tva.collected, { decimals: 0 })} − {t('tax.deductible')} {fmtDT(tva.deductible, { decimals: 0 })}</span>
        </div>
        <span className="pill white" style={{ marginTop: 10 }}>{t('tax.deadline', { month: fmtMonth(`${ym}-01`, lang).split(' ')[0] })}</span>
      </div>

      <div className="grid-2">
        <StatCard label={t('tax.irppEstimated', { year: 2026 })} value={fmtDT(2350, { decimals: 0 })} tone="indigo" onClick={() => navigate('/tax/irpp')} />
        <StatCard label={t('tax.installments')} value="2/3" tone="teal" />
      </div>

      <div className="col" style={{ gap: 10 }}>
        {QUICK.map((q) => (
          <TintCard key={q.to} tone="gray" onClick={() => navigate(q.to)}>
            <span style={{ fontWeight: 600 }}>{q.label}</span>
          </TintCard>
        ))}
      </div>

      <div className="col" style={{ gap: 8 }}>
        {paidTva.map((d) => (
          <div key={d.id} className="row between small" style={{ padding: '8px 4px' }}>
            <span>{d.title[lang] || d.title.fr}</span>
            <span className="row" style={{ gap: 6 }}>
              <span className="num">{fmtDT(d.amount)}</span>
              <StatusPill tone="success">{t('common.paid')}</StatusPill>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
