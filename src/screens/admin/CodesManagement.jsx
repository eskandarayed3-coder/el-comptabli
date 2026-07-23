import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import KpiRow from '../../components/admin/KpiRow.jsx';
import { useAdminSecret } from '../../lib/adminAuth.jsx';

const PLANS = [
  { id: 'jour', label: '1 Jour', price: '1 DT' },
  { id: 'semaine', label: '1 Semaine', price: '5 DT' },
  { id: 'mois', label: '1 Mois', price: '20 DT' },
];

export default function CodesManagement() {
  const { secret } = useAdminSecret();
  const [stock, setStock] = useState(null);
  const [codes, setCodes] = useState({}); // { jour: 'EC-J-XXXXXX', ... }
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [copiedPlan, setCopiedPlan] = useState(null);
  const [error, setError] = useState('');

  const loadStock = () => {
    fetch(`/api/activate/stock?secret=${encodeURIComponent(secret)}`)
      .then((r) => r.json())
      .then((d) => setStock(d))
      .catch(() => setError('Impossible de contacter le serveur.'));
  };

  useEffect(loadStock, [secret]);

  const getNextCode = async (planId) => {
    setLoadingPlan(planId);
    setError('');
    try {
      const res = await fetch(`/api/activate/next?secret=${encodeURIComponent(secret)}&plan=${planId}`);
      const d = await res.json();
      if (!res.ok) { setError(d?.error?.message || 'Erreur.'); return; }
      setCodes((c) => ({ ...c, [planId]: d.code }));
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const copy = (planId, code) => {
    navigator.clipboard?.writeText(code);
    setCopiedPlan(planId);
    setTimeout(() => setCopiedPlan(null), 1500);
  };

  return (
    <>
      <h1>Codes d’activation</h1>
      <p className="muted small">Stock des 300 codes à usage unique, directement depuis la base de données. Chaque code n’est utilisable qu’une fois.</p>

      {stock && (
        <KpiRow items={[
          { label: `${stock.backend === 'supabase' ? 'Base' : 'Fichier'} · Total`, value: PLANS.reduce((s, p) => s + (stock[p.id]?.total || 0), 0) },
          { label: 'Restants', value: PLANS.reduce((s, p) => s + ((stock[p.id]?.total || 0) - (stock[p.id]?.used || 0)), 0) },
          { label: 'Utilisés', value: PLANS.reduce((s, p) => s + (stock[p.id]?.used || 0), 0) },
        ]} />
      )}

      {error && <div className="card tint-coral"><span className="small">{error}</span></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 20 }}>
        {PLANS.map((p) => {
          const s = stock?.[p.id];
          const remaining = s ? s.total - s.used : null;
          return (
            <div key={p.id} className="card" style={{ padding: 20 }}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{p.label}</span>
                <span className="tiny muted num">{p.price}</span>
              </div>
              <div className="tiny muted" style={{ marginBottom: 14 }}>
                {remaining != null ? `${remaining} / ${s.total} restants` : '…'}
              </div>

              {codes[p.id] ? (
                <button
                  className="row between"
                  style={{ width: '100%', background: 'var(--tint-teal)', borderRadius: 10, padding: '10px 12px' }}
                  onClick={() => copy(p.id, codes[p.id])}
                >
                  <span className="num" style={{ fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate' }}>{codes[p.id]}</span>
                  {copiedPlan === p.id ? <Check size={16} color="var(--teal-700)" /> : <Copy size={16} color="var(--teal-700)" />}
                </button>
              ) : (
                <button className="btn btn-primary btn-block btn-sm" disabled={loadingPlan === p.id || remaining === 0} onClick={() => getNextCode(p.id)}>
                  {loadingPlan === p.id ? '…' : remaining === 0 ? 'Épuisé' : 'Prendre un code'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
