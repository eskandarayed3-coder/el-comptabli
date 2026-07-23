import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Logo from '../../components/Logo.jsx';

const WHATSAPP = '21628456450';

export default function About() {
  const navigate = useNavigate();
  const { t } = useT();
  const ROWS = [
    { label: 'Conditions d’utilisation', onClick: () => navigate('/legal/terms') },
    { label: 'Politique de confidentialité', onClick: () => navigate('/legal/privacy') },
    { label: 'Nous contacter', onClick: () => window.open(`https://wa.me/${WHATSAPP}`, '_blank', 'noopener') },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={t('profile.about')} />
      <div className="col center" style={{ alignItems: 'center', gap: 8 }}>
        <Logo size={72} />
        <h2>El Comptabli</h2>
        <span className="tiny muted num">Version 1.0.0</span>
      </div>

      <div className="card tint-teal center">
        <span className="small">Rendre la compta et la fiscalité simples pour chaque entrepreneur tunisien 🇹🇳</span>
      </div>

      <div className="col" style={{ gap: 4 }}>
        {ROWS.map((r) => (
          <button key={r.label} className="row between" style={{ padding: '14px 4px', width: '100%' }} onClick={r.onClick}>
            <span className="small">{r.label}</span><ChevronRight size={16} color="var(--text-2)" />
          </button>
        ))}
        <div className="card tint-amber">
          <span className="small">{t('disclaimer')}</span>
        </div>
        <button className="row between" style={{ padding: '14px 4px', width: '100%' }}>
          <span className="small row" style={{ gap: 6 }}><Star size={14} /> Noter l’app</span><ChevronRight size={16} color="var(--text-2)" />
        </button>
      </div>

      <p className="tiny center muted">Made in Tunisia 🇹🇳 with ❤️</p>
    </div>
  );
}
