import { useNavigate, useParams } from 'react-router-dom';
import { Star, ShieldCheck, MessageCircle } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const SERVICES = [
  ['Consultation 30 min', 60], ['Déclaration TVA', 90], ['Création SUARL', 350],
];

export default function AccountantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useT();
  const name = id === 'sonia' ? 'Sonia K.' : id === 'karim' ? 'Karim T.' : 'Mounir B.';

  return (
    <div className="screen stagger" style={{ paddingBottom: 100 }}>
      <TopBar title={t('experts.profile')} />
      <div className="col center" style={{ alignItems: 'center', gap: 8 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24 }}>{name[0]}</div>
        <h2>{name}</h2>
        <span className="pill teal"><ShieldCheck size={12} /> Certifié</span>
        <span className="small row" style={{ gap: 4 }}><Star size={14} fill="#D97706" color="#D97706" /> 4,8 · Nabeul · 15 ans d’expérience</span>
      </div>

      <p className="small">Expert-comptable diplômé, spécialisé dans l’accompagnement des freelances et petites structures. Réponses claires, sans jargon.</p>

      <div className="row" style={{ gap: 6 }}>
        <span className="pill indigo">TVA</span><span className="pill indigo">Forfaitaire</span>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Services</h3>
        <div className="col" style={{ gap: 10 }}>
          {SERVICES.map(([label, price]) => (
            <div key={label} className="row between small"><span>{label}</span><span className="num" style={{ fontWeight: 600 }}>{price} DT</span></div>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 10 }}>
        <h3>Avis</h3>
        {['Très pédagogue, m’a aidé à choisir mon régime.', 'Réponse rapide et claire sur ma déclaration TVA.'].map((r, i) => (
          <div key={i} className="card inner small">"{r}"</div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 0, insetInline: 0, padding: 16, background: 'var(--bg)', display: 'flex', gap: 10, maxWidth: 430, margin: '0 auto', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button className="icon-btn" style={{ width: 52, height: 52 }} onClick={() => navigate(`/experts/${id}/chat`)}><MessageCircle size={20} /></button>
        <button className="btn btn-primary grow" onClick={() => navigate(`/experts/${id}/book`)}>{t('experts.book')}</button>
      </div>
    </div>
  );
}
