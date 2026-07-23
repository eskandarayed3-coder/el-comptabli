import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import SuggestionChips from '../../components/SuggestionChips.jsx';

export default function AiIntro() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <div className="col" style={{ gap: 8 }}>
        <div className="ob-progress"><i className="done" /><i className="done" /><i className="done" /><i className="done" /></div>
        <h1>{t('onboarding.aiTitle')}</h1>
      </div>

      <div className="card tint-indigo">
        <div className="bubble ai" style={{ maxWidth: '100%' }}>
          <span className="row" style={{ gap: 8, marginBottom: 6 }}><Sparkles size={16} /> El Comptabli</span>
          {t('onboarding.aiBubble')}
        </div>
      </div>

      {/* Tapping a sample question finishes onboarding and drops the user
          straight into the chat with that question ready — a live first taste
          of the AI instead of a dead demo row. */}
      <SuggestionChips items={t('home.chips')} onPick={(q) => navigate('/chat?q=' + encodeURIComponent(q))} />

      <div className="pill indigo" style={{ alignSelf: 'flex-start' }}>
        <ShieldCheck size={14} /> {t('onboarding.aiVerified')}
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={() => navigate('/subscription-select')}>
        {t('common.continue')}
      </button>
    </div>
  );
}
