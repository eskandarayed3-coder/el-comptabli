import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import StatCard from '../../components/StatCard.jsx';
import TintCard from '../../components/TintCard.jsx';

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const { state, toast } = useStore();
  const { t } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const entries = state.transactions.filter((tx) => tx.date.startsWith(ym)).length;

  const QUICK = [
    { label: 'Journal des ventes', to: '/accounting/journal' },
    { label: 'Journal des achats', to: '/accounting/journal' },
    { label: 'Grand livre', to: '/accounting/ledger' },
    { label: 'Balance', to: '/accounting/trial-balance' },
  ];

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('accounting.title')} 📒</h1></div>
      <div className="grid-3">
        <StatCard label="Écritures ce mois" value={entries * 2} tone="teal" />
        <StatCard label="À catégoriser" value={2} tone="amber" />
        <StatCard label="Journaux" value={3} tone="indigo" />
      </div>
      <div className="col" style={{ gap: 10 }}>
        {QUICK.map((q) => (
          <TintCard key={q.label} tone="gray" onClick={() => navigate(q.to)}><span style={{ fontWeight: 600 }}>{q.label}</span></TintCard>
        ))}
      </div>
      <p className="disclaimer">{t('accounting.v2')}</p>
      <button className="btn btn-ghost btn-block" onClick={() => toast(t('common.saved'))}>Exporter pour mon comptable</button>
    </div>
  );
}
