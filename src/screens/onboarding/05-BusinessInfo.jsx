import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';

export default function BusinessInfo() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const [form, setForm] = useState({
    activity: state.profile.activity || '',
    city: state.profile.city || 'Nabeul',
    sector: state.profile.sector || 'Services numériques',
    taxId: state.profile.taxId || '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const confirm = (skip) => {
    if (!skip) patch('profile', form);
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
      <button className="btn btn-primary btn-block" onClick={() => confirm(false)}>{t('common.continue')}</button>
      <button className="btn btn-ghost btn-block" onClick={() => confirm(true)}>{t('common.later')}</button>
    </div>
  );
}
