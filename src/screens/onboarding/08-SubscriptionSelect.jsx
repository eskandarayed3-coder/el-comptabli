import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';

export default function SubscriptionSelect() {
  const navigate = useNavigate();
  const { patch } = useStore();
  const { t } = useT();

  const choose = (plan) => {
    patch('settings', { plan });
    navigate('/permissions');
  };

  return (
    <div className="screen stagger">
      <h1>{t('onboarding.planTitle')}</h1>

      <div className="col" style={{ gap: 14 }}>
        <div className="card" style={{ border: '1.5px solid var(--hairline)' }}>
          <div className="col" style={{ gap: 10 }}>
            <h3>{t('common.free')}</h3>
            <p className="small muted">{t('onboarding.planFreeFeatures')}</p>
            <button className="btn btn-ghost btn-block" onClick={() => choose('free')}>{t('onboarding.planFreeCta')}</button>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(160deg, #fff, var(--tint-indigo))', border: '2px solid #7C3AED', position: 'relative' }}>
          <span className="pill premium" style={{ position: 'absolute', top: -12, insetInlineStart: 20 }}>{t('common.popular')}</span>
          <div className="col" style={{ gap: 10 }}>
            <div className="row between">
              <h3>Premium</h3>
              <span className="num" style={{ fontWeight: 700 }}>20 DT<span className="tiny muted">/mois</span></span>
            </div>
            <p className="small muted">{t('onboarding.planPremiumFeatures')}</p>
            <button className="btn btn-primary btn-block" onClick={() => choose('premium')}>{t('onboarding.planPremiumCta')}</button>
          </div>
        </div>
      </div>

      <button className="tiny" style={{ color: 'var(--teal-700)', textAlign: 'center' }} onClick={() => navigate('/pricing')}>
        {t('onboarding.comparePlans')}
      </button>
    </div>
  );
}
