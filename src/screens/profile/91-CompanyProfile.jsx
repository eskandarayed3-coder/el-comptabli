import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function CompanyProfile() {
  const { state, patch, toast } = useStore();
  const { t } = useT();
  const [form, setForm] = useState({ ...state.profile });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => { patch('profile', form); toast(t('common.saved')); };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('profile.company')} 🏢`} />
      <div className="col center" style={{ alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
          {(form.name || form.activity || '?')[0].toUpperCase()}
        </div>
      </div>
      <div className="field"><label>{t('onboarding.yourName')}</label><input className="input" value={form.name} onChange={set('name')} /></div>
      <div className="field"><label>{t('onboarding.yourEmail')}</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
      <div className="field"><label>{t('onboarding.bizName')}</label><input className="input" value={form.activity} onChange={set('activity')} /></div>
      <div className="field row between">
        <label style={{ marginBottom: 0 }}>Type</label>
        <span className="pill teal">{form.userType}</span>
      </div>
      <div className="field row between">
        <label style={{ marginBottom: 0 }}>Régime fiscal</label>
        <span className="row" style={{ gap: 8 }}><span className="pill teal">{form.regime}</span><button className="btn btn-ghost btn-sm">Modifier</button></span>
      </div>
      <p className="tiny muted">⚠️ Changer de régime modifie tes échéances</p>
      <div className="field"><label>{t('onboarding.bizTaxId')}</label><input className="input" value={form.taxId} onChange={set('taxId')} /></div>
      <div className="field"><label>{t('onboarding.bizCity')}</label><input className="input" value={form.city} onChange={set('city')} /></div>
      <div className="field"><label>{t('onboarding.bizSector')}</label><input className="input" value={form.sector} onChange={set('sector')} /></div>
      <button className="btn btn-primary btn-block" onClick={save}>{t('common.save')}</button>
    </div>
  );
}
