import { useState } from 'react';
import DataTable from '../../components/admin/DataTable.jsx';

const SEGMENTS = ['Tous', 'Gratuit', 'Premium', 'Régime réel', 'En retard TVA'];
const HISTORY = [
  { title: 'Rappel TVA juillet', sent: '14/07/2026', audience: 'En retard TVA', openRate: '68%' },
  { title: 'Nouveauté : rapports IA', sent: '01/07/2026', audience: 'Premium', openRate: '54%' },
];

export default function NotificationsManagement() {
  const [segments, setSegments] = useState(['Tous']);
  const toggle = (s) => setSegments((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));

  return (
    <>
      <h1>Notifications</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3>Audience</h3>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {SEGMENTS.map((s) => (
              <button key={s} className={`chip ${segments.includes(s) ? 'active' : ''}`} onClick={() => toggle(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3>Canaux</h3>
          <div className="row" style={{ gap: 20, marginTop: 10 }}>
            <label className="row small" style={{ gap: 6 }}><input type="checkbox" defaultChecked /> Push</label>
            <label className="row small" style={{ gap: 6 }}><input type="checkbox" defaultChecked /> Email</label>
          </div>
        </div>
        <div className="field"><label>Message (FR)</label><textarea className="input" /></div>
        <div className="field"><label>Message (AR)</label><textarea className="input" dir="rtl" /></div>
      </div>
      <div className="row" style={{ gap: 10 }}>
        <input className="input" type="datetime-local" style={{ maxWidth: 240 }} />
        <button className="btn btn-ghost">Envoyer un test</button>
        <button className="btn btn-primary">Envoyer</button>
      </div>
      <h3>Historique</h3>
      <DataTable columns={[{ key: 'title', label: 'Titre' }, { key: 'sent', label: 'Envoyé le' }, { key: 'audience', label: 'Audience' }, { key: 'openRate', label: 'Taux d’ouverture' }]} rows={HISTORY} />
    </>
  );
}
