import { useT } from '../../i18n/index.js';
import { ProgressRing } from '../../components/HeroCard.jsx';
import TopBar from '../../components/TopBar.jsx';

export default function AuditAssistant() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('future.audit')} 🔍</h1><span className="pill premium">{t('common.premium')}</span></div>
      <div className="hero-card center" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
        <span className="small">Prêt pour un contrôle</span>
        <ProgressRing pct={84} size={90} />
      </div>

      <div className="card tint-coral"><span className="small">Pièces justificatives : 3 factures sans scan</span></div>
      <div className="card tint-teal"><span className="small">Déclarations : toutes déposées ✓</span></div>
      <div className="card tint-amber">
        <div className="row between"><span className="small">Cohérence TVA : 1 écart détecté</span><span className="pill white">Voir</span></div>
      </div>

      <button className="btn btn-primary btn-block">Générer le dossier de contrôle</button>
      <p className="tiny center muted">Prépare-toi sereinement, avec ton expert-comptable</p>
    </div>
  );
}
