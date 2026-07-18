import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingDown } from 'lucide-react';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate, fmtMonth } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FAB from '../../components/FAB.jsx';

export default function ExpenseList() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym), [state.transactions, ym]);

  const expenses = state.transactions
    .filter((tx) => tx.kind === 'expense')
    .filter((tx) => filter === 'all' || (filter === 'deductible' ? tx.tva > 0 : tx.tva === 0))
    .sort((a, b) => b.date.localeCompare(a.date));

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'deductible', label: 'Déductibles' },
    { id: 'nondeductible', label: 'Non déductibles' },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={`${t('money.expenseList')} · ${fmtMonth(`${ym}-01`, lang)}`} />

      <div className="card tint-coral">
        <span className="value num" style={{ font: '700 26px/1.2 var(--font-sans)' }}>{fmtDT(-totals.expense, { sign: true, decimals: 0 })}</span>
        <span className="small muted"> {t('money.thisMonth')}</span>
      </div>

      <FilterPills options={filters} value={filter} onChange={setFilter} />

      {expenses.length === 0 && <EmptyState text={t('money.noTx')} />}
      <div className="col" style={{ gap: 8 }}>
        {expenses.map((tx) => (
          <button key={tx.id} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/expenses/${tx.id}`)}>
            <span className="icon-wrap coral"><TrendingDown size={18} /></span>
            <span className="col grow" style={{ gap: 2 }}>
              <span className="small" style={{ fontWeight: 600 }}>{tx.label}</span>
              <span className="tiny muted">{categoryLabel(tx.category, lang)} · {fmtDate(tx.date, lang)}</span>
            </span>
            <span className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
              <span className="num" style={{ fontWeight: 700, color: 'var(--pill-danger-fg)' }}>{fmtDT(-tx.amountTTC, { sign: true, decimals: 0 })}</span>
              {tx.tva > 0 && <span className="tiny muted num">TVA {fmtDT(tx.tva)}</span>}
            </span>
          </button>
        ))}
      </div>
      <FAB icon={Plus} label={t('money.addExpense')} onClick={() => navigate('/expenses/add')} />
    </div>
  );
}
