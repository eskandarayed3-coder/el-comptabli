import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { seedState } from './seed.js';
import { uid } from './format.js';
import { loadCloudState, saveCloudState } from './api.js';
import { useAuth } from './auth.jsx';

const KEY = 'elcomptabli:v1';
const StoreContext = createContext(null);

function withoutUi(state) {
  const { ui, ...persisted } = state;
  return persisted;
}

function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // `ui` is deliberately excluded from persistence (toasts shouldn't survive reload).
    if (saved && saved.__v === 1) {
      // A time-limited Premium plan that has run out reverts to Free on load.
      if (saved.settings?.premiumUntil && new Date(saved.settings.premiumUntil) < new Date()) {
        saved.settings.plan = 'free';
        saved.settings.premiumUntil = null;
      }
      return { ...saved, ui: { toast: null } };
    }
  } catch { /* corrupt storage — reseed */ }
  return seedState();
}

// True while a paid plan is still within its validity window.
export function isPremium(settings = {}) {
  if (settings.plan !== 'premium') return false;
  if (!settings.premiumUntil) return true; // legacy / unlimited
  return new Date(settings.premiumUntil) > new Date();
}

// Days left on the current plan (0 if none / expired).
export function premiumDaysLeft(settings = {}) {
  if (!isPremium(settings) || !settings.premiumUntil) return 0;
  return Math.max(0, Math.ceil((new Date(settings.premiumUntil) - new Date()) / 86400000));
}

// Live, second-by-second countdown to a plan's expiry. Returns null while
// there's no time-limited plan to count down; ticks every second otherwise.
export function usePremiumCountdown(premiumUntil) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!premiumUntil) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [premiumUntil]);
  if (!premiumUntil) return null;
  const msLeft = Math.max(0, new Date(premiumUntil).getTime() - now);
  const totalSec = Math.floor(msLeft / 1000);
  return {
    msLeft,
    expired: msLeft <= 0,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH': // { slice: 'settings'|'profile', data: {...} }
      return { ...state, [action.slice]: { ...state[action.slice], ...action.data } };
    case 'ADD': { // { coll, item } — prepends
      const item = { id: action.item.id || uid(), ...action.item };
      return { ...state, [action.coll]: [item, ...(state[action.coll] || [])] };
    }
    case 'UPDATE': // { coll, id, data }
      return {
        ...state,
        [action.coll]: (state[action.coll] || []).map((x) => (x.id === action.id ? { ...x, ...action.data } : x)),
      };
    case 'REMOVE':
      return { ...state, [action.coll]: (state[action.coll] || []).filter((x) => x.id !== action.id) };
    case 'TOAST':
      return { ...state, ui: { ...state.ui, toast: action.toast } };
    case 'REPLACE': // { data } — full state restore from a backup import
      return { ...seedState(), ...action.data, __v: 1, ui: { toast: null } };
    case 'RESET':
      return seedState();
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init);
  const { user, subscription, setSubscription, ready: authReady } = useAuth();
  const [cloudStatus, setCloudStatus] = useState('local');
  const stateRef = useRef(state);
  const cloudReadyRef = useRef(false);
  const lastCloudState = useRef('');

  useEffect(() => {
    stateRef.current = state;
    localStorage.setItem(KEY, JSON.stringify(withoutUi(state)));
  }, [state]);

  // The server is the source of truth for account/subscription ownership;
  // local storage is retained only as an offline cache and migration fallback.
  useEffect(() => {
    let cancelled = false;
    cloudReadyRef.current = false;
    if (!authReady || !user) {
      setCloudStatus('local');
      return undefined;
    }
    setCloudStatus('loading');
    loadCloudState()
      .then(async ({ data, subscription: remoteSubscription }) => {
        if (cancelled) return;
        const serverPlan = remoteSubscription?.plan === 'premium' && remoteSubscription?.premium_until && new Date(remoteSubscription.premium_until) > new Date()
          ? 'premium' : 'free';
        const merged = data && data.__v === 1
          ? {
            ...seedState(),
            ...data,
            profile: { ...seedState().profile, ...(data.profile || {}), email: user.email || '' },
            settings: { ...seedState().settings, ...(data.settings || {}), plan: serverPlan, premiumUntil: remoteSubscription?.premium_until || null },
            ui: { toast: null },
          }
          : {
            ...stateRef.current,
            profile: { ...stateRef.current.profile, email: user.email || '' },
            settings: { ...stateRef.current.settings, plan: serverPlan, premiumUntil: remoteSubscription?.premium_until || null },
          };
        lastCloudState.current = JSON.stringify(withoutUi(merged));
        if (data?.__v === 1) dispatch({ type: 'REPLACE', data: merged });
        else await saveCloudState(withoutUi(merged));
        setSubscription(remoteSubscription || { plan: 'free', premium_until: null });
        cloudReadyRef.current = true;
        setCloudStatus('synced');
      })
      .catch(() => { if (!cancelled) setCloudStatus('error'); });
    return () => { cancelled = true; };
  }, [authReady, user?.id, user?.email, setSubscription]);

  useEffect(() => {
    if (!user || !cloudReadyRef.current) return undefined;
    const persisted = withoutUi(state);
    const serialized = JSON.stringify(persisted);
    if (serialized === lastCloudState.current) return undefined;
    const timer = setTimeout(() => {
      saveCloudState(persisted)
        .then(() => { lastCloudState.current = serialized; setCloudStatus('synced'); })
        .catch(() => setCloudStatus('error'));
    }, 800);
    return () => clearTimeout(timer);
  }, [state, user?.id]);

  // A subscription response always wins over a stale local cache.
  useEffect(() => {
    if (!user || !subscription) return;
    const plan = subscription.plan === 'premium' && subscription.premium_until && new Date(subscription.premium_until) > new Date() ? 'premium' : 'free';
    if (state.settings.plan !== plan || state.settings.premiumUntil !== (subscription.premium_until || null)) {
      dispatch({ type: 'PATCH', slice: 'settings', data: { plan, premiumUntil: subscription.premium_until || null } });
    }
  }, [subscription, user?.id, state.settings.plan, state.settings.premiumUntil]);

  useEffect(() => {
    const lang = state.settings.lang || 'fr';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [state.settings.lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme || 'light';
  }, [state.settings.theme]);

  useEffect(() => {
    document.documentElement.dataset.textSize = state.settings.textSize || 'normal';
  }, [state.settings.textSize]);

  const api = useMemo(() => ({
    state,
    dispatch,
    patch: (slice, data) => dispatch({ type: 'PATCH', slice, data }),
    add: (coll, item) => dispatch({ type: 'ADD', coll, item }),
    update: (coll, id, data) => dispatch({ type: 'UPDATE', coll, id, data }),
    remove: (coll, id) => dispatch({ type: 'REMOVE', coll, id }),
    toast: (message, kind = 'success') => {
      dispatch({ type: 'TOAST', toast: { message, kind, id: uid() } });
    },
    logActivity: (text, icon = 'Activity') => {
      dispatch({ type: 'ADD', coll: 'activities', item: { text, icon, at: new Date().toISOString() } });
    },
    exportData: () => {
      const data = withoutUi(state);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `el-comptabli-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    importData: (json) => dispatch({ type: 'REPLACE', data: json }),
    reset: () => dispatch({ type: 'RESET' }),
    // Subscription dates only come from the server after a redeemed code or
    // trial. The browser never calculates or grants its own paid access.
    activatePlan: (premiumUntil) => {
      if (!premiumUntil) return;
      const next = { plan: 'premium', premium_until: premiumUntil };
      setSubscription(next);
      dispatch({ type: 'PATCH', slice: 'settings', data: { plan: 'premium', premiumUntil } });
    },
    cloudStatus,
  }), [state, setSubscription, cloudStatus]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

// Derived helpers
export function monthTotals(transactions, ym) {
  const inMonth = transactions.filter((t) => (t.date || '').startsWith(ym));
  const income = inMonth.filter((t) => t.kind === 'income').reduce((s, t) => s + Number(t.amountTTC ?? t.amount ?? 0), 0);
  const expense = inMonth.filter((t) => t.kind === 'expense').reduce((s, t) => s + Number(t.amountTTC ?? t.amount ?? 0), 0);
  return { income, expense, profit: income - expense };
}
