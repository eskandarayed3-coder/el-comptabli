import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, TrendingDown } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, remove, toast } = useStore();
  const { t, lang } = useT();
  const tx = state.transactions.find((x) => x.id === id);
  if (!tx) return null;

  const sameCategoryCount = state.transactions.filter((x) => x.kind === 'expense' && x.category === tx.category).length;

  const del = async () => { try { await remove('transactions', tx.id); toast(t('common.deleted')); navigate('/expenses'); } catch { /* store reports */ } };

  return (
    <div className="screen stagger">
      <TopBar title={t('money.details')} />
      <div className="center col" style={{ gap: 10, alignItems: 'center' }}>
        <span className="icon-wrap coral" style={{ width: 56, height: 56 }}><TrendingDown size={24} /></span>
        <span className="num" style={{ fontSize: 34, fontWeight: 700, color: 'var(--pill-danger-fg)' }}>{fmtDT(-tx.amountTTC, { sign: true, decimals: 0 })}</span>
      </div>

      <div className="card">
        <div className="col" style={{ gap: 10 }}>
          {[
            [t('money.vendor'), tx.vendor || 'N/D'],
            [t('common.date'), fmtDate(tx.date, lang)],
            ['TVA récupérable', fmtDT(tx.tva)],
          ].map(([k, v]) => (
            <div key={k} className="row between small">
              <span className="muted">{k}</span>
              <span style={{ fontWeight: 600 }} className="num">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {sameCategoryCount > 1 && (
        <div className="card tint-indigo">
          <div className="row" style={{ gap: 10 }}>
            <Sparkles size={16} color="#4F46E5" />
            <span className="small">💡 {sameCategoryCount}e dépense {categoryLabel(tx.category, lang)} ce mois</span>
          </div>
        </div>
      )}

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow" onClick={() => toast(t('common.saved'))}>{t('common.edit')}</button>
        <button className="btn btn-danger-soft grow" onClick={del}>{t('common.delete')}</button>
      </div>
    </div>
  );
}
