import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FAB from '../../components/FAB.jsx';

const ORDERS = [
  { supplier: 'Librairie El Kitab', amount: 120, status: 'Reçu', date: '12/07' },
  { supplier: 'Agil', amount: 90, status: 'Payé', date: '10/07' },
];

export default function PurchaseManagement() {
  const navigate = useNavigate();
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.purchases')} 🛍️`} />
      <div className="col" style={{ gap: 8 }}>
        {ORDERS.map((o, i) => (
          <div key={i} className="list-row">
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{o.supplier}</span><span className="tiny muted">{o.date}</span></span>
            <span className="num" style={{ fontWeight: 700 }}>{fmtDT(o.amount)}</span>
            <span className="pill teal">{o.status}</span>
          </div>
        ))}
      </div>
      <div className="card tint-amber"><span className="small">890 DT à payer sous 15j</span></div>
      <button className="small" style={{ color: 'var(--teal-700)' }} onClick={() => navigate('/future/suppliers')}>Voir mes fournisseurs</button>
      <FAB icon={Plus} label="Commande" onClick={() => {}} />
    </div>
  );
}
