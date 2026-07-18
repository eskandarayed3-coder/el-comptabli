import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function Otp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { patch, toast } = useStore();
  const { t } = useT();
  const [digits, setDigits] = useState(Array(6).fill(''));
  const refs = useRef([]);

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    setDigits((d) => { const c = [...d]; c[i] = v; return c; });
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const verify = () => {
    patch('settings', { onboarded: true });
    toast(t('common.saved'));
    navigate('/home');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('auth.otpTitle')} subtitle={t('auth.otpSub', { dest: params.get('dest') || 'ton email' })} />
      <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className="input num"
            style={{ width: 44, height: 52, textAlign: 'center', padding: 0 }}
            value={d}
            maxLength={1}
            onChange={(e) => setDigit(i, e.target.value)}
          />
        ))}
      </div>
      <button className="small" style={{ color: 'var(--teal-700)', alignSelf: 'center' }} onClick={() => toast(t('auth.resend'))}>
        {t('auth.resend')}
      </button>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={verify}>{t('auth.verify')}</button>
    </div>
  );
}
