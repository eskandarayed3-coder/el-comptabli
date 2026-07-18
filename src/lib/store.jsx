import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { seedState } from './seed.js';
import { uid } from './format.js';

const KEY = 'elcomptabli:v1';
const StoreContext = createContext(null);

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

  useEffect(() => {
    const { ui, ...persisted } = state;
    localStorage.setItem(KEY, JSON.stringify(persisted));
  }, [state]);

  useEffect(() => {
    const lang = state.settings.lang || 'fr';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [state.settings.lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme || 'light';
  }, [state.settings.theme]);

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
      const { ui, ...data } = state;
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
    // Unlock Premium for `days`, stacking on any time already left.
    activatePlan: (days) => {
      const now = Date.now();
      const current = state.settings.premiumUntil ? new Date(state.settings.premiumUntil).getTime() : 0;
      const until = new Date(Math.max(now, current) + days * 86400000).toISOString();
      dispatch({ type: 'PATCH', slice: 'settings', data: { plan: 'premium', premiumUntil: until } });
    },
  }), [state]);

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
