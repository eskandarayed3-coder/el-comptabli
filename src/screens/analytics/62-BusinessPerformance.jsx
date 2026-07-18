import { useT } from '../../i18n/index.js';
import { ProgressRing } from '../../components/HeroCard.jsx';

const SCORES = [
  ['Rentabilité', 82], ['Trésorerie', 74], ['Régularité fiscale', 90], ['Croissance', 65],
];

export default function BusinessPerformance() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <div className="hero-card center" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <span className="small" style={{ fontWeight: 700 }}>Santé financière</span>
        <ProgressRing pct={78} size={100} />
        <span style={{ fontSize: 22, fontWeight: 700 }} className="num">78/100</span>
      </div>
      <div className="col" style={{ gap: 12 }}>
        {SCORES.map(([label, v]) => (
          <div key={label} className="col" style={{ gap: 4 }}>
            <div className="row between small"><span>{label}</span><span className="num">{v}</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${v}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="card tint-indigo"><span className="small">Ton business est sain. Point d’attention : la trésorerie de fin de mois après la TVA.</span></div>
    </div>
  );
}
