import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function SearchKnowledge() {
  const navigate = useNavigate();
  const { t } = useT();
  const [q, setQ] = useState('forfaitaire');

  return (
    <div className="screen stagger">
      <TopBar title={t('knowledge.searchTitle')} />
      <input className="input" value={q} onChange={(e) => setQ(e.target.value)} />

      {q && (
        <>
          <div className="col" style={{ gap: 8 }}>
            <h3 className="small muted">Guides</h3>
            {['Le régime forfaitaire expliqué simplement', 'Comment passer du forfaitaire au réel'].map((g) => (
              <div key={g} className="card inner small">{g}</div>
            ))}
          </div>
          <div className="col" style={{ gap: 8 }}>
            <h3 className="small muted">Lois</h3>
            <div className="card inner small">Loi de finances 2026 · nouveau régime forfaitaire</div>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <h3 className="small muted">Questions fréquentes</h3>
            {['C’est quoi le régime forfaitaire ?', 'Puis-je changer de régime en cours d’année ?'].map((g) => (
              <div key={g} className="row small" style={{ gap: 8, padding: '6px 0' }}>• {g}</div>
            ))}
          </div>
          <div className="card tint-indigo">
            <div className="row between">
              <span className="small">🤖 Demander directement à l’IA : C’est quoi le forfaitaire ?</span>
              <button className="pill white" onClick={() => navigate('/chat?q=' + encodeURIComponent('C’est quoi le forfaitaire ?'))}>Poser la question</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
