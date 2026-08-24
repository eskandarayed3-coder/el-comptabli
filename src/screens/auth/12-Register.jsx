import { useState } from 'react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import { useAuth } from '../../lib/auth.jsx';

export default function Register() {
  const { requestMagicLink } = useAuth();
  const { t } = useT();
  const [email, setEmail] = useState('');

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    await requestMagicLink(email.trim(), '/language');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('auth.registerTitle')} />
      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label htmlFor="register-email">{t('auth.email')}</label>
          <input id="register-email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ton@email.com" />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={submit}>Créer mon compte par email</button>
      <p className="tiny center muted">Un lien de connexion sécurisé sera envoyé à ton email.</p>
    </div>
  );
}
