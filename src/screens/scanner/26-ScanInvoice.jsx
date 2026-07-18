import { useNavigate } from 'react-router-dom';
import { Camera, Upload, ReceiptText, Landmark, CheckSquare } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function ScanInvoice() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t } = useT();

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    sessionStorage.setItem('scan:pending', url);
    sessionStorage.setItem('scan:pendingType', file.type);
    // Store the actual File in a module-level cache the review screen can read.
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

      <label
        className="card"
        style={{
          border: '2px dashed var(--teal-400)', background: 'var(--tint-teal)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: 40, cursor: 'pointer', textAlign: 'center',
        }}
      >
        <Camera size={36} color="var(--teal-700)" />
        <span className="small" style={{ fontWeight: 600 }}>{t('scanner.subtitle')}</span>
        <input type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
      </label>

      <div className="col" style={{ gap: 10 }}>
        <label className="btn btn-primary btn-block" style={{ cursor: 'pointer' }}>
          <Camera size={18} /> {t('scanner.take')}
          <input type="file" accept="image/*" capture="environment" hidden onChange={pickFile} />
        </label>
        <label className="btn btn-ghost btn-block" style={{ cursor: 'pointer' }}>
          <Upload size={18} /> {t('scanner.import')}
          <input type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
        </label>
      </div>

      <div className="row" style={{ gap: 8 }}>
        <button className="card inner grow col center" style={{ gap: 6, alignItems: 'center' }} onClick={() => navigate('/scanner/receipt')}>
          <ReceiptText size={18} color="var(--teal-700)" />
          <span className="tiny" style={{ fontWeight: 600 }}>{t('scanner.receipt')}</span>
        </button>
        <button className="card inner grow col center" style={{ gap: 6, alignItems: 'center' }} onClick={() => navigate('/scanner/tax-doc')}>
          <Landmark size={18} color="var(--teal-700)" />
          <span className="tiny" style={{ fontWeight: 600 }}>{t('scanner.taxDoc')}</span>
        </button>
        <button className="card inner grow col center" style={{ gap: 6, alignItems: 'center' }} onClick={() => navigate('/scanner/validation')}>
          <CheckSquare size={18} color="var(--teal-700)" />
          <span className="tiny" style={{ fontWeight: 600 }}>{t('common.see')}</span>
        </button>
      </div>

      <div className="col" style={{ gap: 10 }}>
        <h3>{t('docs.title')}</h3>
        {recent.map((d) => (
          <TintCard key={d.id} tone="gray" onClick={() => navigate(`/documents/${d.id}`)}>
            <div className="row between">
              <span className="small" style={{ fontWeight: 600 }}>{d.name}</span>
              <StatusPill tone={d.scanned ? 'success' : 'warning'}>{d.scanned ? t('scanner.scanned') : t('common.upcoming')}</StatusPill>
            </div>
          </TintCard>
        ))}
      </div>
    </div>
  );
}
