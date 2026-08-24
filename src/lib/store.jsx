import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { seedState } from './seed.js';
import { uid } from './format.js';
import { deleteDocument, v1 } from './api.js';
import { useAuth } from './auth.jsx';
import { getDisplayIdentity } from '../../shared/displayIdentity.js';
import { postedMonthTotals } from '../../shared/accountingReporting.js';

const StoreContext = createContext(null);

function withoutUi(state) {
  const { ui: _ui, ...persisted } = state;
  return persisted;
}

const init = () => seedState();

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
  const [cloudStatus, setCloudStatus] = useState('loading');

  const refresh = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'RESET' });
      setCloudStatus('signed-out');
      return null;
    }
    setCloudStatus('loading');
    try {
      const data = await v1('/bootstrap');
      const remoteSubscription = data.subscription || { plan: 'free', premium_until: null };
      const identity = getDisplayIdentity(user, data.profile || {}, data.settings?.lang || 'fr');
      const merged = {
        ...seedState(),
        ...data,
        profile: { ...seedState().profile, ...(data.profile || {}), email: identity.displayEmail },
        settings: { ...seedState().settings, ...(data.settings || {}), plan: remoteSubscription.plan || 'free', premiumUntil: remoteSubscription.premium_until || null },
        ui: { toast: null },
      };
      dispatch({ type: 'REPLACE', data: merged });
      setSubscription(remoteSubscription);
      setCloudStatus('synced');
      return merged;
    } catch (error) {
      setCloudStatus('error');
      throw error;
    }
  }, [user, setSubscription]);

  useEffect(() => {
    if (!authReady) return;
    refresh().catch(() => {});
  }, [authReady, refresh]);

  // A subscription response always wins over a stale local cache.
  useEffect(() => {
    if (!user || !subscription) return;
    const plan = subscription.plan === 'premium' && subscription.premium_until && new Date(subscription.premium_until) > new Date() ? 'premium' : 'free';
    if (state.settings.plan !== plan || state.settings.premiumUntil !== (subscription.premium_until || null)) {
      dispatch({ type: 'PATCH', slice: 'settings', data: { plan, premiumUntil: subscription.premium_until || null } });
    }
  }, [subscription, user, state.settings.plan, state.settings.premiumUntil]);

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

  const persistError = (error) => {
    dispatch({ type: 'TOAST', toast: { message: error?.friendly?.message || error?.message || 'Synchronisation impossible.', kind: 'error', id: uid() } });
    setCloudStatus('error');
  };

  const patch = async (slice, data) => {
    if (slice === 'ui') { dispatch({ type: 'PATCH', slice, data }); return true; }
    dispatch({ type: 'PATCH', slice, data });
    try {
      if (slice === 'settings') {
        const { plan: _plan, premiumUntil: _premiumUntil, ...preferences } = data;
        if (Object.keys(preferences).length) await v1('/preferences', { method: 'PATCH', body: JSON.stringify(preferences) });
      } else if (slice === 'profile') {
        const profileData = Object.fromEntries(Object.entries(data).filter(([key]) => ['name','regime','userType','city','activity','phone','sector','language','lang'].includes(key)));
        const operations = [];
        if (Object.keys(profileData).length) operations.push(v1('/profile', { method: 'PATCH', body: JSON.stringify(profileData) }));
        if (data.taxId !== undefined || data.companyName !== undefined) operations.push(v1('/organization', { method: 'PATCH', body: JSON.stringify({ taxId: data.taxId, name: data.companyName }) }));
        await Promise.all(operations);
      }
      setCloudStatus('synced');
      return true;
    } catch (error) {
      persistError(error);
      await refresh().catch(() => {});
      return false;
    }
  };

  const add = async (coll, item) => {
    const routes = { transactions: '/transactions', tasks: '/tasks', chats: '/chats', aiReports: '/ai-reports', calcHistory: '/calculations', activities: '/activities' };
    try {
      if (coll === 'documents' && item.id) {
        dispatch({ type: 'ADD', coll, item });
        return item;
      }
      const route = routes[coll];
      if (!route) throw new Error(`Collection non modifiable: ${coll}`);
      const result = await v1(route, { method: 'POST', body: JSON.stringify(item) });
      const saved = result.data;
      dispatch({ type: 'ADD', coll, item: saved });
      setCloudStatus('synced');
      return saved;
    } catch (error) { persistError(error); throw error; }
  };

  const update = async (coll, id, data) => {
    const routes = { transactions: `/transactions/${id}`, tasks: `/tasks/${id}`, deadlines: `/deadlines/${id}`, documents: `/documents/${id}` };
    try {
      if (coll === 'notifications') {
        await v1(`/notifications/${id}/read`, { method: 'POST', body: '{}' });
        dispatch({ type: 'UPDATE', coll, id, data: { ...data, read: true } });
        return;
      }
      const route = routes[coll];
      if (!route) throw new Error(`Collection non modifiable: ${coll}`);
      const result = await v1(route, { method: 'PATCH', body: JSON.stringify(data) });
      dispatch({ type: 'UPDATE', coll, id, data: result.data });
      setCloudStatus('synced');
    } catch (error) { persistError(error); throw error; }
  };

  const remove = async (coll, id) => {
    try {
      if (coll === 'transactions') await v1(`/transactions/${id}`, { method: 'DELETE' });
      else if (coll === 'documents') await deleteDocument(id);
      else throw new Error(`Collection non supprimable: ${coll}`);
      dispatch({ type: 'REMOVE', coll, id });
      setCloudStatus('synced');
    } catch (error) { persistError(error); throw error; }
  };

  const api = {
    state,
    dispatch,
    patch,
    add,
    update,
    remove,
    toast: (message, kind = 'success') => {
      dispatch({ type: 'TOAST', toast: { message, kind, id: uid() } });
    },
    logActivity: (text, icon = 'Activity') => add('activities', { text, icon }),
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
    importData: () => { throw new Error('La restauration directe est désactivée pour protéger les données comptables.'); },
    replaceCloudState: refresh,
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
    refresh,
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

// Derived helpers
export function monthTotals(transactions = [], ym, generalLedger = null) {
  // Accounting KPIs are authoritative only when derived from posted journal
  // lines. The legacy transaction stream remains available for operational
  // lists, but must not be used as a competing source for financial totals.
  if (Array.isArray(generalLedger)) {
    return postedMonthTotals(generalLedger, ym);
  }
  const inMonth = transactions.filter((t) => (t.date || '').startsWith(ym));
  const income = inMonth.filter((t) => t.kind === 'income').reduce((s, t) => s + Number(t.amountTTC ?? t.amount ?? 0), 0);
  const expense = inMonth.filter((t) => t.kind === 'expense').reduce((s, t) => s + Number(t.amountTTC ?? t.amount ?? 0), 0);
  return { income, expense, profit: income - expense };
}
