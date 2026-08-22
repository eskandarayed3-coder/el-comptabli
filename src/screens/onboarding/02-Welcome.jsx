import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Loader2, MessageCircle, ScanLine } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import Logo from '../../components/Logo.jsx';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useT();
  const { startFreeTrial } = useAuth();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const startFreeTrialNow = async () => {
    if (starting) return;
    setStarting(true);
    setError('');
    try {
      await startFreeTrial();
      navigate('/home');
    } catch {
      setError(t('auth.trialUnavailable'));
    } finally {
      setStarting(false);
    }
  };

  const features = [
    { icon: MessageCircle, text: t('onboarding.feat1') },
    { icon: ScanLine, text: t('onboarding.feat2') },
    { icon: CalendarClock, text: t('onboarding.feat3') },
  ];

  return (
    <div className="screen no-nav stagger" style={{ justifyContent: 'space-between' }}>
      <div className="col" style={{ gap: 24, alignItems: 'center', textAlign: 'center', paddingTop: 40 }}>
        <Logo size={120} radius={28} style={{ boxShadow: 'var(--shadow-float)' }} />
        <div className="col" style={{ gap: 8 }}>
          <h1>{t('onboarding.welcomeTitle')}</h1>
          <p className="muted">{t('onboarding.welcomeSub')}</p>
        </div>
      </div>

      <div className="col" style={{ gap: 12 }}>
        {features.map(({ icon: Icon, text }, i) => (
          <div key={i} className="card inner row" style={{ background: 'var(--bg-2)', boxShadow: 'none' }}>
            <span className="icon-wrap teal"><Icon size={18} /></span>
            <span className="small" style={{ fontWeight: 500 }}>{text}</span>
          </div>
        ))}
      </div>

      <div className="col" style={{ gap: 10 }}>
        <button type="button" className="btn btn-primary btn-block" disabled={starting} onClick={startFreeTrialNow}>
          {starting ? <Loader2 size={18} className="spin" /> : t('onboarding.tryFree')}
        </button>
        <p className="tiny center muted" style={{ margin: 0 }}>{t('onboarding.tryFreeNote')}</p>
        {error && <p className="tiny center" role="alert" style={{ margin: 0, color: 'var(--pill-danger-fg)' }}>{error}</p>}
        <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate('/language')}>
          {t('onboarding.start')}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => navigate('/login')}>
          {t('onboarding.haveAccount')}
        </button>
      </div>
    </div>
  );
}
