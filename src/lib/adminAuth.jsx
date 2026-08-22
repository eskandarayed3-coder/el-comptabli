import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';

const AdminContext = createContext(null);

export function AdminSecretProvider({ children }) {
  const { user, ready, signOut } = useAuth();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!ready) return undefined;
    if (!user) {
      setChecking(false);
      setVerified(false);
      setError('Connecte-toi avec un compte administrateur.');
      return undefined;
    }
    setChecking(true);
    fetch('/api/admin/health', { credentials: 'same-origin' })
      .then((res) => {
        if (cancelled) return;
        setVerified(res.ok);
        setError(res.ok ? '' : 'Ce compte n’a pas accès à l’administration.');
      })
      .catch(() => { if (!cancelled) { setVerified(false); setError('Impossible de vérifier les droits administrateur.'); } })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [user?.id, ready]);

  return <AdminContext.Provider value={{ verified, checking, error, logout: signOut }}>{children}</AdminContext.Provider>;
}

export function useAdminSecret() {
  return useContext(AdminContext);
}
