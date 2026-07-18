import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';

const PLANS = [
  { id: 'jour', price: 1 },
  { id: 'semaine', price: 5, popular: true },
  { id: 'mois', price: 20 },
];

export default function SubscriptionSelect() {
  const navigate = useNavigate();
  const { patch } = useStore();
  const { t } = useT();

  // No plan chosen yet — the app itself gates paid features until a real
  // pass is activated with a WhatsApp-verified code (see /pricing, /payment).
  const skip = () => {
    patch('settings', { plan: 'free' });
    navigate('/permissions');
  };

  return (
    <div className="screen stagger">
      <h1>{t('onboarding.planTitle')}</h1>
      <p className="muted small">{t('pricing.intro')}</p>

      <div className="col" style={{ gap: 12 }}>
        {PLANS.map((p) => (
          <button
            key={p.id}
            className="card"
            style={{
              width: '100%', textAlign: 'start', position: 'relative',
              border: p.popular ? '2px solid var(--teal-700)' : '1.5px solid var(--hairline)',
              background: p.popular ? 'linear-gradient(160deg, var(--bg), var(--tint-teal))' : 'var(--bg)',
            }}
            onClick={() => navigate(`/payment?plan=${p.id}`)}
          >
            {p.popular && <span className="pill teal" style={{ position: 'absolute', top: -12, insetInlineStart: 20 }}>{t('pricing.best')}</span>}
            <div className="row between" style={{ alignItems: 'center' }}>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontWeight: 700 }}>{t(`pricing.${p.id}`)}</span>
                <span className="tiny muted">{t(`pricing.${p.id}Per`)}</span>
              </div>
              <span className="num" style={{ fontWeight: 800, fontSize: 22, color: 'var(--teal-700)' }}>{p.price} DT</span>
            </div>
          </button>
        ))}
      </div>

      <button className="btn btn-ghost btn-block" onClick={skip}>{t('onboarding.planSkip')}</button>
    </div>
  );
}
