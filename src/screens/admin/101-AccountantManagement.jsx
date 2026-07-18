import DataTable from '../../components/admin/DataTable.jsx';

const PENDING = [
  { name: 'Fares D.', num: 'OEC-2451', city: 'Tunis' },
  { name: 'Ines M.', num: 'OEC-3120', city: 'Sousse' },
];

const ACTIVE = [
  { name: 'Mounir B.', city: 'Nabeul', rating: 4.8, consultations: 42, revenue: '2 100 DT', status: 'Actif' },
  { name: 'Sonia K.', city: 'Tunis', rating: 4.9, consultations: 28, revenue: '1 680 DT', status: 'Actif' },
];

export default function AccountantManagement() {
  return (
    <>
      <h1>Experts-comptables</h1>
      <h3>Candidatures en attente</h3>
      <div className="row" style={{ gap: 16 }}>
        {PENDING.map((p) => (
          <div key={p.num} className="card" style={{ padding: 16, width: 260 }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{p.name[0]}</span>
              <div className="col"><span style={{ fontWeight: 600 }}>{p.name}</span><span className="tiny muted">{p.num} · {p.city}</span></div>
            </div>
            <div className="row" style={{ gap: 6, marginTop: 10 }}><span className="pill teal">CIN</span><span className="pill teal">Diplôme</span></div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary btn-sm grow">Vérifier ✓</button>
              <button className="btn btn-ghost btn-sm grow">Refuser</button>
            </div>
          </div>
        ))}
      </div>

      <h3>Experts actifs</h3>
      <DataTable
        columns={[
          { key: 'name', label: 'Nom' }, { key: 'city', label: 'Ville' },
          { key: 'rating', label: 'Note', render: (r) => `★ ${r.rating}` },
          { key: 'consultations', label: 'Consultations' }, { key: 'revenue', label: 'Revenus générés' },
          { key: 'status', label: 'Statut', render: (r) => <span className="pill success">{r.status}</span> },
        ]}
        rows={ACTIVE}
      />

      <div className="card" style={{ padding: 20, maxWidth: 360 }}>
        <h3 style={{ marginBottom: 10 }}>Commission</h3>
        <div className="field"><label>Taux plateforme</label><input className="input" defaultValue="15%" /></div>
      </div>
    </>
  );
}
