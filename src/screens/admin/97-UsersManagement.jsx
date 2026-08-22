import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import DataTable from '../../components/admin/DataTable.jsx';
import { adminFetch } from '../../lib/api.js';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtRelative(iso) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Aujourd’hui';
  if (days === 1) return 'Hier';
  return `Il y a ${days}j`;
}

export default function UsersManagement() {
  const [users, setUsers] = useState(null); // null = loading
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminFetch('/users')
      .then((d) => {
        if (cancelled) return;
        setUsers(d);
        setSelected(d[0] || null);
      })
      .catch((error) => { if (!cancelled) { setErrorMsg(error.message || 'Impossible de contacter le serveur.'); setUsers([]); } });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    if (!users) return [];
    return users
      .filter((u) => !planFilter || (planFilter === 'Premium' ? u.plan === 'premium' : u.plan !== 'premium'))
      .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  }, [users, q, planFilter]);

  if (users === null) {
    return <><h1>Utilisateurs</h1><p className="muted">Chargement…</p></>;
  }

  return (
    <>
      <h1>Utilisateurs</h1>
      <div className="row" style={{ gap: 12 }}>
        <input className="input" style={{ maxWidth: 280 }} placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" style={{ maxWidth: 160 }} value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="">Plan</option><option>Gratuit</option><option>Premium</option>
        </select>
      </div>

      {errorMsg && <div className="card tint-coral"><span className="small">{errorMsg}</span></div>}
      {!errorMsg && users.length === 0 && (
        <div className="card tint-teal"><span className="small">Personne pour l’instant — dès qu’un client termine l’inscription, il apparaît ici.</span></div>
      )}

      {rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <DataTable
            columns={[
              { key: 'name', label: 'Nom', render: (r) => (
                <button className="row" style={{ gap: 8 }} onClick={() => setSelected(r)}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--tint-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{(r.name || '?')[0]?.toUpperCase()}</span>
                  {r.name || '(sans nom)'}
                </button>
              ) },
              { key: 'email', label: 'Email' },
              { key: 'plan', label: 'Plan', render: (r) => <span className={`pill ${r.plan === 'premium' ? 'premium' : 'teal'}`}>{r.plan === 'premium' ? 'Premium' : 'Gratuit'}</span> },
              { key: 'regime', label: 'Régime' },
              { key: 'created_at', label: 'Inscrit le', render: (r) => fmtDate(r.created_at) },
              { key: 'last_active_at', label: 'Dernière activité', render: (r) => fmtRelative(r.last_active_at) },
              { key: 'actions', label: '', render: () => <MoreHorizontal size={16} /> },
            ]}
            rows={rows}
          />

          {selected && (
            <div className="card" style={{ padding: 20 }}>
              <div className="col" style={{ gap: 4, alignItems: 'center', textAlign: 'center' }}>
                <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>{(selected.name || '?')[0]?.toUpperCase()}</span>
                <h3>{selected.name || '(sans nom)'}</h3>
                <span className="tiny muted">{selected.email}</span>
              </div>
              <div className="col" style={{ gap: 8, marginTop: 16 }}>
                <div className="row between small"><span className="muted">Plan</span><span>{selected.plan === 'premium' ? 'Premium' : 'Gratuit'}</span></div>
                <div className="row between small"><span className="muted">Régime</span><span>{selected.regime || '—'}</span></div>
                <div className="row between small"><span className="muted">Ville</span><span>{selected.city || '—'}</span></div>
                <div className="row between small"><span className="muted">Activité</span><span>{selected.activity || '—'}</span></div>
                {selected.premium_until && <div className="row between small"><span className="muted">Premium jusqu’au</span><span>{fmtDate(selected.premium_until)}</span></div>}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
