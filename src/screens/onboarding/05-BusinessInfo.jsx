import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';

export default function BusinessInfo() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const [form, setForm] = useState({
    name: state.profile.name || '',
    email: state.profile.email || '',
    activity: state.profile.activity || '',
    city: state.profile.city || 'Nabeul',
    sector: state.profile.sector || 'Services numériques',
    taxId: state.profile.taxId || '',
  });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const nameValid = form.name.trim().length > 1;
  const canContinue = nameValid && emailValid;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const confirm = (skip) => {
    // Name + email are always saved — everything else is optional and can
    // be filled in later from Profil.
    patch('profile', skip ? { name: form.name, email: form.email } : form);
    navigate('/tax-regime');
  };

  return (
    <div className="screen stagger">
      <div className="col" style={{ gap: 8 }}>
        <div className="ob-progress"><i className="done" /><i className="done" /><i /><i /></div>
        <h1>{t('onboarding.bizTitle')}</h1>
      </div>

      <div className="col" style={{ gap: 16 }}>
        <div className="field">
          <label>{t('onboarding.yourName')}</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Eskandar Ayed" />
        </div>
        <div className="field">
          <label>{t('onboarding.yourEmail')}</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="toi@exemple.com" />
          {!emailValid && form.email.length > 0 && <span className="tiny" style={{ color: 'var(--coral-700, #B91C1C)' }}>{t('onboarding.emailInvalid')}</span>}
        </div>
        <div className="field">
          <label>{t('onboarding.bizName')}</label>
          <input className="input" value={form.activity} onChange={set('activity')} placeholder="Studio Eskandar Design" />
        </div>
        <div className="field">
          <label>{t('onboarding.bizCity')}</label>
          <select className="input" value={form.city} onChange={set('city')}>
            {['Nabeul', 'Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Monastir'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('onboarding.bizSector')}</label>
          <select className="input" value={form.sector} onChange={set('sector')}>
            {['Services numériques', 'Commerce', 'Artisanat', 'Restauration', 'Bâtiment', 'Santé', 'Autre'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('onboarding.bizTaxId')}</label>
          <input className="input" value={form.taxId} onChange={set('taxId')} placeholder="1234567/A/M/000" />
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" disabled={!canContinue} onClick={() => confirm(false)}>{t('common.continue')}</button>
      <button className="btn btn-ghost btn-block" disabled={!canContinue} onClick={() => confirm(true)}>{t('common.later')}</button>
    </div>
  );
}
