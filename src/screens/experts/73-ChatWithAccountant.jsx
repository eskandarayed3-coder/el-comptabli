import { useState } from 'react';
import { Paperclip, Send, FileText } from 'lucide-react';
import { useT } from '../../i18n/index.js';

export default function ChatWithAccountant() {
  const { t } = useT();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'expert', text: 'Bonjour ! Je regarde ton dossier TVA juillet, je reviens vers toi vite.' },
    { from: 'user', text: 'Merci ! Voici la facture STEG.' },
    { from: 'doc', text: 'Facture STEG.pdf' },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="screen stagger" style={{ paddingBottom: 90 }}>
      <div className="top-bar">
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>M</div>
        <div className="col grow" style={{ gap: 0 }}>
          <span style={{ fontWeight: 700 }}>Mounir B.</span>
          <span className="tiny" style={{ color: 'var(--pill-success-fg)' }}>● En ligne</span>
        </div>
      </div>
      <div className="card tint-teal"><span className="tiny">Consultation liée à ton dossier TVA juillet</span></div>

      <div className="chat-list">
        {messages.map((m, i) => m.from === 'doc' ? (
          <div key={i} className="card inner row" style={{ alignSelf: 'flex-start', gap: 8 }}><FileText size={16} /> {m.text}</div>
        ) : (
          <div key={i} className={`bubble ${m.from === 'user' ? 'user' : 'ai'}`}>{m.text}</div>
        ))}
      </div>

      <div className="chat-input-bar">
        <button className="icon-btn"><Paperclip size={16} /></button>
        <input className="input grow" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={t('chat.placeholder')} />
        <button className="send-btn" onClick={send}><Send size={18} /></button>
      </div>
      <p className="tiny center muted">Réponse sous 24h en moyenne</p>
    </div>
  );
}
