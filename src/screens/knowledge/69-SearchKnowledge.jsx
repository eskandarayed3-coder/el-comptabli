import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { allKnowledgeItems } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const ITEMS = allKnowledgeItems();

function matches(item, term) {
  return [item.title, item.intro, item.category, item.badge, ...(item.sections || []).flatMap((section) => [section.heading, section.body])]
    .join(' ')
    .toLocaleLowerCase('fr')
    .includes(term);
}

export default function SearchKnowledge() {
  const navigate = useNavigate();
  const { t } = useT();
  const [query, setQuery] = useState('');
  const term = query.trim().toLocaleLowerCase('fr');
  const results = useMemo(() => (term ? ITEMS.filter((item) => matches(item, term)).slice(0, 12) : []), [term]);

  return (
    <div className="screen stagger">
      <TopBar title={t('knowledge.searchTitle')} />
      <div className="input-row"><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('knowledge.searchHint')} autoFocus /></div>

      {!term && <div className="card tint-gray small muted">{t('knowledge.referenceLibraryHint')}</div>}
      {term && results.length === 0 && <EmptyState text={t('knowledge.noSearchResult')} />}

      {results.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <span className="tiny muted">{t('knowledge.searchResults', { n: results.length })}</span>
          {results.map((item) => (
            <button key={`${item.routeType}-${item.slug}`} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/knowledge/read/${item.routeType}/${item.slug}`)}>
              <span className="icon-wrap teal"><BookOpen size={18} /></span>
              <span className="col grow" style={{ gap: 3 }}>
                <span className="small" style={{ fontWeight: 600 }}>{item.title}</span>
                <span className="tiny muted">{item.category} · {t('knowledge.readTime', { n: item.min })}</span>
              </span>
              {item.badge && <StatusPill tone={/(vérifier|verify|cnss)/i.test(item.badge) ? 'warning' : 'success'}>{item.badge}</StatusPill>}
              <ArrowRight size={16} color="var(--text-2)" />
            </button>
          ))}
        </div>
      )}

      {term && (
        <div className="card tint-indigo row" style={{ gap: 10, alignItems: 'center' }}>
          <Sparkles size={18} color="var(--indigo-600)" />
          <span className="small grow">{t('knowledge.askAI')}</span>
          <button className="pill white" onClick={() => navigate(`/chat?q=${encodeURIComponent(query)}`)}>{t('knowledge.askAI')}</button>
        </div>
      )}
    </div>
  );
}
