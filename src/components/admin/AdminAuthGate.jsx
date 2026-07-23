import { useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAdminSecret } from '../../lib/adminAuth.jsx';

export default function AdminAuthGate({ children }) {
  const { verified, checking, error, verify } = useAdminSecret();
  const [input, setInput] = useState('');

  if (verified) return children;

  return (
    <div className="admin-frame" dir="ltr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: 32, maxWidth: 340, width: '100%', textAlign: 'center' }}>
        <ShieldCheck size={32} color="var(--teal-700)" style={{ marginBottom: 12 }} />
        <h2 style={{ marginBottom: 4 }}>Espace admin</h2>
        <p className="tiny muted" style={{ marginBottom: 20 }}>Réservé au propriétaire de l’application.</p>
        <input
          className="input" type="password" placeholder="Code admin" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && input) verify(input); }}
          style={{ marginBottom: 12 }}
          autoFocus
        />
        {error && <p className="tiny" style={{ color: 'var(--pill-danger-fg)', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary btn-block" disabled={!input || checking} onClick={() => verify(input)}>
          {checking ? 'Vérification…' : 'Entrer'}
        </button>
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
