import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useStore, isPremium } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import PremiumTimer from '../../components/PremiumTimer.jsx';

const PLANS = [
  { id: 'jour', price: 1, popular: false },
  { id: 'semaine', price: 5, popular: true },
  { id: 'mois', price: 20, popular: false },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t } = useT();
  const premium = isPremium(state.settings);

  return (
    <div className="screen stagger">
      <TopBar title={t('pricing.title')} />

      {premium && (
        <div className="card tint-teal">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <Sparkles size={18} color="var(--teal-700)" />
            <span className="small" style={{ fontWeight: 700 }}>{t('pricing.activeTitle')}</span>
          </div>
          <PremiumTimer
            premiumUntil={state.settings.premiumUntil}
            labels={{ days: t('premium.days'), hours: t('premium.hours'), minutes: t('premium.minutes'), seconds: t('premium.seconds') }}
          />
        </div>
      )}

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
              <div className="col" style={{ gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 17 }}>{t(`pricing.${p.id}`)}</span>
                <span className="tiny muted">{t(`pricing.${p.id}Pay`)}</span>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 0 }}>
                <span className="num" style={{ fontWeight: 800, fontSize: 26, color: 'var(--teal-700)' }}>{p.price} DT</span>
                <span className="tiny muted">{t(`pricing.${p.id}Per`)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <span className="small" style={{ fontWeight: 700 }}>{t('pricing.included')}</span>
        <div className="col" style={{ gap: 6, marginTop: 8 }}>
          {['inclAi', 'inclScan', 'inclExam', 'inclExport', 'inclInvoice'].map((k) => (
            <span key={k} className="small row" style={{ gap: 8 }}><Check size={14} color="var(--teal-700)" /> {t(`pricing.${k}`)}</span>
          ))}
        </div>
      </div>

      <p className="tiny center muted">{t('pricing.howItWorks')}</p>
    </div>
  );
}
