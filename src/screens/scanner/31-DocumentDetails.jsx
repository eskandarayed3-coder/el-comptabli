import { useNavigate, useParams } from 'react-router-dom';
import { Download, Share2, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, remove, toast } = useStore();
  const { t, lang } = useT();
  const doc = state.documents.find((d) => d.id === id) || state.documents[0];
  const tx = state.transactions.find((t2) => t2.vendor && doc?.name.includes(t2.vendor));

  if (!doc) return null;

  const del = () => {
    remove('documents', doc.id);
    toast(t('common.deleted'));
    navigate('/documents');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('scanner.detailTitle')} />
      <div style={{ height: 160, borderRadius: 20, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📄</div>

      <div className="row between">
        <h2>{doc.name}</h2>
        <StatusPill tone="success">{t('scanner.scanned')}</StatusPill>
      </div>

      <div className="card">
        <div className="col" style={{ gap: 10 }}>
          {[
            [t('common.ttc'), tx ? fmtDT(tx.amountTTC) : 'N/D'],
            [t('common.tva'), tx ? fmtDT(tx.tva) : 'N/D'],
            [t('common.category'), tx ? categoryLabel(tx.category, lang) : 'N/D'],
            [t('common.date'), fmtDate(doc.date, lang)],
          ].map(([k, v]) => (
            <div key={k} className="row between small">
              <span className="muted">{k}</span>
              <span style={{ fontWeight: 600 }} className="num">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow" onClick={() => toast(t('common.saved'))}><Download size={16} /> PDF</button>
        <button className="btn btn-ghost grow" onClick={() => toast(t('common.saved'))}><Share2 size={16} /></button>
        <button className="btn btn-danger-soft grow" onClick={del}><Trash2 size={16} /></button>
      </div>
    </div>
  );
}
