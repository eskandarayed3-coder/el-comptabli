import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from './supabase.js';

const AuthContext = createContext(null);

async function readJson(response) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(json?.error?.message || 'Erreur réseau'), { friendly: json?.error });
  return json;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState({ plan: 'free', premium_until: null });
  const [ready, setReady] = useState(false);

  const restoreSession = useCallback(async () => {
    if (!supabaseConfigured) {
      setReady(true);
      return null;
    }
    try {
      const data = await readJson(await fetch('/api/auth/me', { credentials: 'same-origin' }));
      setUser(data.user);
      setSubscription(data.subscription || { plan: 'free', premium_until: null });
      return data.user;
    } catch {
      setUser(null);
      setSubscription({ plan: 'free', premium_until: null });
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  const establishSession = useCallback(async (session) => {
    if (!session?.access_token || !session?.refresh_token) throw new Error('Lien de connexion invalide.');
    const data = await readJson(await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: session.access_token, refreshToken: session.refresh_token }),
    }));
    setUser(data.user);
    setReady(true);
    return data.user;
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const requestMagicLink = useCallback(async (email, next = '/home') => {
    if (!supabase) throw new Error('La connexion sécurisée n’est pas configurée.');
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/home';
    const redirect = new URL('/auth/callback', window.location.origin);
    redirect.searchParams.set('next', safeNext);
    const { error } = await supabase.auth.signInWithOtp({
      email: String(email || '').trim(),
      options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true },
    });
    if (error) throw error;
  }, []);

  const completeMagicLink = useCallback(async () => {
    if (!supabase) throw new Error('La connexion sécurisée n’est pas configurée.');
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) throw new Error('Le lien est expiré ou a déjà été utilisé.');
    return establishSession(data.session);
  }, [establishSession]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' });
    setUser(null);
    setSubscription({ plan: 'free', premium_until: null });
  }, []);

  const deleteAccount = useCallback(async () => {
    await readJson(await fetch('/api/auth/account', { method: 'DELETE', credentials: 'same-origin' }));
    setUser(null);
    setSubscription({ plan: 'free', premium_until: null });
  }, []);

  const value = useMemo(() => ({
    user, subscription, setSubscription, ready, configured: supabaseConfigured,
    requestMagicLink, completeMagicLink, restoreSession, signOut, deleteAccount,
  }), [user, subscription, ready, requestMagicLink, completeMagicLink, restoreSession, signOut, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
