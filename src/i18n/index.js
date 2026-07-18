import fr from './fr.js';
import ar from './ar.js';
import { useStore } from '../lib/store.jsx';

const dicts = { fr, ar };

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

export function translate(lang, key, vars) {
  let s = lookup(dicts[lang] || dicts.fr, key);
  if (s == null) s = lookup(dicts.fr, key);
  if (s == null) return key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function useT() {
  const { state } = useStore();
  const lang = state.settings.lang || 'fr';
  const t = (key, vars) => translate(lang, key, vars);
  return { t, lang, dir: lang === 'ar' ? 'rtl' : 'ltr' };
}

export const LANGS = [
  { code: 'ar', label: 'العربية التونسية', preview: 'الحساب والضرايب، مفسّرين ببساطة' },
  { code: 'fr', label: 'Français', preview: 'La compta et les impôts, expliqués simplement' },
  { code: 'en', label: 'English', preview: 'Accounting & taxes, made simple', disabled: true },
];
