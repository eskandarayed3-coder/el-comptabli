import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { patch } = useStore();
  const { t } = useT();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    patch('profile', { name: form.name || 'Eskandar' });
    navigate('/otp?dest=' + encodeURIComponent(form.email || 'ton email'));
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('auth.registerTitle')} />
      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label>{t('auth.name')}</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Eskandar" />
        </div>
        <div className="field">
          <label>{t('auth.email')}</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="ton@email.com" />
        </div>
        <div className="field">
          <label>{t('auth.password')}</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={submit}>{t('auth.register')}</button>
      <p className="tiny center muted">{t('auth.demoNote')}</p>
    </div>
  );
}
