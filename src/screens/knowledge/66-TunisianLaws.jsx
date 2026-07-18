import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ChevronRight } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { LAWS } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';

const CATS = ['Code TVA', 'SCE', 'Loi de finances'];
const LAW_LIST = Object.entries(LAWS).map(([slug, l]) => ({ slug, ...l }));

export default function TunisianLaws() {
  const navigate = useNavigate();
  const { t } = useT();
  const [cat, setCat] = useState('all');

  const visible = LAW_LIST.filter((l) => cat === 'all' || l.badge === cat);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.laws')} 🇹🇳`} />
      <div className="input-row"><input className="input" placeholder={t('common.search')} /></div>
      <FilterPills
        options={[{ id: 'all', label: t('common.all') }, ...CATS.map((c) => ({ id: c, label: c }))]}
        value={cat} onChange={setCat}
      />
      <div className="col" style={{ gap: 10 }}>
        {visible.map((l) => (
          <button key={l.slug} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(`/knowledge/read/law/${l.slug}`)}>
            <span className="icon-wrap teal"><Scale size={18} /></span>
            <span className="col grow" style={{ gap: 3 }}>
              <span className="tiny muted num">{l.num} · {l.date}</span>
              <span className="small" style={{ fontWeight: 700 }}>{l.title}</span>
              <span className="tiny muted">{l.intro}</span>
            </span>
            <ChevronRight size={16} color="var(--text-2)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
      <p className="tiny center muted">Résumés pédagogiques · textes officiels sur jort.gov.tn</p>
    </div>
  );
}
