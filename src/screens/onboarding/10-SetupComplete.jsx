import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Gift } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import { activateTrial } from '../../lib/api.js';
import { getDisplayIdentity } from '../../../shared/displayIdentity.js';

const REGIME_KEY = { forfaitaire: 'regimeForfait', reel: 'regimeReel', unknown: 'regimeUnknown' };
const TYPE_KEY = { freelance: 'whoFreelance', micro: 'whoMicro', company: 'whoCompany', accountant: 'whoAccountant' };

export default function SetupComplete() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, patch, activatePlan, toast } = useStore();
  const { user, startFreeTrial } = useAuth();
  const { t, lang } = useT();
  const identity = getDisplayIdentity(user, state.profile, lang);
  const startHandled = useRef(false);

  // Every newly onboarded account gets one full day before the paywall kicks
  // in. A no-email visitor receives the same trial through anonymous auth.
  const go = useCallback(async () => {
    if (!user) {
      try {
        const trial = await startFreeTrial();
        activatePlan(trial.subscription?.premium_until);
        patch('settings', { onboarded: true });
        navigate('/home');
      } catch {
        toast(t('auth.trialUnavailable'), 'error');
      }
      return;
    }
    try {
      const result = await activateTrial();
      activatePlan(result.premiumUntil);
    } catch (error) {
      if (error.friendly?.code !== 'trial_used') toast(error.message || 'Essai gratuit indisponible.', 'error');
    }
    patch('settings', { onboarded: true });
    navigate('/home');
  }, [activatePlan, navigate, patch, startFreeTrial, t, toast, user]);

  useEffect(() => {
    if (!user || params.get('start') !== '1' || startHandled.current) return;
    startHandled.current = true;
    go();
  }, [go, params, user]);

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
      <h1>{t('onboarding.doneTitle', { name: identity.displayName })}</h1>

      <div className="card tint-gray" style={{ width: '100%' }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="pill teal">{t(`onboarding.${TYPE_KEY[state.profile.userType] || 'whoFreelance'}`)}</span>
          <span className="pill indigo">{t(`onboarding.${REGIME_KEY[state.profile.regime] || 'regimeReel'}`)}</span>
          <span className="pill white">{state.profile.city}</span>
        </div>
      </div>

      <div className="card tint-teal row" style={{ gap: 10, width: '100%', alignItems: 'center' }}>
        <Gift size={20} color="var(--teal-700)" />
        <span className="small" style={{ fontWeight: 600 }}>{t('onboarding.trialNote')}</span>
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={go}>{t('onboarding.goDash')}</button>
    </div>
  );
}
