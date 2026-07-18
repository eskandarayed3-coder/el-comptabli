import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { TAX_GUIDES } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const GUIDES = Object.entries(TAX_GUIDES).map(([slug, g]) => ({ slug, ...g }));

export default function TaxGuides() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.taxGuides')} 🧾`} />
      <div className="input-row"><input className="input" placeholder={t('common.search')} /></div>
      <div className="col" style={{ gap: 10 }}>
        {GUIDES.map((g) => (
          <button key={g.slug} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/knowledge/read/tax-guide/${g.slug}`)}>
            <span className="icon-wrap teal"><BookOpen size={18} /></span>
            <span className="col grow" style={{ gap: 4 }}>
              <span className="small" style={{ fontWeight: 600 }}>{g.title}</span>
              <span className="tiny muted">{t('knowledge.readTime', { n: g.min })}</span>
            </span>
            <StatusPill tone={g.badge.includes('LF') || g.badge.includes('jour') ? 'warning' : 'success'}>{g.badge}</StatusPill>
          </button>
        ))}
      </div>
    </div>
  );
}
