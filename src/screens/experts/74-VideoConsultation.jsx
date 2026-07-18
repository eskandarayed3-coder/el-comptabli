import { useNavigate } from 'react-router-dom';
import { Mic, Video, FileText, PhoneOff } from 'lucide-react';

export default function VideoConsultation() {
  const navigate = useNavigate();
  return (
    <div className="screen no-nav" style={{ padding: 0, position: 'relative', background: '#111', color: '#fff', minHeight: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👨‍💼</div>
      <span style={{ position: 'absolute', top: 20, insetInlineStart: 20, background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 999 }}>Mounir B. · Expert-comptable</span>
      <span className="num" style={{ position: 'absolute', top: 20, insetInlineEnd: 20, background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 999 }}>12:34</span>
      <div style={{ position: 'absolute', top: 70, insetInlineEnd: 20, width: 80, height: 110, borderRadius: 12, background: '#333' }} />

      <div className="card" style={{ position: 'absolute', bottom: 110, insetInline: 20, background: 'rgba(255,255,255,0.95)' }}>
        <span className="small row" style={{ gap: 8 }}><FileText size={16} /> Document partagé : Déclaration TVA juillet.pdf</span>
      </div>

      <div style={{ position: 'absolute', bottom: 30, insetInline: 0, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><Mic size={18} /></button>
        <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><Video size={18} /></button>
        <button className="icon-btn" style={{ background: 'var(--pill-danger-fg)', color: '#fff' }} onClick={() => navigate('/experts/history')}><PhoneOff size={18} /></button>
      </div>
    </div>
  );
}
