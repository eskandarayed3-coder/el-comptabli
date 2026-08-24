import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtMonth } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import StatCard from '../../components/StatCard.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { postedVatPosition } from '../../../shared/accountingReporting.js';

export default function TaxDashboard() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);

  const tva = useMemo(() => postedVatPosition(state.vatSummary, ym), [state.vatSummary, ym]);

  const paidTva = state.deadlines.filter((d) => d.kind === 'tva' && d.status === 'paid');
  const vatPositionLabel = tva.due < 0
    ? `${lang === 'ar' ? 'رصيد الأداء على القيمة المضافة للترحيل' : 'Crédit de TVA à reporter'} : ${fmtDT(Math.abs(tva.due), { decimals: 0 })}`
    : t('tax.vatThisMonth', { amount: fmtDT(tva.due, { decimals: 0 }) });

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
        <span className="small" style={{ fontWeight: 700 }}>{vatPositionLabel}</span>
        <div className="row between" style={{ marginTop: 10 }}>
          <span className="tiny num">{t('tax.collected')} {fmtDT(tva.collected, { decimals: 0 })} − {t('tax.deductible')} {fmtDT(tva.deductible, { decimals: 0 })}</span>
        </div>
        <span className="pill white" style={{ marginTop: 10 }}>{t('tax.deadline', { month: fmtMonth(`${ym}-01`, lang).split(' ')[0] })}</span>
      </div>

      <div className="grid-2">
        <StatCard label={t('tax.collected')} value={fmtDT(tva.collected, { decimals: 0 })} tone="indigo" />
        <StatCard label={t('tax.deductible')} value={fmtDT(tva.deductible, { decimals: 0 })} tone="teal" />
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
