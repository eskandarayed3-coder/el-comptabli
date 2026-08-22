import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, FileOutput, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, remove, update, toast } = useStore();
  const { t, lang } = useT();
  const doc = state.documents.find((d) => d.id === id) || state.documents[0];
  const tx = state.transactions.find((t2) => t2.id === doc?.transactionId)
    || state.transactions.find((t2) => t2.vendor && doc?.name.includes(t2.vendor));

  if (!doc) return null;

  const del = () => {
    remove('documents', doc.id);
    toast(t('common.deleted'));
    navigate('/documents');
  };

  const markReviewed = () => {
    update('documents', doc.id, { reviewed: true });
    toast(t('docs.reviewed'));
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('scanner.detailTitle')} />
      <div style={{ height: 160, borderRadius: 20, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📄</div>

      <div className="row between">
        <h2>{doc.name}</h2>
        <StatusPill tone={doc.scanned ? 'success' : 'warning'}>{doc.scanned ? t('scanner.scanned') : t('docs.document')}</StatusPill>
      </div>

      <div className="card">
        <div className="col" style={{ gap: 10 }}>
          {[
            [t('common.ttc'), tx ? fmtDT(tx.amountTTC) : 'N/D'],
            [t('common.tva'), tx ? fmtDT(tx.tva) : 'N/D'],
            [t('common.category'), tx ? categoryLabel(tx.category, lang) : 'N/D'],
            [t('scanner.reference'), doc.reference || tx?.reference || 'N/D'],
            [t('common.date'), fmtDate(doc.date, lang)],
          ].map(([k, v]) => (
            <div key={k} className="row between small">
              <span className="muted">{k}</span>
              <span style={{ fontWeight: 600 }} className="num">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {doc.scanned && !doc.reviewed && (
        <button className="btn btn-soft btn-block" onClick={markReviewed}><CheckCircle2 size={16} /> {t('docs.markReviewed')}</button>
      )}

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow" onClick={() => navigate('/documents/export')}><FileOutput size={16} /> {t('docs.export')}</button>
        <button className="btn btn-danger-soft grow" onClick={del}><Trash2 size={16} /></button>
      </div>
    </div>
  );
}
