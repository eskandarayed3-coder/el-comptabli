import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, FileText, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import OptionCard from '../../components/OptionCard.jsx';

export default function TaxRegime() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const [selected, setSelected] = useState(state.profile.regime || 'reel');

  const OPTIONS = [
    { id: 'forfaitaire', icon: FileText, title: t('onboarding.regimeForfait'), sub: t('onboarding.regimeForfaitEx') },
    { id: 'reel', icon: FileSpreadsheet, title: t('onboarding.regimeReel'), sub: t('onboarding.regimeReelEx') },
    { id: 'unknown', icon: Sparkles, title: t('onboarding.regimeUnknown'), sub: t('onboarding.regimeUnknownEx'), tone: 'indigo' },
  ];

  const confirm = () => {
    patch('profile', { regime: selected });
    navigate('/ai-intro');
  };

  return (
    <div className="screen stagger">
      <div className="col" style={{ gap: 8 }}>
        <div className="ob-progress"><i className="done" /><i className="done" /><i className="done" /><i /></div>
        <h1>{t('onboarding.regimeTitle')}</h1>
      </div>
      <div className="col" style={{ gap: 12 }}>
        {OPTIONS.map((o) => (
          <OptionCard key={o.id} icon={o.icon} title={o.title} subtitle={o.sub} tone={o.tone} selected={selected === o.id} onClick={() => setSelected(o.id)} />
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={confirm}>{t('common.continue')}</button>
    </div>
  );
}
