import { useNavigate } from 'react-router-dom';
import { MessageCircle, ScanLine, CalendarClock } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import Logo from '../../components/Logo.jsx';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useT();
  const { startGuestPreview } = useAuth();

  const startFreePreview = () => {
    startGuestPreview();
    navigate('/home');
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
        <button className="btn btn-primary btn-block" onClick={startFreePreview}>
          {t('onboarding.tryFree')}
        </button>
        <p className="tiny center muted" style={{ margin: 0 }}>{t('onboarding.tryFreeNote')}</p>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/language')}>
          {t('onboarding.start')}
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/login')}>
          {t('onboarding.haveAccount')}
        </button>
      </div>
    </div>
  );
}
