import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const QUESTIONS = [
  { q: 'C’est quoi le régime forfaitaire ?', topic: 'forfait' },
  { q: 'Comment calculer ma TVA ?', topic: 'tva' },
  { q: 'Je déclare quoi chaque mois ?', topic: 'compta' },
  { q: 'C’est quoi un acompte provisionnel ?', topic: 'irpp' },
  { q: 'CNSS indépendant, ça marche comment ?', topic: 'cnss' },
  { q: 'Comment passer du forfaitaire au réel ?', topic: 'forfait' },
  { q: 'Quels justificatifs garder pour mes achats ?', topic: 'compta' },
];

export default function SuggestedQuestions() {
  const navigate = useNavigate();
  const { t } = useT();
  const [topic, setTopic] = useState('all');

  const topics = Object.entries(t('chat.topics')).map(([id, label]) => ({ id, label }));
  const filtered = QUESTIONS.filter((q) => topic === 'all' || q.topic === topic);

  return (
    <div className="screen stagger">
      <TopBar title={t('chat.suggestedTitle')} />
      <FilterPills options={topics} value={topic} onChange={setTopic} />
      <div className="col" style={{ gap: 8 }}>
        {filtered.map((item, i) => (
          <button
            key={i}
            className="list-row"
            style={{ justifyContent: 'space-between', width: '100%', textAlign: 'start' }}
            onClick={() => navigate('/chat?q=' + encodeURIComponent(item.q))}
          >
            <span className="small grow" style={{ fontWeight: 500 }}>{item.q}</span>
            <StatusPill tone={item.topic === 'tva' ? 'teal' : 'indigo'}>{t('chat.topics')[item.topic]}</StatusPill>
            <ChevronRight size={16} color="var(--text-2)" />
          </button>
        ))}
      </div>
    </div>
  );
}
