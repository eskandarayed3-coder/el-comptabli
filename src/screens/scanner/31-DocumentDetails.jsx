import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Download, FileOutput, Loader2, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import { categoryLabel } from '../../lib/taxRules.js';
import { deleteDocument, getDocumentSignedUrl } from '../../lib/api.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, remove, update, toast } = useStore();
  const { t, lang } = useT();
  const [originalUrl, setOriginalUrl] = useState('');
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const doc = state.documents.find((d) => d.id === id) || state.documents[0];
  const tx = state.transactions.find((t2) => t2.id === doc?.transactionId)
    || state.transactions.find((t2) => t2.vendor && doc?.name.includes(t2.vendor));

  useEffect(() => {
    let active = true;
    if (!doc?.storagePath) {
      setOriginalUrl('');
      return undefined;
    }
    setLoadingOriginal(true);
    getDocumentSignedUrl(doc.storagePath)
      .then(({ url }) => { if (active) setOriginalUrl(url); })
      .catch(() => { if (active) setOriginalUrl(''); })
      .finally(() => { if (active) setLoadingOriginal(false); });
    return () => { active = false; };
  }, [doc?.storagePath]);

  if (!doc) return null;

  const del = async () => {
    if (doc.storagePath) {
      try {
        await deleteDocument(doc.storagePath);
      } catch (error) {
        toast(error.friendly?.message || t('docs.deleteFailed'), 'error');
        return;
      }
    }
    remove('documents', doc.id);
    toast(t('common.deleted'));
    navigate('/documents');
  };

  const markReviewed = () => {
    update('documents', doc.id, { reviewed: true, status: 'verified' });
    toast(t('docs.reviewed'));
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('scanner.detailTitle')} />
      <div style={{ minHeight: 160, borderRadius: 20, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {loadingOriginal && <Loader2 className="spin" size={28} color="var(--teal-700)" aria-label={t('common.loading')} />}
        {!loadingOriginal && originalUrl && doc.mimeType?.startsWith('image/') && <img src={originalUrl} alt={doc.name} style={{ width: '100%', maxHeight: 280, objectFit: 'contain' }} />}
        {!loadingOriginal && (!originalUrl || doc.mimeType === 'application/pdf') && <span style={{ fontSize: 40 }}>📄</span>}
      </div>

      {originalUrl && (
        <a className="btn btn-soft btn-block" href={originalUrl} target="_blank" rel="noreferrer">
          <Download size={16} /> {t('docs.openOriginal')}
        </a>
      )}
      {!doc.storagePath && <p className="tiny muted center">{t('docs.originalUnavailable')}</p>}

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
