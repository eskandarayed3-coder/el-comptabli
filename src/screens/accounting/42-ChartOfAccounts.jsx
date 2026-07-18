import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { PLAN_COMPTABLE } from '../../lib/planComptable.js';
import TopBar from '../../components/TopBar.jsx';

export default function ChartOfAccounts() {
  const { t, lang } = useT();
  const [open, setOpen] = useState('4');
  const [q, setQ] = useState('');

  // Searching filters accounts by number or label and auto-expands matches.
  const query = q.trim().toLowerCase();
  const classes = useMemo(() => {
    if (!query) return PLAN_COMPTABLE;
    return PLAN_COMPTABLE
      .map((c) => ({ ...c, accounts: c.accounts.filter(([num, label]) => num.startsWith(query) || label.toLowerCase().includes(query)) }))
      .filter((c) => c.accounts.length > 0);
  }, [query]);

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
              <button className="row between" style={{ width: '100%', textAlign: 'start' }} onClick={() => setOpen(open === c.id ? null : c.id)}>
                <span style={{ fontWeight: 600 }}>{c.label[lang] || c.label.fr}</span>
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expanded && (
                <div className="col" style={{ gap: 8, marginTop: 10 }}>
                  {c.accounts.map(([num, label]) => (
                    <div key={num} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                      <span className="pill teal num" style={{ minWidth: 52, justifyContent: 'center', flexShrink: 0 }}>{num}</span>
                      <span className="small" style={{ paddingTop: 3 }}>{label}</span>
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
        {lang === 'ar' ? 'مطابق للنظام المحاسبي للمؤسسات (SCE) · مصدر موثّق' : 'Conforme au Système Comptable des Entreprises · source vérifiée (JORT)'}
      </p>
    </div>
  );
}
