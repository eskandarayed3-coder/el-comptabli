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
  const { startFreeTrial } = useAuth();
  const [selected, setSelected] = useState(state.settings.lang || 'ar');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const confirm = () => {
    patch('settings', { lang: selected });
    navigate('/user-type');
  };

  const tryFree = async () => {
    if (starting) return;
    patch('settings', { lang: selected });
    setStarting(true);
    setError('');
    try {
      await startFreeTrial();
      navigate('/home');
    } catch {
      setError(t('auth.trialUnavailable'));
    } finally {
      setStarting(false);
    }
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
      {error && <p className="tiny center" role="alert" style={{ margin: 0, color: 'var(--pill-danger-fg)' }}>{error}</p>}
      <button type="button" className="btn btn-primary btn-block" onClick={confirm}>{t('common.continue')}</button>
      <button type="button" className="btn btn-ghost btn-block" disabled={starting} onClick={tryFree}>{starting ? t('common.loading') : t('onboarding.tryFree')}</button>
    </div>
  );
}
