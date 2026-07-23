import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { syncUser } from '../../lib/api.js';

const REGIME_KEY = { forfaitaire: 'regimeForfait', reel: 'regimeReel', unknown: 'regimeUnknown' };
const TYPE_KEY = { freelance: 'whoFreelance', micro: 'whoMicro', company: 'whoCompany', accountant: 'whoAccountant' };

export default function SetupComplete() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();

  const go = () => {
    patch('settings', { onboarded: true });
    syncUser({ profile: state.profile, plan: state.settings.plan });
    navigate('/home');
  };

  return (
    <div className="screen no-nav center" style={{ justifyContent: 'center', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          width: 96, height: 96, borderRadius: '50%', background: 'var(--tint-teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'screen-in 500ms var(--ease)',
        }}
      >
        <CheckCircle2 size={48} color="var(--teal-700)" />
      </div>
      <h1>{t('onboarding.doneTitle', { name: state.profile.name })}</h1>

      <div className="card tint-gray" style={{ width: '100%' }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="pill teal">{t(`onboarding.${TYPE_KEY[state.profile.userType] || 'whoFreelance'}`)}</span>
          <span className="pill indigo">{t(`onboarding.${REGIME_KEY[state.profile.regime] || 'regimeReel'}`)}</span>
          <span className="pill white">{state.profile.city}</span>
          <span className="pill success">{state.settings.plan === 'premium' ? 'Premium' : t('common.free')}</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={go}>{t('onboarding.goDash')}</button>
    </div>
  );
}
