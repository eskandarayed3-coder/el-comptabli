import { useMemo } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

export default function BalanceSheet() {
  const { state } = useStore();
  const { lang, t } = useT();
  const L = (o) => o[lang] || o.fr;

  // Derived from real transactions only — this app doesn't track capital,
  // immobilisations, or loan balances, so those lines are omitted rather
  // than shown as fabricated zeros or fake numbers.
  const { tresorerie, resultat, tvaAPayer, hasData } = useMemo(() => {
    const income = state.transactions.filter((tx) => tx.kind === 'income');
    const expense = state.transactions.filter((tx) => tx.kind === 'expense');
    const totalIncome = income.reduce((s, tx) => s + (tx.amountTTC ?? tx.amount ?? 0), 0);
    const totalExpense = expense.reduce((s, tx) => s + (tx.amountTTC ?? tx.amount ?? 0), 0);
    const tvaCollectee = income.reduce((s, tx) => s + (tx.tva ?? 0), 0);
    const tvaDeductible = expense.reduce((s, tx) => s + (tx.tva ?? 0), 0);
    return {
      tresorerie: totalIncome - totalExpense,
      resultat: totalIncome - totalExpense,
      tvaAPayer: Math.max(0, tvaCollectee - tvaDeductible),
      hasData: state.transactions.length > 0,
    };
  }, [state.transactions]);

  const ACTIF = [[{ fr: 'Trésorerie (revenus − dépenses)', ar: 'الخزينة (المداخيل − المصاريف)' }, tresorerie]];
  const PASSIF = [
    [{ fr: 'Résultat', ar: 'النتيجة' }, resultat],
    [{ fr: 'TVA à payer', ar: 'TVA للخلاص' }, tvaAPayer],
  ];
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
      <TopBar title={lang === 'ar' ? 'ميزانية مبسّطة' : 'Bilan simplifié'} />
      {!hasData ? (
        <p className="small muted center">{t('money.noTx')}</p>
      ) : (
        <>
          {block(lang === 'ar' ? 'الأصول' : 'Actif', ACTIF, totalActif)}
          {block(lang === 'ar' ? 'الخصوم' : 'Passif', PASSIF, totalPassif)}
        </>
      )}
      <p className="tiny center muted">
        {lang === 'ar'
          ? 'مبسّطة من معاملاتك فقط (بلا رأس مال ولا أصول ثابتة ولا قروض) — استشر خبير محاسبة لبيان رسمي'
          : 'Simplifié à partir de tes transactions uniquement (hors capital, immobilisations, emprunts) — consulte un expert-comptable pour un bilan officiel'}
      </p>
    </div>
  );
}
