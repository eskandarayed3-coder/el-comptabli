import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';

export default function GeneralLedger() {
  const { state } = useStore();
  const { t, lang } = useT();
  const [params] = useSearchParams();
  const [account, setAccount] = useState(params.get('account') === '401' ? '401' : '411');
  const [period, setPeriod] = useState('month');

  const movements = useMemo(() => {
    const isClient = account === '411';
    const tx = state.transactions.filter((x) => (isClient ? x.kind === 'income' : x.kind === 'expense'));
    let running = 0;
    return tx.map((x) => {
      const amount = isClient ? x.amountTTC : -x.amountTTC;
      running += amount;
      return { ...x, running };
    });
  }, [state.transactions, account]);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('accounting.ledger')} · ${account} ${account === '411' ? 'Clients' : 'Fournisseurs'}`} />
      <select className="input" value={account} onChange={(e) => setAccount(e.target.value)}>
        <option value="411">411 · Clients</option>
        <option value="401">401 · Fournisseurs</option>
      </select>
      <FilterPills options={[{ id: 'month', label: 'Mois' }, { id: 'quarter', label: 'Trimestre' }, { id: 'year', label: 'Année' }]} value={period} onChange={setPeriod} />
      <div className="col" style={{ gap: 8 }}>
        {movements.map((m) => (
          <div key={m.id} className="row between small">
            <span>{fmtDate(m.date, lang)} · {m.label}</span>
            <span className="num" style={{ fontWeight: 600 }}>{fmtDT(m.amountTTC)}</span>
          </div>
        ))}
      </div>
      {movements.length > 0 && (
        <div className="card tint-teal">
          <span className="small num" style={{ fontWeight: 700 }}>Solde: {fmtDT(movements[movements.length - 1].running, { decimals: 0 })}</span>
        </div>
      )}
    </div>
  );
}
