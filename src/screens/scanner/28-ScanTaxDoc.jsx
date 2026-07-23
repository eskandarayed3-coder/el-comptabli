import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileScan, Sparkles, Calculator, Home, ChevronRight } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';

const TYPES = ['Avis d’imposition', 'Déclaration', 'Quittance', 'Autre'];

export default function ScanTaxDoc() {
  const navigate = useNavigate();
  const { t } = useT();
  const [type, setType] = useState(TYPES[0]);

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    window.__pendingScanFile = file;
    navigate('/scanner/review');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('scanner.taxDoc')} />

      {/* Preparing a real declaration is a different job than scanning a
          document — link straight to the worksheet builders instead of
          burying them behind a generic photo upload. */}
      <div className="col" style={{ gap: 8 }}>
        <button className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/scanner/declaration-mensuelle')}>
          <span className="icon-wrap teal"><Calculator size={18} /></span>
          <span className="col grow" style={{ gap: 2 }}>
            <span className="small" style={{ fontWeight: 700 }}>Préparer ma déclaration mensuelle</span>
            <span className="tiny muted">Retenue à la source, par catégorie</span>
          </span>
          <ChevronRight size={16} color="var(--text-2)" />
        </button>
        <button className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/scanner/plus-value')}>
          <span className="icon-wrap teal"><Home size={18} /></span>
          <span className="col grow" style={{ gap: 2 }}>
            <span className="small" style={{ fontWeight: 700 }}>Calculer une plus-value immobilière</span>
            <span className="tiny muted">Vente d’un bien, cas standard</span>
          </span>
          <ChevronRight size={16} color="var(--text-2)" />
        </button>
      </div>

      <FilterPills options={TYPES.map((x) => ({ id: x, label: x }))} value={type} onChange={setType} />

      <label
        className="card"
        style={{
          border: '2px dashed var(--teal-400)', background: 'var(--tint-teal)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: 40, cursor: 'pointer', textAlign: 'center',
        }}
      >
        <FileScan size={36} color="var(--teal-700)" />
        <span className="small" style={{ fontWeight: 600 }}>{t('scanner.subtitle')}</span>
        <input type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
      </label>

      <div className="card tint-indigo">
        <div className="row" style={{ gap: 10 }}>
          <Sparkles size={18} color="#4F46E5" />
          <span className="small">L’IA extrait les montants et les échéances automatiquement</span>
        </div>
      </div>

      <label className="btn btn-primary btn-block" style={{ cursor: 'pointer' }}>
        {t('scanner.title')}
        <input type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
      </label>
    </div>
  );
}
