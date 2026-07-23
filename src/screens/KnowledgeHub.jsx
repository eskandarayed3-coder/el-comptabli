import { useNavigate } from 'react-router-dom';
import { BookOpen, Landmark, Scale, Newspaper, HelpCircle, Search, Settings, ChevronRight, GraduationCap, Sparkles, Target, ListTree } from 'lucide-react';
import { useT } from '../i18n/index.js';

export default function KnowledgeHub() {
  const navigate = useNavigate();
  const { t } = useT();

  const LINKS = [
    { to: '/knowledge/guides', icon: BookOpen, label: t('knowledge.guides') },
    { to: '/accounting/accounts', icon: ListTree, label: t('accounting.accounts') },
    { to: '/knowledge/tax-guides', icon: Landmark, label: t('knowledge.taxGuides') },
    { to: '/knowledge/laws', icon: Scale, label: t('knowledge.laws') },
    { to: '/knowledge/law-updates', icon: Newspaper, label: t('knowledge.lawUpdates') },
    { to: '/knowledge/faq', icon: HelpCircle, label: t('knowledge.faq') },
  ];

  return (
    <div className="screen stagger">
      <div className="row between">
        <h1>{t('knowledge.title')}</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="icon-btn" onClick={() => navigate('/profile/settings')} title="Paramètres"><Settings size={18} /></button>
          <button className="icon-btn" onClick={() => navigate('/knowledge/search')}><Search size={18} /></button>
        </div>
      </div>

      <button className="hero-card indigo" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/knowledge/exam-solver')}>
        <div className="row between">
          <div className="col" style={{ gap: 6 }}>
            <span className="row" style={{ gap: 6 }}><GraduationCap size={18} /> <span className="small" style={{ fontWeight: 700 }}>{t('knowledge.examSolver')}</span></span>
            <span className="tiny" style={{ maxWidth: 220 }}>{t('knowledge.examSolverHint')}</span>
          </div>
          <Sparkles size={22} />
        </div>
      </button>

      <button className="hero-card" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/knowledge/quiz')}>
        <div className="row between">
          <div className="col" style={{ gap: 6 }}>
            <span className="row" style={{ gap: 6 }}><Target size={18} /> <span className="small" style={{ fontWeight: 700 }}>{t('quiz.title')}</span></span>
            <span className="tiny" style={{ maxWidth: 220 }}>{t('quiz.hint')}</span>
          </div>
          <Sparkles size={22} />
        </div>
      </button>

      <div className="col" style={{ gap: 6 }}>
        {LINKS.map(({ to, icon: Icon, label }) => (
          <button key={to} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(to)}>
            <span className="icon-wrap teal"><Icon size={18} /></span>
            <span className="small grow" style={{ fontWeight: 600 }}>{label}</span>
            <ChevronRight size={16} color="var(--text-2)" />
          </button>
        ))}
      </div>
    </div>
  );
}
