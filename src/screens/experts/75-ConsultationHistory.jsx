import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const SESSIONS = [
  { expert: 'Mounir B.', date: '23 juillet 11:30', type: 'Visio', status: 'upcoming', price: 60 },
  { expert: 'Sonia K.', date: '10 juillet', type: 'Chat', status: 'done', price: 90 },
];

export default function ConsultationHistory() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={t('experts.history')} />
      <div className="col" style={{ gap: 12 }}>
        {SESSIONS.map((s, i) => (
          <div key={i} className="card">
            <div className="row between">
              <span style={{ fontWeight: 700 }}>{s.expert}</span>
              <StatusPill tone={s.status === 'done' ? 'success' : 'warning'}>{s.status === 'done' ? 'Terminée' : 'À venir'}</StatusPill>
            </div>
            <div className="row between small" style={{ marginTop: 6 }}>
              <span className="muted">{s.date} · {s.type}</span>
              <span className="num">{s.price} DT</span>
            </div>
            {s.status === 'done' ? (
              <div className="row between" style={{ marginTop: 10 }}>
                <button className="btn btn-ghost btn-sm">Voir le résumé</button>
                <span className="row" style={{ gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill="#D97706" color="#D97706" />)}</span>
              </div>
            ) : (
              <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={() => navigate('/experts/mounir/video')}>Rejoindre</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
