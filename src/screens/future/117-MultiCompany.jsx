import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const COMPANIES = [
  { name: 'Studio Eskandar', type: 'Freelance', alerts: 2, tone: 'amber' },
  { name: 'Café Sonia', type: 'SUARL · Forfaitaire', alerts: 0, tone: 'teal' },
  { name: 'Wafa Trading', type: 'SARL · Réel', alerts: 0, tone: 'teal' },
];

export default function MultiCompany() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.multi')} 🏢`} />
      <p className="tiny muted">Connecté en tant que comptable</p>
      <div className="col" style={{ gap: 10 }}>
        {COMPANIES.map((c) => (
          <div key={c.name} className="card row between">
            <span className="col"><span style={{ fontWeight: 700 }}>{c.name}</span><span className="tiny muted">{c.type}</span></span>
            {c.alerts > 0 ? <span className="pill danger">{c.alerts} alertes</span> : <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--pill-success-fg)' }} />}
          </div>
        ))}
        <button className="card" style={{ border: '2px dashed var(--hairline)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)' }}>
          <Plus size={18} /> Ajouter une entreprise
        </button>
      </div>
    </div>
  );
}
