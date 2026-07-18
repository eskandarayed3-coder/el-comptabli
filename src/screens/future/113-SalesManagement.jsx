import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import StatCard from '../../components/StatCard.jsx';
import FAB from '../../components/FAB.jsx';

const DOCS = [
  { id: 'D-024', client: 'Wafa', amount: 1200, status: 'pending', type: 'Devis' },
  { id: 'F-018', client: 'Amine', amount: 850, status: 'paid', type: 'Facture' },
];

export default function SalesManagement() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.sales')} 🛒`} />
      <div className="grid-3">
        <StatCard label="Devis" value={4} tone="amber" />
        <StatCard label="Commandes" value={2} tone="indigo" />
        <StatCard label="Facturé" value={fmtDT(3200, { decimals: 0 })} tone="teal" />
      </div>
      <div className="col" style={{ gap: 8 }}>
        {DOCS.map((d) => (
          <div key={d.id} className="list-row">
            <span className="col grow"><span className="small num" style={{ fontWeight: 600 }}>#{d.id} {d.client}</span><span className="tiny muted">{d.type}</span></span>
            <span className="num" style={{ fontWeight: 700 }}>{fmtDT(d.amount)}</span>
            <span className={`pill ${d.status === 'paid' ? 'success' : 'warning'}`}>{d.status === 'paid' ? 'Payée' : 'En attente'}</span>
          </div>
        ))}
      </div>
      <FAB icon={Plus} label="Devis" onClick={() => {}} />
    </div>
  );
}
