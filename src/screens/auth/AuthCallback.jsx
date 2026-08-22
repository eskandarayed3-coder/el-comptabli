import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { completeMagicLink } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    completeMagicLink()
      .then(() => {
        if (!cancelled) {
          const next = params.get('next');
          navigate(next?.startsWith('/') && !next.startsWith('//') ? next : '/home', { replace: true });
        }
      })
      .catch((cause) => { if (!cancelled) setError(cause.message || 'Lien de connexion invalide.'); });
    return () => { cancelled = true; };
  }, [completeMagicLink, navigate, params]);

  return (
    <div className="screen no-nav center" style={{ justifyContent: 'center', alignItems: 'center', gap: 14 }}>
      {error ? (
        <>
          <h2>Connexion impossible</h2>
          <p className="small muted">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/login', { replace: true })}>Recevoir un nouveau lien</button>
        </>
      ) : (
        <>
          <Loader2 size={28} className="spin" color="var(--teal-700)" />
          <p className="small muted">Connexion sécurisée en cours…</p>
        </>
      )}
    </div>
  );
}
