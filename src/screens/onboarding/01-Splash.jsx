import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import Logo from '../../components/Logo.jsx';

export default function Splash() {
  const navigate = useNavigate();
  const { t } = useT();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/welcome'), 1600);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="screen no-nav center"
      style={{
        justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(160deg, var(--teal-800), var(--teal-700) 60%, var(--teal-400))',
        color: '#fff', gap: 20,
      }}
      onClick={() => navigate('/welcome')}
    >
      <Logo size={96} style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }} />
      <h1 style={{ color: '#fff' }}>El Comptabli</h1>
      <p style={{ color: 'rgba(255,255,255,0.85)' }}>{t('onboarding.tagline')}</p>
      <div className="row" style={{ gap: 6, marginTop: 24 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 8, height: 8, borderRadius: '50%', background: '#fff',
              animation: `bounce 1.2s ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
