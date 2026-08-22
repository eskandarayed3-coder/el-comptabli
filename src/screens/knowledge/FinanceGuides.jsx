import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { FINANCE_GUIDES } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const GUIDES = Object.entries(FINANCE_GUIDES).map(([slug, guide]) => ({ slug, ...guide }));

export default function FinanceGuides() {
  const navigate = useNavigate();
  const { t } = useT();
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    if (!term) return GUIDES;
    return GUIDES.filter((guide) => `${guide.title} ${guide.intro}`.toLocaleLowerCase('fr').includes(term));
  }, [query]);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.financeGuides')} 📈`} />
      <div className="input-row"><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('knowledge.searchHint')} aria-label={t('knowledge.searchTitle')} /></div>
      <div className="col" style={{ gap: 10 }}>
        {visible.map((guide) => (
          <button key={guide.slug} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/knowledge/read/finance-guide/${guide.slug}`)}>
            <span className="icon-wrap teal"><BookOpen size={18} /></span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{guide.title}</span><span className="tiny muted">{t('knowledge.readTime', { n: guide.min })}</span></span>
          </button>
        ))}
      </div>
      {visible.length === 0 && <EmptyState text={t('knowledge.noSearchResult')} />}
    </div>
  );
}
