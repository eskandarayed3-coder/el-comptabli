import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const REPORTS = [
  { title: { fr: 'Bilan simplifié', ar: 'ميزانية مبسّطة' }, locked: false },
  { title: { fr: 'État de résultat', ar: 'قائمة النتائج' }, locked: false },
  { title: { fr: 'Notes annexes', ar: 'الإيضاحات الملحقة' }, locked: true },
];

export default function FinancialReportsAccounting() {
  const { t, lang } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={t('accounting.reports')} />
      <div className="col" style={{ gap: 12 }}>
        {REPORTS.map((r) => (
          <div key={r.title.fr} className="card" style={{ opacity: r.locked ? 0.6 : 1 }}>
            <div className="row between">
              <span style={{ fontWeight: 700 }}>{r.title[lang] || r.title.fr}</span>
              {r.locked && <span className="pill premium">{t('common.premium')}</span>}
            </div>
            <div style={{ height: 60, borderRadius: 10, background: 'var(--bg-2)', marginTop: 10 }} />
            {!r.locked && (
              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <span className="pill teal">Excel</span>
                <span className="pill white">PDF</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="tiny center muted">
        {lang === 'ar'
          ? 'أرقام تقريبية، لازم المصادقة من خبير محاسبة للاستعمال الرسمي'
          : 'Indicatif, à faire certifier par un expert-comptable pour usage officiel'}
      </p>
    </div>
  );
}
