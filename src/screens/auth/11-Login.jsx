import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import Logo from '../../components/Logo.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { patch, toast } = useStore();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    if (!email || !password) return toast(t('common.demo'), 'error');
    patch('settings', { onboarded: true });
    toast(t('common.saved'));
    navigate('/home');
  };

  return (
    <div className="screen no-nav stagger" style={{ justifyContent: 'center', gap: 24 }}>
      <div className="col" style={{ gap: 8, textAlign: 'center', alignItems: 'center' }}>
        <Logo size={64} />
        <h1>{t('auth.loginTitle')}</h1>
      </div>

      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label>{t('auth.email')}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" />
        </div>
        <div className="field">
          <label>{t('auth.password')}</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="small" style={{ color: 'var(--teal-700)', alignSelf: 'flex-end' }} onClick={() => navigate('/forgot-password')}>
          {t('auth.forgot')}
        </button>
      </div>

      <button className="btn btn-primary btn-block" onClick={submit}>{t('auth.login')}</button>
      <button className="btn btn-ghost btn-block" onClick={() => navigate('/otp')}>{t('auth.otpTitle')} · SMS</button>

      <p className="small center muted">
        {t('auth.noAccount')} <button style={{ color: 'var(--teal-700)', fontWeight: 600 }} onClick={() => navigate('/register')}>{t('auth.register')}</button>
      </p>
      <p className="tiny center muted">{t('auth.demoNote')}</p>
    </div>
  );
}
