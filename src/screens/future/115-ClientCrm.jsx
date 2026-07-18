import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import FAB from '../../components/FAB.jsx';

const CLIENTS = [
  { name: 'Wafa Trading', ca: 2400, lastInvoice: '08/07', avgPay: 12, health: 'ok' },
  { name: 'Amine SARL', ca: 1100, lastInvoice: '03/07', avgPay: 20, health: 'ok' },
  { name: 'Salma Design', ca: 952, lastInvoice: '18/05', avgPay: 45, health: 'slow' },
];

export default function ClientCrm() {
  const { t } = useT();
  const [seg, setSeg] = useState('all');

  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.crm')} 🤝`} />
      <div className="input-row"><input className="input" placeholder={t('common.search')} /></div>
      <FilterPills options={[{ id: 'all', label: t('common.all') }, { id: 'active', label: 'Actifs' }, { id: 'inactive', label: 'Inactifs 30j+' }, { id: 'top', label: 'Top' }]} value={seg} onChange={setSeg} />
      <div className="col" style={{ gap: 8 }}>
        {CLIENTS.map((c) => (
          <div key={c.name} className="list-row">
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{c.name[0]}</span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{c.name}</span><span className="tiny muted">Dernière facture {c.lastInvoice} · paiement moyen {c.avgPay}j</span></span>
            <span className="col" style={{ alignItems: 'flex-end' }}>
              <span className="num" style={{ fontWeight: 700 }}>{fmtDT(c.ca, { decimals: 0 })}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.health === 'ok' ? 'var(--pill-success-fg)' : 'var(--pill-warning-fg)' }} />
            </span>
          </div>
        ))}
      </div>
      <FAB icon={Plus} label="Client" onClick={() => {}} />
    </div>
  );
}
