import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT, LANGS } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import OptionCard from '../../components/OptionCard.jsx';
import { Languages } from 'lucide-react';

export default function ChooseLanguage() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const { startGuestPreview } = useAuth();
  const [selected, setSelected] = useState(state.settings.lang || 'ar');

  const confirm = () => {
    patch('settings', { lang: selected });
    navigate('/user-type');
  };

  const tryFree = () => {
    patch('settings', { lang: selected });
    startGuestPreview();
    navigate('/home');
  };

  return (
    <div className="screen stagger">
      <h1>{t('onboarding.langTitle')}</h1>
      <div className="col" style={{ gap: 12 }}>
        {LANGS.map((l) => (
          <OptionCard
            key={l.code}
            icon={Languages}
            title={l.label}
            subtitle={l.disabled ? t('common.soon') : l.preview}
            selected={selected === l.code}
            onClick={() => !l.disabled && setSelected(l.code)}
          />
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={confirm}>{t('common.continue')}</button>
      <button className="btn btn-ghost btn-block" onClick={tryFree}>{t('onboarding.tryFree')}</button>
    </div>
  );
}
