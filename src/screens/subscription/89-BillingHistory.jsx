import { FileText } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const INVOICES = [
  ['Juillet 2026', 20], ['Juin 2026', 20], ['Mai 2026', 20],
];

export default function BillingHistory() {
  const { state, patch, toast } = useStore();
  const { t } = useT();

  const cancel = () => { patch('settings', { plan: 'free' }); toast(t('common.saved')); };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('sub.billing')}`} />
      <div className="card row between">
        <span className="col"><span style={{ fontWeight: 700 }}>Premium</span><span className="tiny muted">Prochaine échéance 16 août</span></span>
        <button className="btn btn-ghost btn-sm">Gérer</button>
      </div>
      <div className="col" style={{ gap: 8 }}>
        {INVOICES.map(([label, amount]) => (
          <div key={label} className="row between small" style={{ padding: '10px 4px' }}>
            <span className="row" style={{ gap: 8 }}><FileText size={16} color="var(--text-2)" /> {label} · {amount} DT · Payée ✓</span>
          </div>
        ))}
      </div>
      {state.settings.plan === 'premium' && (
        <button className="btn btn-danger-soft btn-block" onClick={cancel}>Annuler mon abonnement</button>
      )}
    </div>
  );
}
