import { useState } from 'react';
import DataTable from '../../components/admin/DataTable.jsx';

const TABS = ['Guides', 'FAQ', 'Lois', 'Annonces'];
const ARTICLES = [
  { title: 'TVA : collectée vs déductible', domain: 'Fiscalité', status: 'Publié', views: 1240, updated: '10/07/2026' },
  { title: 'Le régime forfaitaire expliqué', domain: 'Fiscalité', status: 'Brouillon', views: 0, updated: '15/07/2026' },
];

export default function ContentManagement() {
  const [tab, setTab] = useState('Guides');

  return (
    <>
      <h1>Contenu</h1>
      <div className="segmented" style={{ maxWidth: 400 }}>
        {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <DataTable
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'domain', label: 'Domaine', render: (r) => <span className="pill teal">{r.domain}</span> },
            { key: 'status', label: 'Statut', render: (r) => <span className={`pill ${r.status === 'Publié' ? 'success' : 'warning'}`}>{r.status}</span> },
            { key: 'views', label: 'Vues' }, { key: 'updated', label: 'MàJ le' },
          ]}
          rows={ARTICLES}
        />
        <div className="card" style={{ padding: 16 }}>
          <div className="row between"><span className="small" style={{ fontWeight: 600 }}>Éditeur</span><span className="pill success">vérifié 2026</span></div>
          <textarea className="input" style={{ minHeight: 200, marginTop: 10 }} defaultValue="# TVA : collectée vs déductible..." />
          <div className="field" style={{ marginTop: 10 }}><label>Publier le</label><input className="input" type="datetime-local" /></div>
        </div>
      </div>
    </>
  );
}
