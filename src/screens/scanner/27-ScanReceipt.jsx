import { useNavigate } from 'react-router-dom';
import { X, Image, Zap } from 'lucide-react';
import { useT } from '../../i18n/index.js';

export default function ScanReceipt() {
  const navigate = useNavigate();
  const { lang } = useT();

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    window.__pendingScanFile = file;
    navigate('/scanner/review');
  };

  return (
    <div className="screen no-nav" style={{ padding: 0, position: 'relative', background: '#0a0a0a', color: '#fff', minHeight: '100%' }}>
      <button className="icon-btn" style={{ position: 'absolute', top: 20, insetInlineStart: 20, zIndex: 2, background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={() => navigate(-1)}>
        <X size={18} />
      </button>
      <div style={{ position: 'absolute', top: 20, insetInlineEnd: 20, zIndex: 2 }}>
        <span className="icon-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><Zap size={18} /></span>
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '78%', height: '55%', position: 'relative' }}>
          {['tl', 'tr', 'bl', 'br'].map((c) => (
            <span
              key={c}
              style={{
                position: 'absolute', width: 28, height: 28, borderColor: 'var(--teal-400)',
                borderStyle: 'solid', borderWidth: 0,
                ...(c.includes('t') ? { top: 0, borderTopWidth: 4 } : { bottom: 0, borderBottomWidth: 4 }),
                ...(c.includes('l') ? { insetInlineStart: 0, borderInlineStartWidth: 4 } : { insetInlineEnd: 0, borderInlineEndWidth: 4 }),
                borderRadius: 6,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute', left: 0, right: 0, height: 2, background: 'var(--teal-400)',
              boxShadow: '0 0 12px var(--teal-400)', animation: 'scan-line 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <p className="small center" style={{ position: 'absolute', top: '18%', left: 0, right: 0, color: 'rgba(255,255,255,0.85)' }}>
        {lang === 'ar' ? 'وجّه الكاميرا للوصل، التصوير أوتوماتيكي' : 'Cadre le reçu, la capture est automatique'}
      </p>

      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <span className="pill" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>💡 Assure un bon éclairage</span>
        <div className="row" style={{ gap: 32, alignItems: 'center' }}>
          <label style={{ cursor: 'pointer' }}>
            <span className="icon-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><Image size={18} /></span>
            <input type="file" accept="image/*" hidden onChange={pickFile} />
          </label>
          <label style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '4px solid rgba(255,255,255,0.4)' }}>
            <input type="file" accept="image/*" capture="environment" hidden onChange={pickFile} />
          </label>
          <div style={{ width: 44 }} />
        </div>
      </div>
      <style>{`@keyframes scan-line { 0%,100% { top: 0; } 50% { top: 100%; } }`}</style>
    </div>
  );
}
