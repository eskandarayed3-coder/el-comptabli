import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageCircle, KeyRound, Ticket, CreditCard, Smartphone } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { activateCode } from '../../lib/api.js';
import TopBar from '../../components/TopBar.jsx';

// El Comptabli support line — international format for the wa.me deep link.
const WHATSAPP = '21628456450';
const PRICE = { jour: 1, semaine: 5, mois: 20 };

const METHODS = [
  { id: 'ooredoo', icon: Ticket },
  { id: 'carte', icon: CreditCard },
  { id: 'edinar', icon: Smartphone },
];

export default function Payment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { activatePlan, toast } = useStore();
  const { t, lang } = useT();

  const plan = PRICE[params.get('plan')] ? params.get('plan') : 'semaine';
  const price = PRICE[plan];
  const [method, setMethod] = useState('ooredoo');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const waText = encodeURIComponent(
    `${t('pay.waMsg', { plan: t(`pricing.${plan}`), price })} (${t(`pay.m_${method}`)})`,
  );
  const waLink = `https://wa.me/${WHATSAPP}?text=${waText}`;

  const activate = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const { days } = await activateCode(code.trim());
      activatePlan(days);
      toast(t('pay.activated'));
      navigate('/profile');
    } catch (e) {
      toast(e.friendly?.code === 'bad_code' ? t('pay.badCode') : (e.message || t('pay.badCode')), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('pay.title')} />

      <div className="card tint-teal row between">
        <span className="small" style={{ fontWeight: 700 }}>{t(`pricing.${plan}`)}</span>
        <span className="num" style={{ fontWeight: 800, fontSize: 20, color: 'var(--teal-700)' }}>{price} DT</span>
      </div>

      {/* Step 1 — choose how you pay */}
      <div className="col" style={{ gap: 8 }}>
        <span className="small" style={{ fontWeight: 700 }}>{t('pay.step1')}</span>
        <div className="row" style={{ gap: 8 }}>
          {METHODS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={`card inner grow col center ${method === id ? 'tint-teal' : ''}`}
              style={{ gap: 6, alignItems: 'center', border: method === id ? '2px solid var(--teal-700)' : '1.5px solid var(--hairline)' }}
              onClick={() => setMethod(id)}
            >
              <Icon size={20} color="var(--teal-700)" />
              <span className="tiny" style={{ fontWeight: 600, textAlign: 'center' }}>{t(`pay.m_${id}`)}</span>
            </button>
          ))}
        </div>
        <p className="tiny muted">{t(`pay.hint_${method}`, { price })}</p>
      </div>

      {/* Step 2 — send proof on WhatsApp, get the code back */}
      <div className="col" style={{ gap: 8 }}>
        <span className="small" style={{ fontWeight: 700 }}>{t('pay.step2')}</span>
        <a className="btn btn-block" href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff' }}>
          <MessageCircle size={18} /> {t('pay.waCta')}
        </a>
        <p className="tiny muted">{t('pay.waNumber')} : <span className="num" style={{ fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate' }}>+216 28 456 450</span></p>
      </div>

      {/* Step 3 — type the code you received */}
      <div className="col" style={{ gap: 8 }}>
        <span className="small" style={{ fontWeight: 700 }}>{t('pay.step3')}</span>
        <div className="field">
          <input
            className="input num"
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EC-XXXXXXXX"
            style={{ letterSpacing: 1, textAlign: 'center' }}
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={!code.trim() || busy} onClick={activate}>
          <KeyRound size={16} /> {busy ? t('chat.generating') : t('pay.activateCta')}
        </button>
      </div>

      <p className="tiny center muted">{t('pay.footer')}</p>
    </div>
  );
}
