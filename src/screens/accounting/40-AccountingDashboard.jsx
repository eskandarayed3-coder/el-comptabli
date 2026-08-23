import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { v1 } from '../../lib/api.js';
import StatCard from '../../components/StatCard.jsx';
import TintCard from '../../components/TintCard.jsx';

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const { state, toast } = useStore();
  const { t } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const postedThisMonth = (state.journalEntries || []).filter((entry) => entry.status === 'posted' && entry.date?.startsWith(ym)).length;
  const [pendingMappings, setPendingMappings] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    v1('/invoices?limit=100').then((result) => {
      if (!active) return;
      setPendingMappings((result.data || []).filter((invoice) => ['confirmed', 'paid'].includes(invoice.status) && invoice.accounting_status !== 'posted').length);
      setLoadError('');
    }).catch((error) => {
      if (!active) return;
      setLoadError(error.friendly?.message || 'Les factures en attente sont momentanément indisponibles.');
    });
    return () => { active = false; };
  }, []);

  const QUICK = [
    { label: 'Valider les imputations', to: '/accounting/mappings', tone: 'amber' },
    { label: 'Journal des ventes', to: '/accounting/journal' },
    { label: 'Journal des achats', to: '/accounting/journal' },
    { label: 'Grand livre', to: '/accounting/ledger' },
    { label: 'Balance', to: '/accounting/trial-balance' },
  ];

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('accounting.title')} 📒</h1></div>
      <div className="grid-3">
        <StatCard label="Écritures publiées ce mois" value={postedThisMonth} tone="teal" />
        <StatCard label="Factures à comptabiliser" value={pendingMappings ?? '…'} tone="amber" />
        <StatCard label="Total des écritures publiées" value={state.dashboard?.posted_entry_count || 0} tone="indigo" />
      </div>
      {loadError && <p className="small" role="alert" style={{ color: 'var(--coral-700)' }}>{loadError}</p>}
      <div className="col" style={{ gap: 10 }}>
        {QUICK.map((q) => (
          <TintCard key={q.label} tone={q.tone || 'gray'} onClick={() => navigate(q.to)}><span style={{ fontWeight: 600 }}>{q.label}</span></TintCard>
        ))}
      </div>
      <p className="disclaimer">{t('accounting.v2')}</p>
      <button className="btn btn-ghost btn-block" onClick={() => toast(t('common.saved'))}>Exporter pour mon comptable</button>
    </div>
  );
}
