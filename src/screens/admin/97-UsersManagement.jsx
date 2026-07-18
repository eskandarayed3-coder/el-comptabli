import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import DataTable from '../../components/admin/DataTable.jsx';

const USERS = [
  { name: 'Eskandar A.', email: 'eskandar@mail.com', plan: 'Gratuit', regime: 'Réel', city: 'Nabeul', joined: '01/03/2026', active: 'Aujourd’hui' },
  { name: 'Rania S.', email: 'rania.s@mail.com', plan: 'Premium', regime: 'Forfaitaire', city: 'Tunis', joined: '15/07/2026', active: 'Hier' },
  { name: 'Mehdi K.', email: 'mehdi.k@mail.com', plan: 'Gratuit', regime: 'Réel', city: 'Sfax', joined: '15/07/2026', active: 'Il y a 3j' },
];

export default function UsersManagement() {
  const [selected, setSelected] = useState(USERS[0]);

  return (
    <>
      <h1>Utilisateurs</h1>
      <div className="row" style={{ gap: 12 }}>
        <input className="input" style={{ maxWidth: 280 }} placeholder="Rechercher…" />
        <select className="input" style={{ maxWidth: 160 }}><option>Plan</option><option>Gratuit</option><option>Premium</option></select>
        <select className="input" style={{ maxWidth: 160 }}><option>Régime</option><option>Réel</option><option>Forfaitaire</option></select>
        <select className="input" style={{ maxWidth: 160 }}><option>Ville</option><option>Nabeul</option><option>Tunis</option></select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <DataTable
          columns={[
            { key: 'name', label: 'Nom', render: (r) => (
              <button className="row" style={{ gap: 8 }} onClick={() => setSelected(r)}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--tint-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{r.name[0]}</span>
                {r.name}
              </button>
            ) },
            { key: 'email', label: 'Email' },
            { key: 'plan', label: 'Plan', render: (r) => <span className={`pill ${r.plan === 'Premium' ? 'premium' : 'teal'}`}>{r.plan}</span> },
            { key: 'regime', label: 'Régime' },
            { key: 'joined', label: 'Inscrit le' },
            { key: 'active', label: 'Dernière activité' },
            { key: 'actions', label: '', render: () => <MoreHorizontal size={16} /> },
          ]}
          rows={USERS}
        />

        {selected && (
          <div className="card" style={{ padding: 20 }}>
            <div className="col" style={{ gap: 4, alignItems: 'center', textAlign: 'center' }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>{selected.name[0]}</span>
              <h3>{selected.name}</h3>
              <span className="tiny muted">{selected.email}</span>
            </div>
            <div className="col" style={{ gap: 8, marginTop: 16 }}>
              <div className="row between small"><span className="muted">Plan</span><span>{selected.plan}</span></div>
              <div className="row between small"><span className="muted">Régime</span><span>{selected.regime}</span></div>
              <div className="row between small"><span className="muted">Ville</span><span>{selected.city}</span></div>
            </div>
            <button className="btn btn-danger-soft btn-block" style={{ marginTop: 16 }}>Suspendre</button>
          </div>
        )}
      </div>
    </>
  );
}
