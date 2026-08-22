import { LogOut, ShieldCheck } from 'lucide-react';
import { useAdminSecret } from '../../lib/adminAuth.jsx';

export default function AdminAuthGate({ children }) {
  const { verified, checking, error } = useAdminSecret();

  if (verified) return children;

  return (
    <div className="admin-frame" dir="ltr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: 32, maxWidth: 340, width: '100%', textAlign: 'center' }}>
        <ShieldCheck size={32} color="var(--teal-700)" style={{ marginBottom: 12 }} />
        <h2 style={{ marginBottom: 4 }}>Espace admin</h2>
        <p className="tiny muted" style={{ marginBottom: 20 }}>Réservé aux comptes administrateurs vérifiés.</p>
        {error && <p className="tiny" style={{ color: 'var(--pill-danger-fg)', marginBottom: 12 }}>{error}</p>}
        {checking && <p className="tiny muted">Vérification…</p>}
      </div>
    </div>
  );
}

export function AdminLogoutButton() {
  const { logout } = useAdminSecret();
  return (
    <button className="row" style={{ gap: 8, marginTop: 'auto', color: 'var(--text-2)' }} onClick={logout} title="Se déconnecter">
      <LogOut size={16} /> Déconnexion
    </button>
  );
}
