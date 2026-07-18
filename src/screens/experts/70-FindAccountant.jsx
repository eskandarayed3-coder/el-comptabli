import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';

const EXPERTS = [
  { id: 'mounir', name: 'Mounir B.', city: 'Nabeul', rating: 4.8, reviews: 127, specialties: ['TVA', 'Forfaitaire'], price: 60 },
  { id: 'sonia', name: 'Sonia K.', city: 'Tunis', rating: 4.9, reviews: 88, specialties: ['Création société', 'Audit'], price: 80 },
  { id: 'karim', name: 'Karim T.', city: 'Sfax', rating: 4.6, reviews: 54, specialties: ['TVA', 'Audit'], price: 55 },
];

export default function FindAccountant() {
  const navigate = useNavigate();
  const { t } = useT();
  const [specialty, setSpecialty] = useState('all');

  const list = EXPERTS.filter((e) => specialty === 'all' || e.specialties.includes(specialty));

  return (
    <div className="screen stagger">
      <TopBar title={`${t('experts.find')} 👨‍💼`} />
      <div className="row" style={{ gap: 10 }}>
        <input className="input grow" placeholder={t('common.search')} />
        <select className="input" style={{ width: 120 }}><option>Nabeul</option><option>Tunis</option><option>Sfax</option></select>
      </div>
      <FilterPills
        options={[{ id: 'all', label: t('common.all') }, { id: 'TVA', label: 'TVA' }, { id: 'Création société', label: 'Création société' }, { id: 'Forfaitaire', label: 'Forfaitaire' }, { id: 'Audit', label: 'Audit' }]}
        value={specialty} onChange={setSpecialty}
      />
      <div className="col" style={{ gap: 12 }}>
        {list.map((e) => (
          <div key={e.id} className="card">
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{e.name[0]}</div>
              <div className="col grow" style={{ gap: 2 }}>
                <span style={{ fontWeight: 700 }}>{e.name}</span>
                <span className="tiny muted">Expert-comptable certifié · {e.city}</span>
                <span className="tiny row" style={{ gap: 4 }}><Star size={12} fill="#D97706" color="#D97706" /> {e.rating} ({e.reviews} avis)</span>
              </div>
            </div>
            <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {e.specialties.map((s) => <span key={s} className="pill teal">{s}</span>)}
            </div>
            <div className="row between" style={{ marginTop: 10 }}>
              <span className="small muted">{t('experts.perHour')} dès {e.price} DT</span>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/experts/${e.id}`)}>{t('experts.profile')}</button>
            </div>
          </div>
        ))}
      </div>
      <p className="tiny center muted">Vérifiés par El Comptabli ✓</p>
    </div>
  );
}
