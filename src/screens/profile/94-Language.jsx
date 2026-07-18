import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT, LANGS } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import OptionCard from '../../components/OptionCard.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import { Languages } from 'lucide-react';

export default function Language() {
  const navigate = useNavigate();
  const { state, patch, toast } = useStore();
  const { t } = useT();
  const [lang, setLang] = useState(state.settings.lang);
  const [aiLang, setAiLang] = useState('mixte');

  const apply = () => {
    patch('settings', { lang });
    toast(t('common.saved'));
    navigate('/profile');
  };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('profile.language')} 🌍`} />
      <div className="col" style={{ gap: 12 }}>
        {LANGS.map((l) => (
          <OptionCard key={l.code} icon={Languages} title={l.label} subtitle={l.disabled ? t('common.soon') : l.preview} selected={lang === l.code} onClick={() => !l.disabled && setLang(l.code)} />
        ))}
      </div>
      <div className="field">
        <label>Langue des réponses IA</label>
        <SegmentedControl options={[{ id: 'darija', label: 'Darija' }, { id: 'fr', label: 'Français' }, { id: 'mixte', label: 'Mixte' }]} value={aiLang} onChange={setAiLang} />
      </div>
      <p className="tiny center muted">Le changement est instantané</p>
      <button className="btn btn-primary btn-block" onClick={apply}>Appliquer</button>
    </div>
  );
}
