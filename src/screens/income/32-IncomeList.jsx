import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp } from 'lucide-react';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate, fmtMonth } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FAB from '../../components/FAB.jsx';

export default function IncomeList() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym, state.generalLedger), [state.transactions, state.generalLedger, ym]);

  const incomes = state.transactions
    .filter((tx) => tx.kind === 'income')
    .filter((tx) => filter === 'all' || (filter === 'paid' ? tx.status !== 'pending' : tx.status === 'pending'))
    .sort((a, b) => b.date.localeCompare(a.date));

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'paid', label: t('common.paid') },
    { id: 'pending', label: t('common.upcoming') },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={`${t('money.incomeList')} · ${fmtMonth(`${ym}-01`, lang)}`} />

      <div className="card tint-teal">
        <span className="value num" style={{ font: '700 26px/1.2 var(--font-sans)' }}>{fmtDT(totals.income, { sign: true, decimals: 0 })}</span>
        <span className="small muted"> {t('money.thisMonth')}</span>
      </div>

      <button className="card tint-indigo row between" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/income/invoice')}>
        <span className="small" style={{ fontWeight: 700 }}>🧾 {t('invoice.cta')}</span>
        <span className="pill white">{t('invoice.new')}</span>
      </button>

      <FilterPills options={filters} value={filter} onChange={setFilter} />

      {incomes.length === 0 && <EmptyState text={t('money.noTx')} />}
      <div className="col" style={{ gap: 8 }}>
        {incomes.map((tx) => (
          <button key={tx.id} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/income/${tx.id}`)}>
            <span className="icon-wrap teal"><TrendingUp size={18} /></span>
            <span className="col grow" style={{ gap: 2 }}>
              <span className="small" style={{ fontWeight: 600 }}>{tx.label}</span>
              <span className="tiny muted">{fmtDate(tx.date, lang)}</span>
            </span>
            <span className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
              <span className="num" style={{ fontWeight: 700, color: 'var(--teal-700)' }}>{fmtDT(tx.amountTTC, { sign: true, decimals: 0 })}</span>
              <StatusPill tone={tx.status === 'pending' ? 'warning' : 'success'}>{tx.status === 'pending' ? t('common.upcoming') : t('common.paid')}</StatusPill>
            </span>
          </button>
        ))}
      </div>
      <FAB icon={Plus} label={t('money.addIncome')} onClick={() => navigate('/income/add')} />
    </div>
  );
}
