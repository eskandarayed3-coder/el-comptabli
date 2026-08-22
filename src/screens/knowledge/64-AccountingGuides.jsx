import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { ACCOUNTING_GUIDES } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';

const GUIDES = Object.entries(ACCOUNTING_GUIDES).map(([slug, g]) => ({ slug, ...g }));

export default function AccountingGuides() {
  const navigate = useNavigate();
  const { t } = useT();
  // Show every guide by default — the level pills refine, they don't gate.
  const [level, setLevel] = useState('Tous');
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return GUIDES.filter((guide) => (
      (level === 'Tous' || guide.level === level)
      && (!term || `${guide.title} ${guide.intro}`.toLocaleLowerCase('fr').includes(term))
    ));
  }, [level, query]);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.guides')} 📒`} />
      <div className="input-row"><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('knowledge.searchHint')} aria-label={t('knowledge.searchTitle')} /></div>
      <FilterPills options={[{ id: 'Tous', label: t('common.all') }, { id: 'Débutant', label: 'Débutant' }, { id: 'Intermédiaire', label: 'Intermédiaire' }]} value={level} onChange={setLevel} />
      <div className="col" style={{ gap: 10 }}>
        {visible.map((g) => (
          <button key={g.slug} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/knowledge/read/accounting-guide/${g.slug}`)}>
            <span className="icon-wrap teal"><BookOpen size={18} /></span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{g.title}</span><span className="tiny muted">{t('knowledge.readTime', { n: g.min })}</span></span>
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="small muted center">{t('knowledge.noSearchResult')}</p>}
    </div>
  );
}
