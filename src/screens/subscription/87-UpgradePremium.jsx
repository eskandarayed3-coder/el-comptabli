import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useT } from '../../i18n/index.js';

const ROWS = [
  ['Questions IA', '10/mois', 'Illimitées'],
  ['Scanner', false, true],
  ['Exports', false, true],
  ['Rapports avancés', false, true],
];

export default function UpgradePremium() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <div className="hero-card indigo center" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>Passe à Premium ✨</h2>
      </div>

      <div className="card">
        <div className="row between tiny muted" style={{ marginBottom: 8 }}>
          <span>Fonctionnalité</span><span className="row" style={{ gap: 20 }}><span>{t('common.free')}</span><span>Premium</span></span>
        </div>
        {ROWS.map(([label, free, premium]) => (
          <div key={label} className="row between small" style={{ padding: '8px 0', borderTop: '1px solid var(--bg-2)' }}>
            <span>{label}</span>
            <span className="row" style={{ gap: 24 }}>
              <span style={{ width: 60, textAlign: 'end' }}>{typeof free === 'boolean' ? (free ? <Check size={14} color="var(--teal-700)" /> : <X size={14} color="var(--text-2)" />) : free}</span>
              <span style={{ width: 60, textAlign: 'end' }}>{typeof premium === 'boolean' ? (premium ? <Check size={14} color="var(--teal-700)" /> : <X size={14} color="var(--text-2)" />) : premium}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="card tint-indigo center">
        <span className="num" style={{ fontSize: 22, fontWeight: 700 }}>20 DT/mois</span>
        <span className="tiny muted"> ou 192 DT/an (-20%)</span>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => navigate('/payment')}>{t('common.continue')}</button>
      <span className="pill teal" style={{ alignSelf: 'center' }}>Essai 7 jours gratuit</span>
    </div>
  );
}
