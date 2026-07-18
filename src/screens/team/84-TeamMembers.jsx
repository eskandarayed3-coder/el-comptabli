import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const MEMBERS = [
  { name: 'Eskandar', role: 'Propriétaire', tone: 'teal', active: 'Actif maintenant' },
  { name: 'Naji B.', role: 'Comptable', tone: 'indigo', active: 'Actif il y a 2h' },
  { name: 'Sana M.', role: 'Assistant', tone: 'gray', active: 'Actif hier' },
];

export default function TeamMembers() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('team.title')}`} />
      <div className="col" style={{ gap: 10 }}>
        {MEMBERS.map((m) => (
          <button key={m.name} className="card row between" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/team/roles')}>
            <span className="row" style={{ gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{m.name[0]}</span>
              <span className="col" style={{ gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{m.name}</span>
                <span className="tiny muted">{m.active}</span>
              </span>
            </span>
            <span className="row" style={{ gap: 8 }}>
              <span className={`pill ${m.tone}`}>{m.role}</span>
              <ChevronRight size={16} color="var(--text-2)" />
            </span>
          </button>
        ))}
        <button className="card" style={{ border: '2px dashed var(--hairline)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)' }}>
          <Plus size={18} /> {t('team.invite')}
        </button>
      </div>
      <p className="tiny center muted">{lang === 'ar' ? '3/5 أعضاء · باك Business' : '3/5 membres · plan Business'}</p>
    </div>
  );
}
