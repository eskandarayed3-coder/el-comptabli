import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { History, Send, ExternalLink, ChevronDown, Check, Mic, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { chatStream } from '../../lib/api.js';
import { AGENTS, agentById } from '../../lib/agents.js';
import ChatBubble, { TypingBubble } from '../../components/ChatBubble.jsx';
import AgentAvatar from '../../components/AgentAvatar.jsx';
import SuggestionChips from '../../components/SuggestionChips.jsx';
import DisclaimerBanner from '../../components/DisclaimerBanner.jsx';
import Sheet from '../../components/Sheet.jsx';

const COMPLEX_HINTS = ['expert', 'complexe', 'cas particulier', 'litige', 'redressement'];

export default function AIChat() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { state, patch, add, toast } = useStore();
  const { t, lang } = useT();
  const [agentId, setAgentId] = useState(params.get('agent') || 'general');
  const [pickerOpen, setPickerOpen] = useState(false);
  const agent = agentById(agentId);

  const greeting = (id) => {
    const a = agentById(id);
    return id === 'general' ? t('chat.hello') : `${t(a.nameKey)} 👋 ${t(a.taglineKey)}.`;
  };

  const [messages, setMessages] = useState(() => [{ role: 'model', text: greeting(agentId) }]);
  const [input, setInput] = useState(params.get('q') || '');
  const [busy, setBusy] = useState(false);
  const [aiOff, setAiOff] = useState(null);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (params.get('q')) send(params.get('q'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchAgent(id) {
    if (id === agentId) { setPickerOpen(false); return; }
    setAgentId(id);
    setMessages([{ role: 'model', text: greeting(id) }]);
    setAiOff(null);
    setPickerOpen(false);
  }

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    const next = [...messages, { role: 'user', text: q }];
    setMessages(next);
    setBusy(true);
    patch('settings', { aiQuestionsUsed: (state.settings.aiQuestionsUsed || 0) + 1 });

    let full = '';
    let responseSources = [];
    setMessages((m) => [...m, { role: 'model', text: '' }]);
    try {
      abortRef.current = new AbortController();
      full = await chatStream({
        messages: next,
        profile: state.profile,
        agentId,
        signal: abortRef.current.signal,
        onMeta: (meta) => {
          responseSources = Array.isArray(meta?.sources) ? meta.sources : [];
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { ...copy[copy.length - 1], sources: responseSources };
            return copy;
          });
        },
        onChunk: (acc) => setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], role: 'model', text: acc };
          return copy;
        }),
      });
      add('chats', {
        title: q.slice(0, 40),
        domain: 'Fiscalité',
        agentId,
        pinned: false,
        updatedAt: new Date().toISOString(),
        messages: [...next, { role: 'model', text: full, sources: responseSources }],
      });
    } catch (e) {
      const offCodes = ['api_disabled', 'bad_key', 'no_vision', 'no_credits'];
      if (offCodes.includes(e.friendly?.code)) setAiOff(e.friendly);
      else toast(e.friendly?.code ? t(`aiOff.codes.${e.friendly.code}`) : t('aiOff.codes.upstream_error'), 'error');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  const complex = (text) => COMPLEX_HINTS.some((h) => text.toLowerCase().includes(h));

  return (
    <div className="screen stagger" style={{ paddingBottom: 100 }}>
      <div className="top-bar">
        <button className="row grow" style={{ gap: 10, textAlign: 'start' }} onClick={() => setPickerOpen(true)}>
          <AgentAvatar agent={agent} size={36} />
          <span className="col" style={{ gap: 0 }}>
            <span className="row" style={{ gap: 4, fontWeight: 700, fontSize: 16 }}>{t(agent.nameKey)} <ChevronDown size={14} /></span>
            <span className="tiny muted">{t(agent.taglineKey)}</span>
          </span>
        </button>
        <button className="icon-btn" onClick={() => navigate('/chat/reports')} title={t('chat.reportsTitle')}><Sparkles size={18} /></button>
        <button className="icon-btn" onClick={() => navigate('/chat/voice')} title={t('chat.voiceListening')}><Mic size={18} /></button>
        <button className="icon-btn" onClick={() => navigate('/chat/history')}><History size={18} /></button>
      </div>

      <DisclaimerBanner />

      {aiOff && (
        <div className="card tint-amber">
          <p className="small" style={{ fontWeight: 600 }}>{t(`aiOff.codes.${aiOff.code}`) || t('aiOff.title')}</p>
          <p className="tiny muted">{t('aiOff.body')}</p>
          <a className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} href={aiOff.activationUrl || 'https://console.groq.com/keys'} target="_blank" rel="noreferrer">
            {t('aiOff.action')} <ExternalLink size={14} />
          </a>
        </div>
      )}

      <div className="chat-list" ref={listRef}>
        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            role={m.role}
            text={m.text}
            agent={agent}
            sources={m.role === 'model' && i > 0 ? m.sources : null}
            complexCase={m.role === 'model' && i === messages.length - 1 && complex(m.text)}
            onFindExpert={() => navigate('/experts')}
          />
        ))}
        {busy && messages[messages.length - 1]?.text === '' && <TypingBubble agent={agent} />}
      </div>

      <SuggestionChips
        items={[t('home.chips')[0], t('home.chips')[2]]}
        onPick={(q) => send(q)}
      />

      <div className="chat-input-bar">
        <input
          className="input grow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={t('chat.placeholder')}
        />
        <button className="send-btn" disabled={!input.trim() || busy} onClick={() => send()}>
          <Send size={18} />
        </button>
      </div>

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <h3 style={{ marginBottom: 16 }}>{t('agents.pick')}</h3>
        <div className="grid-2">
          {AGENTS.map((a) => (
            <button
              key={a.id}
              className={`card inner ${a.id === agentId ? 'tint-teal' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', position: 'relative', padding: 16 }}
              onClick={() => switchAgent(a.id)}
            >
              {a.id === agentId && <Check size={16} color="var(--teal-700)" style={{ position: 'absolute', top: 10, insetInlineEnd: 10 }} />}
              <AgentAvatar agent={a} size={56} />
              <span className="small" style={{ fontWeight: 700 }}>{t(a.nameKey)}</span>
              <span className="tiny muted">{t(a.taglineKey)}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
