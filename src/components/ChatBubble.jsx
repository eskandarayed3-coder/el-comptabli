import { AlertTriangle } from 'lucide-react';
import { useT } from '../i18n/index.js';
import AgentAvatar from './AgentAvatar.jsx';
import MarkdownLite from './MarkdownLite.jsx';

export function TypingBubble({ agent }) {
  return (
    <div className="bubble-row">
      {agent && <AgentAvatar agent={agent} size={28} />}
      <div className="bubble ai">
        <div className="typing"><i /><i /><i /></div>
      </div>
    </div>
  );
}

export default function ChatBubble({ role, text, agent, sources, complexCase, onFindExpert }) {
  const { t } = useT();
  const isUser = role === 'user';

  const bubble = (
    <div className={`bubble ${isUser ? 'user' : 'ai'}`}>
      {isUser ? text : <MarkdownLite text={text} />}
      {!isUser && sources && (
        <div className="sources">
          <span className="pill teal">{t('chat.sources', { s: sources })}</span>
        </div>
      )}
      {!isUser && complexCase && (
        <div className="card tint-coral inner" style={{ marginTop: 10, padding: 12 }}>
          <div className="row small" style={{ gap: 8, fontWeight: 600 }}>
            <AlertTriangle size={16} color="var(--pill-danger-fg)" />
            {t('chat.complexCase')}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={onFindExpert}>
            {t('chat.findExpert')}
          </button>
        </div>
      )}
    </div>
  );

  if (isUser) return bubble;
  return (
    <div className="bubble-row">
      {agent && <AgentAvatar agent={agent} size={28} />}
      {bubble}
    </div>
  );
}
