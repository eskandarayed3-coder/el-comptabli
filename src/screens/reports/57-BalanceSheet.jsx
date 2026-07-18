import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

const ACTIF = [
  [{ fr: 'Immobilisations', ar: 'الأصول الثابتة' }, 2400],
  [{ fr: 'Créances clients', ar: 'مستحقات الحرفاء' }, 1250],
  [{ fr: 'Banque', ar: 'البنك' }, 3180],
  [{ fr: 'Caisse', ar: 'الصندوق' }, 220],
];
const PASSIF = [
  [{ fr: 'Capital', ar: 'رأس المال' }, 3000],
  [{ fr: 'Résultat', ar: 'النتيجة' }, 2738],
  [{ fr: 'Dettes fournisseurs', ar: 'ديون الموردين' }, 890],
  [{ fr: 'TVA à payer', ar: 'TVA للخلاص' }, 312],
  [{ fr: 'Emprunts', ar: 'القروض' }, 110],
];

export default function BalanceSheet() {
  const { lang } = useT();
  const L = (o) => o[lang] || o.fr;
  const totalActif = ACTIF.reduce((s, [, v]) => s + v, 0);
  const totalPassif = PASSIF.reduce((s, [, v]) => s + v, 0);

  const block = (title, rows, total) => (
    <div className="card">
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <div className="col" style={{ gap: 8 }}>
        {rows.map(([label, v]) => (
          <div key={label.fr} className="row between small"><span>{L(label)}</span><span className="num">{fmtDT(v, { decimals: 0 })}</span></div>
        ))}
      </div>
      <div className="card tint-teal" style={{ marginTop: 10, padding: 10 }}>
        <div className="row between small" style={{ fontWeight: 700 }}>
          <span>{lang === 'ar' ? 'المجموع' : 'Total'}</span>
          <span className="num">{fmtDT(total, { decimals: 0 })}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="screen stagger">
      <TopBar title={lang === 'ar' ? 'ميزانية مبسّطة · 30 جوان 2026' : 'Bilan simplifié · 30 juin 2026'} />
      {block(lang === 'ar' ? 'الأصول' : 'Actif', ACTIF, totalActif)}
      {block(lang === 'ar' ? 'الخصوم' : 'Passif', PASSIF, totalPassif)}
      {totalActif === totalPassif && (
        <div className="card tint-teal center"><span style={{ fontWeight: 700 }}>✓ {lang === 'ar' ? 'متوازنة' : 'Équilibré'}</span></div>
      )}
      <p className="tiny center muted">
        {lang === 'ar'
          ? 'أرقام تقريبية، المصادقة من خبير محاسبة ضرورية للاستعمال الرسمي'
          : 'Indicatif, certification par expert-comptable requise pour usage officiel'}
      </p>
    </div>
  );
}
