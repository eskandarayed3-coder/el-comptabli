import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Landmark, ReceiptText, Upload } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const ACCEPTED_TYPES = new Map([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/webp', ['.webp']],
  ['application/pdf', ['.pdf']],
]);
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function ScanInvoice() {
  const navigate = useNavigate();
  const { state, toast } = useStore();
  const { t } = useT();

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const extension = `.${String(file.name || '').split('.').pop().toLowerCase()}`;
    if (!ACCEPTED_TYPES.get(file.type)?.includes(extension) || file.size > MAX_FILE_SIZE) {
      toast(t('scanner.fileHint'), 'error');
      return;
    }

    // The selected file only lives until the review screen is opened; it is never persisted in app storage.
    window.__pendingScanFile = file;
    navigate('/scanner/review');
  };

  const recent = state.documents.slice(0, 2);

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('scanner.title')}</h1>
        <span className="pill premium">{t('common.premium')}</span>
      </div>
      <p className="muted small">{t('scanner.subtitle')}</p>

      <label className="document-dropzone">
        <span className="drop-icon" aria-hidden="true"><Camera size={28} strokeWidth={1.8} /></span>
        <strong>{t('scanner.uploadTitle')}</strong>
        <span className="small muted">{t('scanner.uploadBody')}</span>
        <span className="tiny muted">{t('scanner.fileHint')}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={pickFile} />
      </label>

      <div className="col" style={{ gap: 10 }}>
        <label className="btn btn-primary btn-block" style={{ cursor: 'pointer' }}>
          <Camera size={18} aria-hidden="true" /> {t('scanner.take')}
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={pickFile} />
        </label>
        <label className="btn btn-ghost btn-block" style={{ cursor: 'pointer' }}>
          <Upload size={18} aria-hidden="true" /> {t('scanner.import')}
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={pickFile} />
        </label>
      </div>

      <section aria-labelledby="document-type-title">
        <div className="section-head"><h2 id="document-type-title">{t('scanner.chooseType')}</h2></div>
        <div className="document-type-grid">
          <button type="button" className="document-type-card" onClick={() => navigate('/scanner/receipt')}>
            <ReceiptText size={20} aria-hidden="true" /><span>{t('scanner.receipt')}</span>
          </button>
          <button type="button" className="document-type-card" onClick={() => navigate('/scanner/tax-doc')}>
            <Landmark size={20} aria-hidden="true" /><span>{t('scanner.taxDoc')}</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="recent-documents-title">
        <div className="section-head"><h2 id="recent-documents-title">{t('scanner.recentDocuments')}</h2></div>
        <div className="col" style={{ gap: 10 }}>
          {recent.length ? recent.map((document) => (
            <TintCard key={document.id} tone="gray" onClick={() => navigate(`/documents/${document.id}`)} ariaLabel={document.name}>
              <div className="row between">
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <FileText size={18} color="var(--teal-700)" aria-hidden="true" />
                  <span className="small truncate" style={{ fontWeight: 600 }}>{document.name}</span>
                </div>
                <StatusPill tone={document.scanned ? 'success' : 'warning'}>{document.scanned ? t('scanner.scanned') : t('common.upcoming')}</StatusPill>
              </div>
            </TintCard>
          )) : <TintCard tone="gray"><p className="small muted">{t('scanner.noRecentDocuments')}</p></TintCard>}
        </div>
      </section>
    </div>
  );
}
