import { useState } from 'react';
import { ArrowUp, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/index.js';

/**
 * A small, low-friction AI entry point for the dashboard.
 * It keeps the person in control: examples are optional, the question is
 * visible before sending, and the chat screen remains the source of truth.
 */
export default function AiQuickAsk({ guest = false }) {
  const navigate = useNavigate();
  const { t } = useT();
  const [question, setQuestion] = useState('');
  const examples = t('home.aiExamples');

  function ask(value = question) {
    const q = value.trim();
    if (!q) return;
    if (guest) {
      navigate('/login?next=/chat');
      return;
    }
    navigate(`/chat?q=${encodeURIComponent(q)}`);
  }

  return (
    <section className="card ai-quick-card" aria-labelledby="ai-quick-title">
      <div className="ai-quick-heading">
        <span className="ai-orb" aria-hidden="true"><Sparkles size={21} strokeWidth={2.2} /></span>
        <div className="col" style={{ gap: 2 }}>
          <h2 id="ai-quick-title" style={{ fontSize: 18 }}>{t('home.aiTitle')}</h2>
          <span className="tiny muted">{t('home.aiSubtitle')}</span>
        </div>
        <span className="pill indigo">{t('chat.verified')}</span>
      </div>

      <form className="ai-quick-input" onSubmit={(event) => { event.preventDefault(); ask(); }}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t('home.aiPlaceholder')}
          aria-label={t('home.aiPlaceholder')}
        />
        <button type="submit" disabled={!question.trim()} aria-label={t('home.aiAsk')} title={t('home.aiAsk')}>
          <ArrowUp size={19} strokeWidth={2.4} />
        </button>
      </form>

      <p className="tiny ai-quick-note"><ShieldCheck size={14} aria-hidden="true" /> {t('home.aiPrivacy')}</p>

      <div className="ai-quick-examples" aria-label={t('home.aiExamplesLabel')}>
        {examples.map((example) => (
          <button key={example} type="button" className="chip" onClick={() => ask(example)}>{example}</button>
        ))}
      </div>
    </section>
  );
}
