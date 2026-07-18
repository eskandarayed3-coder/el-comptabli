import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const CLASSES = [
  { id: '1', label: { fr: 'Classe 1 · Capitaux', ar: 'الصنف 1 · رؤوس الأموال' }, accounts: [] },
  { id: '2', label: { fr: 'Classe 2 · Immobilisations', ar: 'الصنف 2 · الأصول الثابتة' }, accounts: [] },
  { id: '4', label: { fr: 'Classe 4 · Tiers', ar: 'الصنف 4 · الغير' }, accounts: [
    ['401', { fr: 'Fournisseurs', ar: 'الموردين' }],
    ['411', { fr: 'Clients', ar: 'الحرفاء' }],
    ['4366', { fr: 'TVA déductible', ar: 'TVA قابلة للخصم' }],
    ['4367', { fr: 'TVA collectée', ar: 'TVA مجمّعة' }],
  ] },
  { id: '6', label: { fr: 'Classe 6 · Charges', ar: 'الصنف 6 · المصاريف' }, accounts: [] },
  { id: '7', label: { fr: 'Classe 7 · Produits', ar: 'الصنف 7 · المداخيل' }, accounts: [] },
];

export default function ChartOfAccounts() {
  const { t, lang } = useT();
  const [open, setOpen] = useState('4');

  return (
    <div className="screen stagger">
      <TopBar title={`${t('accounting.accounts')} (SCE)`} />
      <div className="input-row"><input className="input" placeholder={t('common.search')} /></div>
      <div className="col" style={{ gap: 8 }}>
        {CLASSES.map((c) => (
          <div key={c.id} className="card inner">
            <button className="row between" style={{ width: '100%' }} onClick={() => setOpen(open === c.id ? null : c.id)}>
              <span style={{ fontWeight: 600 }}>{c.label[lang] || c.label.fr}</span>
              {open === c.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {open === c.id && c.accounts.length > 0 && (
              <div className="col" style={{ gap: 8, marginTop: 10 }}>
                {c.accounts.map(([num, label]) => (
                  <div key={num} className="row" style={{ gap: 10 }}>
                    <span className="pill teal num">{num}</span>
                    <span className="small">{label[lang] || label.fr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="tiny center muted">{lang === 'ar' ? 'مطابق للنظام المحاسبي للمؤسسات (SCE)' : 'Conforme au Système Comptable des Entreprises'}</p>
    </div>
  );
}
