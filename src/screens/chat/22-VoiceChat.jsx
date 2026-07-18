import { useNavigate } from 'react-router-dom';
import { Mic, Keyboard, Square } from 'lucide-react';
import { useT } from '../../i18n/index.js';

export default function VoiceChat() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen no-nav center" style={{ justifyContent: 'space-between', alignItems: 'center', paddingBlock: 40 }}>
      <div />
      <div className="col" style={{ gap: 24, alignItems: 'center' }}>
        <div
          style={{
            width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, var(--teal-400), var(--teal-800))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'bounce 1.8s ease-in-out infinite',
          }}
        >
          <Mic size={48} color="#fff" />
        </div>
        <p className="muted">{t('chat.voiceListening')}</p>
        <p className="small center" style={{ maxWidth: 280 }}>{t('chat.voiceSoon')}</p>
      </div>
      <div className="row" style={{ gap: 20 }}>
        <button className="icon-btn" style={{ width: 56, height: 56 }} onClick={() => navigate('/chat')}>
          <Keyboard size={22} />
        </button>
        <button className="icon-btn" style={{ width: 56, height: 56, background: 'var(--pill-danger-bg)', color: 'var(--pill-danger-fg)' }} onClick={() => navigate('/chat')}>
          <Square size={20} />
        </button>
      </div>
    </div>
  );
}
