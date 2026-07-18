import { useState } from 'react';
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
  const visible = level === 'Tous' ? GUIDES : GUIDES.filter((g) => g.level === level);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.guides')} 📒`} />
      <div className="input-row"><input className="input" placeholder={t('common.search')} /></div>
      <FilterPills options={[{ id: 'Tous', label: t('common.all') }, { id: 'Débutant', label: 'Débutant' }, { id: 'Intermédiaire', label: 'Intermédiaire' }]} value={level} onChange={setLevel} />
      <div className="col" style={{ gap: 10 }}>
        {visible.map((g) => (
          <button key={g.slug} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/knowledge/read/accounting-guide/${g.slug}`)}>
            <span className="icon-wrap teal"><BookOpen size={18} /></span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{g.title}</span><span className="tiny muted">{t('knowledge.readTime', { n: g.min })}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}
