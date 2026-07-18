import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const GROUPS = [
  { topic: 'Compte & abonnement', items: [
    ['Comment changer de plan ?', 'Va dans Profil > Passer Premium, ou Profil > Mon plan.'],
  ] },
  { topic: 'IA & fiabilité', items: [
    ['L’IA peut-elle se tromper ?', 'Oui, c’est un outil pédagogique adossé à une base vérifiée ; en cas de doute consulte un expert.'],
  ] },
  { topic: 'Scanner', items: [
    ['Quels formats sont acceptés ?', 'Photos JPG/PNG et fichiers PDF.'],
  ] },
  { topic: 'Données & sécurité', items: [
    ['Mes données sont-elles partagées ?', 'Non, elles restent sur cet appareil et ne sont jamais vendues.'],
  ] },
];

export default function Faq() {
  const { t } = useT();
  const [open, setOpen] = useState('IA & fiabilité');

  return (
    <div className="screen stagger">
      <TopBar title={t('knowledge.faq')} />
      <div className="input-row"><input className="input" placeholder={t('common.search')} /></div>
      <div className="col" style={{ gap: 10 }}>
        {GROUPS.map((g) => (
          <div key={g.topic} className="card inner">
            <button className="row between" style={{ width: '100%' }} onClick={() => setOpen(open === g.topic ? null : g.topic)}>
              <span style={{ fontWeight: 600 }}>{g.topic}</span>
              <ChevronDown size={16} style={{ transform: open === g.topic ? 'rotate(180deg)' : 'none' }} />
            </button>
            {open === g.topic && g.items.map(([q, a]) => (
              <div key={q} className="col" style={{ gap: 4, marginTop: 10 }}>
                <span className="small" style={{ fontWeight: 600 }}>{q}</span>
                <span className="tiny muted">{a}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="card tint-gray center"><span className="small">Pas trouvé ? <button className="pill teal" style={{ marginInlineStart: 6 }}>Écris-nous</button></span></div>
    </div>
  );
}
