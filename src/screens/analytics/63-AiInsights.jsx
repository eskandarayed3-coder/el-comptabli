import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import TintCard from '../../components/TintCard.jsx';

const INSIGHTS = [
  { icon: '💰', text: 'Tu peux récupérer 67 DT de TVA sur tes 3 factures non scannées', action: 'Scanner', to: '/scanner' },
  { icon: '📉', text: 'Marge en baisse de 3pts vs juin', action: 'Voir pourquoi', to: '/overview' },
  { icon: '📅', text: 'Prévois 928 DT de solde après la TVA du 28', action: 'Voir la tréso', to: '/reports/cashflow' },
  { icon: '🎯', text: 'Objectif CA mensuel atteint à 91%', action: 'Détail', to: '/overview' },
];

export default function AiInsights() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('analytics.insights')} ✨</h1>
        <span className="pill premium">{t('common.premium')}</span>
      </div>
      <div className="col" style={{ gap: 12 }}>
        {INSIGHTS.map((it, i) => (
          <TintCard key={i} tone="indigo" onClick={() => navigate(it.to)}>
            <div className="row between">
              <span className="small">{it.icon} {it.text}</span>
              <span className="pill white">{it.action}</span>
            </div>
          </TintCard>
        ))}
      </div>
      <p className="tiny center muted">Mis à jour il y a 2h</p>
    </div>
  );
}
