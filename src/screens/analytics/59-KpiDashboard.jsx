import { useState } from 'react';
import { useT } from '../../i18n/index.js';
import FilterPills from '../../components/FilterPills.jsx';

const KPIS = [
  { label: 'CA mensuel', value: '3 200 DT', delta: 12 },
  { label: 'Marge', value: '39%', delta: 2 },
  { label: 'Panier moyen', value: '640 DT', delta: null },
  { label: 'Délai paiement clients', value: '12j', delta: -3 },
  { label: 'TVA récupérée', value: '245 DT', delta: null },
  { label: 'Clients actifs', value: '5', delta: null },
];

export default function KpiDashboard() {
  const { t } = useT();
  const [period, setPeriod] = useState('month');

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('analytics.kpi')} 📈</h1>
        <span className="pill premium">{t('common.premium')}</span>
      </div>
      <FilterPills options={[{ id: 'month', label: 'Mois' }, { id: 'quarter', label: 'Trimestre' }, { id: 'year', label: 'Année' }]} value={period} onChange={setPeriod} />
      <div className="grid-2">
        {KPIS.map((k) => (
          <div key={k.label} className="stat-card" style={{ background: 'var(--tint-teal)' }}>
            <span className="value num">{k.value}</span>
            <span className="label">{k.label}</span>
            {k.delta != null && <span className={`delta ${k.delta >= 0 ? 'up' : 'down'}`}>{k.delta >= 0 ? '+' : ''}{k.delta}{typeof k.delta === 'number' && k.label.includes('Marge') ? 'pts' : '%'}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
