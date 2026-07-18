import { useNavigate } from 'react-router-dom';
import { Lock, MessageCircle, KeyRound } from 'lucide-react';
import { useT } from '../i18n/index.js';

const WHATSAPP = '21628456450';

export default function LockScreen() {
  const navigate = useNavigate();
  const { t } = useT();
  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t('lock.waMsg'))}`;

  return (
    <div className="screen no-nav" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 18, textAlign: 'center', minHeight: '100%' }}>
      <span className="icon-wrap coral" style={{ width: 64, height: 64 }}><Lock size={28} /></span>
      <h1>{t('lock.title')}</h1>
      <p className="small muted" style={{ maxWidth: 280 }}>{t('lock.body')}</p>

      <div className="card tint-teal" style={{ width: '100%' }}>
        <div className="row between" style={{ alignItems: 'center' }}>
          <div className="col" style={{ gap: 2, alignItems: 'flex-start' }}>
            <span className="small" style={{ fontWeight: 700 }}>{t('pricing.jour')}</span>
            <span className="tiny muted">{t('lock.cheapest')}</span>
          </div>
          <span className="num" style={{ fontWeight: 800, fontSize: 24, color: 'var(--teal-700)' }}>1 DT</span>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => navigate('/pricing')}>
        <KeyRound size={16} /> {t('lock.cta')}
      </button>
      <a className="btn btn-block" href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff' }}>
        <MessageCircle size={16} /> {t('lock.waCta')}
      </a>
    </div>
  );
}
