import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function IncomeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, remove, toast } = useStore();
  const { t, lang } = useT();
  const tx = state.transactions.find((x) => x.id === id);
  if (!tx) return null;

  const del = async () => { try { await remove('transactions', tx.id); toast(t('common.deleted')); navigate('/income'); } catch { /* store reports */ } };

  return (
    <div className="screen stagger">
      <TopBar title={t('money.details')} />
      <div className="center col" style={{ gap: 10, alignItems: 'center' }}>
        <span className="icon-wrap teal" style={{ width: 56, height: 56 }}><TrendingUp size={24} /></span>
        <span className="num" style={{ fontSize: 34, fontWeight: 700, color: 'var(--pill-success-fg)' }}>{fmtDT(tx.amountTTC, { sign: true, decimals: 0 })}</span>
        <StatusPill tone={tx.status === 'pending' ? 'warning' : 'success'}>{tx.status === 'pending' ? t('common.upcoming') : t('common.paid')}</StatusPill>
      </div>

      <div className="card">
        <div className="col" style={{ gap: 10 }}>
          {[
            [t('money.client'), tx.vendor || 'N/D'],
            [t('common.category'), categoryLabel(tx.category, lang)],
            [t('common.date'), fmtDate(tx.date, lang)],
            [t('common.tva'), fmtDT(tx.tva)],
          ].map(([k, v]) => (
            <div key={k} className="row between small">
              <span className="muted">{k}</span>
              <span style={{ fontWeight: 600 }} className="num">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card tint-indigo">
        <div className="row" style={{ gap: 10 }}>
          <Sparkles size={16} color="#4F46E5" />
          <span className="small">💡 {tx.vendor || 'Ce client'} compte parmi tes meilleurs clients ce trimestre</span>
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow" onClick={() => navigate(`/income/${tx.id}/edit`)}>{t('common.edit')}</button>
        <button className="btn btn-danger-soft grow" onClick={del}>{t('common.delete')}</button>
      </div>
    </div>
  );
}
