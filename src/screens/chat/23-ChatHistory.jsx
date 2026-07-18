import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, Plus, Search as SearchIcon, HelpCircle, ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FAB from '../../components/FAB.jsx';

export default function ChatHistory() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const [q, setQ] = useState('');

  const chats = [...state.chats]
    .filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.pinned - a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

  const openChat = (chat) => navigate('/chat?q=' + encodeURIComponent(chat.messages[chat.messages.length - 1]?.text.slice(0, 0) || ''));

  return (
    <div className="screen stagger">
      <TopBar title={t('chat.historyTitle')} />
      <div className="input-row">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} />
        <span className="trailing"><SearchIcon size={16} /></span>
      </div>

      <button className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/chat/suggested')}>
        <span className="icon-wrap teal"><HelpCircle size={18} /></span>
        <span className="small grow" style={{ fontWeight: 600 }}>{t('chat.suggestedTitle')}</span>
        <ChevronRight size={16} color="var(--text-2)" />
      </button>

      {chats.length === 0 && <EmptyState text={t('chat.empty')} />}
      <div className="col" style={{ gap: 10 }}>
        {chats.map((c) => (
          <TintCard key={c.id} tone="gray" onClick={() => navigate('/chat')}>
            <div className="col" style={{ gap: 6 }}>
              <div className="row between">
                <span className="row" style={{ gap: 6, fontWeight: 700 }}>
                  {c.pinned && <Pin size={13} color="var(--teal-700)" />}
                  {c.title}
                </span>
                <span className="tiny muted">{fmtDate(c.updatedAt, lang, { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.messages[c.messages.length - 1]?.text}
              </p>
              <StatusPill tone={c.domain === 'Compta' ? 'indigo' : 'teal'}>{c.domain}</StatusPill>
            </div>
          </TintCard>
        ))}
      </div>
      <FAB icon={Plus} label={t('chat.newQuestion')} onClick={() => navigate('/chat')} />
    </div>
  );
}
