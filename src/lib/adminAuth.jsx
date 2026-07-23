// Admin section auth — the /admin/* React panel had zero gating (anyone
// with the URL saw it), which was fine while it only showed mock data.
// Now that it shows real customers, a gate is required before rendering
// anything. Uses the same localStorage key as the static /admin/*.html
// pages (same origin), so entering the secret once on either surface
// carries over to the other.
import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'ec_admin_secret';
const AdminSecretContext = createContext(null);

export function AdminSecretProvider({ children }) {
  const [secret, setSecretState] = useState(() => localStorage.getItem(KEY) || '');
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const verify = async (candidate) => {
    setChecking(true);
    setError('');
    try {
      const res = await fetch(`/api/activate/stock?secret=${encodeURIComponent(candidate)}`);
      if (res.ok) {
        localStorage.setItem(KEY, candidate);
        setSecretState(candidate);
        setVerified(true);
        return true;
      }
      setError('Code admin incorrect.');
      return false;
    } catch {
      setError('Impossible de contacter le serveur.');
      return false;
    } finally {
      setChecking(false);
    }
  };

  // Auto-verify a secret already stored from a previous visit.
  useEffect(() => {
    if (secret && !verified) verify(secret);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem(KEY);
    setSecretState('');
    setVerified(false);
  };

  return (
    <AdminSecretContext.Provider value={{ secret, verified, checking, error, verify, logout }}>
      {children}
    </AdminSecretContext.Provider>
  );
}

export function useAdminSecret() {
  return useContext(AdminSecretContext);
}
