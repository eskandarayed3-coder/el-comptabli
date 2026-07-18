import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useT();
  const [dest, setDest] = useState('');

  return (
    <div className="screen stagger">
      <TopBar title={t('auth.forgotTitle')} subtitle={t('auth.forgotSub')} />
      <div className="field">
        <label>{t('auth.email')}</label>
        <input className="input" value={dest} onChange={(e) => setDest(e.target.value)} placeholder="ton@email.com" />
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={() => navigate('/otp?dest=' + encodeURIComponent(dest || 'ton email'))}>
        {t('auth.sendCode')}
      </button>
    </div>
  );
}
