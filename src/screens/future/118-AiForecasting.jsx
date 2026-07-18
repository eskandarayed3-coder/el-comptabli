import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import StatCard from '../../components/StatCard.jsx';

const DATA = [
  { name: 'Fév', value: 2400 }, { name: 'Mar', value: 2600 }, { name: 'Avr', value: 2900 },
  { name: 'Mai', value: 3100 }, { name: 'Jun', value: 2950 }, { name: 'Jul', value: 3200 },
  { name: 'Aoû*', value: 3450 }, { name: 'Sep*', value: 3300 }, { name: 'Oct*', value: 3600 },
];

export default function AiForecasting() {
  const { t } = useT();
  const [scenario, setScenario] = useState('realistic');

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('future.forecast')} ✨</h1><span className="pill premium">{t('common.premium')}</span></div>
      <div className="card">
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer>
            <LineChart data={DATA}>
              <XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" />
              <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={2} dot={false} strokeDasharray={(d) => (d?.name?.includes('*') ? '4 4' : '0')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {[['realistic', 'Réaliste'], ['optimistic', 'Optimiste'], ['cautious', 'Prudent']].map(([id, label]) => (
          <button key={id} className={`chip ${scenario === id ? 'active' : ''}`} onClick={() => setScenario(id)}>{label}</button>
        ))}
      </div>
      <div className="grid-2">
        <StatCard label="CA août prévu" value={fmtDT(3450, { decimals: 0 })} tone="teal" delta={12} />
        <StatCard label="Tréso fin sept" value={fmtDT(2100, { decimals: 0 })} tone="indigo" />
      </div>
      <div className="card tint-indigo"><span className="small">Basé sur 14 mois de données</span></div>
    </div>
  );
}
