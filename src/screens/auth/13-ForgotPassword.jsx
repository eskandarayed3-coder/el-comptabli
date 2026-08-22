import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import { useAuth } from '../../lib/auth.jsx';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useT();
  const { requestMagicLink } = useAuth();
  const [dest, setDest] = useState('');

  return (
    <div className="screen stagger">
      <TopBar title={t('auth.forgotTitle')} subtitle={t('auth.forgotSub')} />
      <div className="field">
        <label>{t('auth.email')}</label>
        <input className="input" value={dest} onChange={(e) => setDest(e.target.value)} placeholder="ton@email.com" />
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest.trim())) return;
        await requestMagicLink(dest.trim(), '/profile/security');
      }}>
        Recevoir un lien sécurisé
      </button>
    </div>
  );
}
