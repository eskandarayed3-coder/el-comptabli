import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';

const GROUPS = [
  { title: 'Finance', perms: [['Voir', true], ['Modifier', true], ['Supprimer', false]] },
  { title: 'Documents', perms: [['Voir', true], ['Ajouter', true]] },
  { title: 'Fiscalité', perms: [['Déclarer', true]] },
  { title: 'Abonnement', perms: [['Gérer', false]] },
];

export default function RolesPermissions() {
  const { toast } = useStore();
  const { t } = useT();
  const [role, setRole] = useState('accountant');

  return (
    <div className="screen stagger">
      <TopBar title={t('team.roles')} />
      <FilterPills
        options={[{ id: 'owner', label: 'Propriétaire' }, { id: 'accountant', label: 'Comptable' }, { id: 'assistant', label: 'Assistant' }]}
        value={role} onChange={setRole}
      />
      <div className="col" style={{ gap: 12 }}>
        {GROUPS.map((g) => (
          <div key={g.title} className="card">
            <h3 style={{ marginBottom: 10 }}>{g.title}</h3>
            <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
              {g.perms.map(([label, on]) => (
                <span key={label} className="small row" style={{ gap: 6 }}>{label} {on ? '✓' : '✗'}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-block" onClick={() => toast(t('common.saved'))}>{t('common.save')}</button>
      <div className="disclaimer">Le comptable ne voit jamais tes identifiants</div>
    </div>
  );
}
