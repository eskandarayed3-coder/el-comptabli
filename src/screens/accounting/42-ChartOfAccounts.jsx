import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { PLAN_COMPTABLE } from '../../lib/planComptable.js';
import TopBar from '../../components/TopBar.jsx';

export default function ChartOfAccounts() {
  const { t, lang } = useT();
  const [open, setOpen] = useState('4');
  const [q, setQ] = useState('');

  // Search matches account numbers, account labels and section titles;
  // results auto-expand so matches are always visible.
  const query = q.trim().toLowerCase();
  const classes = useMemo(() => {
    if (!query) return PLAN_COMPTABLE;
    return PLAN_COMPTABLE
      .map((c) => ({
        ...c,
        sections: c.sections
          .map((s) => ({
            ...s,
            accounts: s.title.toLowerCase().includes(query) || s.num.startsWith(query)
              ? s.accounts
              : s.accounts.filter((a) => a.num.startsWith(query) || a.label.toLowerCase().includes(query)),
          }))
          .filter((s) => s.accounts.length > 0 || s.title.toLowerCase().includes(query) || s.num.startsWith(query)),
      }))
      .filter((c) => c.sections.length > 0);
  }, [query]);

  const counts = useMemo(
    () => Object.fromEntries(PLAN_COMPTABLE.map((c) => [c.id, c.sections.reduce((n, s) => n + s.accounts.length, 0)])),
    [],
  );

  return (
    <div className="screen stagger">
      <TopBar title={`${t('accounting.accounts')} (SCE)`} />
      <div className="input-row">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} />
        <span className="trailing"><SearchIcon size={16} /></span>
      </div>

      <div className="col" style={{ gap: 8 }}>
        {classes.map((c) => {
          const expanded = query ? true : open === c.id;
          return (
            <div key={c.id} className="card inner">
              <button className="row between" style={{ width: '100%', textAlign: 'start', gap: 8 }} onClick={() => setOpen(open === c.id ? null : c.id)}>
                <span style={{ fontWeight: 600 }} className="grow">{c.label[lang] || c.label.fr}</span>
                <span className="pill teal num" style={{ flexShrink: 0 }}>{counts[c.id]}</span>
                {expanded ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} style={{ flexShrink: 0 }} />}
              </button>

              {expanded && (
                <div className="col" style={{ gap: 4, marginTop: 10 }}>
                  {c.sections.map((s) => (
                    <div key={s.num} className="col" style={{ gap: 6, marginBottom: 8 }}>
                      <div className="row" style={{ gap: 8, background: 'var(--bg-2)', borderRadius: 10, padding: '8px 10px' }}>
                        <span className="num" style={{ fontWeight: 800, color: 'var(--teal-700)' }}>{s.num}</span>
                        <span className="small" style={{ fontWeight: 700 }}>{s.title}</span>
                      </div>
                      {s.accounts.map((a) => (
                        <div key={a.num} className="row" style={{ gap: 10, alignItems: 'flex-start', paddingInlineStart: 10 + a.depth * 16 }}>
                          <span className="pill num" style={{ minWidth: 54, justifyContent: 'center', flexShrink: 0, background: a.depth === 0 ? 'var(--tint-teal)' : 'var(--bg-2)', color: a.depth === 0 ? 'var(--teal-800)' : 'var(--text-2)' }}>
                            {a.num}
                          </span>
                          <span className={a.depth === 0 ? 'small' : 'tiny'} style={{ paddingTop: 3, fontWeight: a.depth === 0 ? 600 : 400 }}>{a.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {classes.length === 0 && <p className="small muted center">{t('money.noTx')}</p>}
      </div>

      <p className="tiny center muted">
        {lang === 'ar' ? 'النومنكلاتورة الكاملة · مطابقة للنظام المحاسبي للمؤسسات (SCE)' : 'Nomenclature complète · conforme au Système Comptable des Entreprises (JORT)'}
      </p>
    </div>
  );
}
