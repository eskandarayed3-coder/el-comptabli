import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function DigitalSignature() {
  const { toast } = useStore();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={t('future.signature')} />
      <div style={{ height: 160, borderRadius: 16, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '60%', height: 60, border: '2px dashed var(--teal-400)', borderRadius: 8 }} />
      </div>
      <div className="card">
        <span className="small muted">Zone de signature</span>
        <svg viewBox="0 0 200 60" style={{ width: '100%', height: 60, marginTop: 8 }}>
          <path d="M10 40 Q 30 10, 50 40 T 90 40 T 130 40 T 170 30" fill="none" stroke="var(--teal-700)" strokeWidth="2" />
        </svg>
      </div>
      <div className="row" style={{ gap: 10 }}>
        <span className="pill success">CIN ✓</span><span className="pill success">Selfie ✓</span>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => toast(t('common.saved'))}>Signer le document</button>
      <p className="tiny center muted">Signature électronique à valeur légale, conforme à la loi tunisienne</p>
    </div>
  );
}
