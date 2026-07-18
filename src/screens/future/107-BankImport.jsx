import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

const TX = [
  { label: 'Virement · Wafa Trading', amount: 850, cat: 'Ventes', conf: 'high' },
  { label: 'STEG prélèvement', amount: -141, cat: 'Électricité', conf: 'high' },
  { label: 'Paiement carte · Agil', amount: -70, cat: 'Carburant', conf: 'low' },
];

export default function BankImport() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={t('future.bankImport')} />
      <div className="card tint-gray"><span className="small">BIAT ····4521 · Solde {fmtDT(3180)}</span></div>
      <div className="col" style={{ gap: 8 }}>
        {TX.map((tx, i) => (
          <div key={i} className="list-row">
            <span className={`icon-wrap ${tx.amount > 0 ? 'teal' : 'coral'}`}>{tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{tx.label}</span><span className="pill teal" style={{ marginTop: 4 }}>{tx.cat}</span></span>
            <span className="col" style={{ alignItems: 'flex-end' }}>
              <span className="num" style={{ fontWeight: 700 }}>{fmtDT(tx.amount, { sign: true })}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: tx.conf === 'high' ? 'var(--pill-success-fg)' : 'var(--pill-warning-fg)' }} />
            </span>
          </div>
        ))}
      </div>
      <div className="card tint-amber"><span className="small">12 catégorisées auto · 3 à vérifier</span></div>
      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-primary grow">Tout valider</button>
        <button className="btn btn-ghost grow">Réviser</button>
      </div>
    </div>
  );
}
