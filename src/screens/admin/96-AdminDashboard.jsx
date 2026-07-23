import { useEffect, useState } from 'react';
import KpiRow from '../../components/admin/KpiRow.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import { useAdminSecret } from '../../lib/adminAuth.jsx';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminDashboard() {
  const { secret } = useAdminSecret();
  const [users, setUsers] = useState(null);
  const [stock, setStock] = useState(null);

  useEffect(() => {
    fetch(`/api/users?secret=${encodeURIComponent(secret)}`).then((r) => r.json()).then(setUsers).catch(() => setUsers([]));
    fetch(`/api/activate/stock?secret=${encodeURIComponent(secret)}`).then((r) => r.json()).then(setStock).catch(() => {});
  }, [secret]);

  const premiumCount = users?.filter((u) => u.plan === 'premium').length ?? 0;
  const codesUsed = stock ? (stock.jour?.used || 0) + (stock.semaine?.used || 0) + (stock.mois?.used || 0) : 0;
  const recent = (users || []).slice(0, 6);

  return (
    <>
      <h1>Dashboard</h1>
      <KpiRow items={[
        { label: 'Utilisateurs inscrits', value: users ? users.length : '…' },
        { label: 'Abonnés Premium', value: users ? premiumCount : '…' },
        { label: 'Codes activés', value: stock ? codesUsed : '…' },
      ]} />

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>À propos de ces chiffres</h3>
        <p className="small muted">
          Ces compteurs viennent en direct de la base de données — pas de données de démonstration.
          Le suivi de croissance dans le temps (courbe mois par mois) et le revenu récurrent (MRR)
          nécessitent un historique d’événements qui n’existe pas encore : pour l’instant tu vois
          l’état actuel, pas son évolution.
        </p>
      </div>

      <div>
        <h3 style={{ marginBottom: 12 }}>Inscriptions récentes</h3>
        {!users && <p className="muted">Chargement…</p>}
        {users && users.length === 0 && (
          <div className="card tint-teal"><span className="small">Personne pour l’instant — dès qu’un client termine l’inscription, il apparaît ici.</span></div>
        )}
        {recent.length > 0 && (
          <DataTable
            columns={[
              { key: 'name', label: 'Nom', render: (r) => r.name || '(sans nom)' },
              { key: 'email', label: 'Email' },
              { key: 'plan', label: 'Plan', render: (r) => <span className={`pill ${r.plan === 'premium' ? 'premium' : 'teal'}`}>{r.plan === 'premium' ? 'Premium' : 'Gratuit'}</span> },
              { key: 'created_at', label: 'Inscrit le', render: (r) => fmtDate(r.created_at) },
            ]}
            rows={recent}
          />
        )}
      </div>
    </>
  );
}
