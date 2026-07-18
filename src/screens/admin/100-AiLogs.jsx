import { useState } from 'react';
import KpiRow from '../../components/admin/KpiRow.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

const LOGS = [
  { at: '16/07 10:24', q: 'Est-ce que je dois facturer la TVA ?', sources: ['TVA'], confidence: 92, flagged: false, user: 'u_8f21' },
  { at: '16/07 09:12', q: 'C’est quoi le régime forfaitaire ?', sources: ['Forfaitaire'], confidence: 88, flagged: false, user: 'u_2a90' },
  { at: '15/07 18:40', q: 'Comment déclarer un revenu à l’étranger ?', sources: [], confidence: 41, flagged: true, user: 'u_5c31' },
];

export default function AiLogs() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <h1>Logs IA</h1>
      <KpiRow items={[{ label: 'Taux de réponses sourcées', value: '94%' }, { label: 'Escalades expert', value: '3%' }]} />
      <div className="row" style={{ gap: 12 }}>
        <input className="input" type="date" style={{ maxWidth: 180 }} />
        <select className="input" style={{ maxWidth: 160 }}><option>Statut</option><option>Sourcée</option><option>Sans source</option></select>
      </div>
      <DataTable
        columns={[
          { key: 'at', label: 'Horodatage' },
          { key: 'q', label: 'Question', render: (r) => <button onClick={() => setSelected(r)}>{r.q}</button> },
          { key: 'sources', label: 'Sources RAG', render: (r) => r.sources.map((s) => <span key={s} className="pill teal" style={{ marginInlineEnd: 4 }}>{s}</span>) },
          { key: 'confidence', label: 'Confiance', render: (r) => `${r.confidence}%` },
          { key: 'flagged', label: '', render: (r) => r.flagged && <span className="pill danger">sans source</span> },
          { key: 'user', label: 'Utilisateur' },
        ]}
        rows={LOGS}
      />
      {selected && (
        <div className="card" style={{ padding: 20, position: 'fixed', top: 100, insetInlineEnd: 40, width: 360, boxShadow: 'var(--shadow-float)' }}>
          <h3>{selected.q}</h3>
          <p className="small muted" style={{ marginTop: 10 }}>Réponse générée avec {selected.sources.length} source(s) récupérée(s).</p>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 12 }}>Marquer pour révision</button>
        </div>
      )}
    </>
  );
}
