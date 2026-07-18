import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, Store, Building2, UserCog } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import OptionCard from '../../components/OptionCard.jsx';

export default function UserType() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const [selected, setSelected] = useState(state.profile.userType || 'freelance');

  const TYPES = [
    { id: 'freelance', icon: Laptop, title: t('onboarding.whoFreelance'), sub: t('onboarding.whoFreelanceEx') },
    { id: 'micro', icon: Store, title: t('onboarding.whoMicro'), sub: t('onboarding.whoMicroEx') },
    { id: 'company', icon: Building2, title: t('onboarding.whoCompany'), sub: t('onboarding.whoCompanyEx') },
    { id: 'accountant', icon: UserCog, title: t('onboarding.whoAccountant'), sub: t('onboarding.whoAccountantEx') },
  ];

  const confirm = () => {
    patch('profile', { userType: selected });
    navigate('/business-info');
  };

  return (
    <div className="screen stagger">
      <div className="col" style={{ gap: 8 }}>
        <div className="ob-progress"><i className="done" /><i /><i /><i /></div>
        <h1>{t('onboarding.whoTitle')}</h1>
      </div>
      <div className="grid-2">
        {TYPES.map((ty) => (
          <div key={ty.id} style={{ aspectRatio: '1' }}>
            <button
              className={`option-card ${selected === ty.id ? 'selected' : ''}`}
              style={{ flexDirection: 'column', height: '100%', justifyContent: 'center', textAlign: 'center', gap: 10 }}
              onClick={() => setSelected(ty.id)}
            >
              <ty.icon size={26} color={selected === ty.id ? 'var(--teal-700)' : 'var(--text-2)'} />
              <span style={{ fontWeight: 600 }}>{ty.title}</span>
              <span className="tiny muted">{ty.sub}</span>
            </button>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={confirm}>{t('common.continue')}</button>
    </div>
  );
}
