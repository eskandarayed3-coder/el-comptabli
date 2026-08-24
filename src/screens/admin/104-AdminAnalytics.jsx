import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import DataTable from '../../components/admin/DataTable.jsx';

const FUNNEL = [
  ['Inscription', 2847], ['Onboarding complet', 2310], ['1ère question IA', 1980], ['1er scan', 890], ['Premium', 312],
];

const TOP_Q = [
  { q: 'C’est quoi le régime forfaitaire ?', count: 412 },
  { q: 'Comment calculer ma TVA ?', count: 389 },
  { q: 'Je déclare quoi ce mois ?', count: 301 },
];

const FEATURES = [
  { name: 'Chat', value: 4200 }, { name: 'Scanner', value: 2100 }, { name: 'Tax calc', value: 1800 }, { name: 'Reports', value: 900 },
];

export default function AdminAnalytics() {
  return (
    <>
      <div className="row between">
        <h1>Analytics</h1>
        <div className="row" style={{ gap: 10 }}>
          <input className="input" type="date" style={{ maxWidth: 160 }} />
          <button className="btn btn-ghost btn-sm">Exporter CSV</button>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Funnel</h3>
        <div className="col" style={{ gap: 10 }}>
          {FUNNEL.map(([label, v]) => (
            <div key={label} className="col" style={{ gap: 4 }}>
              <div className="row between small"><span>{label}</span><span className="num">{v.toLocaleString('fr-FR')}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(v / FUNNEL[0][1]) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Usage par fonctionnalité</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer><BarChart data={FEATURES}><XAxis dataKey="name" fontSize={11} /><Bar dataKey="value" fill="#14B8A6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: 12 }}>Top questions IA</h3>
          <DataTable columns={[{ key: 'q', label: 'Question' }, { key: 'count', label: 'Occurrences' }]} rows={TOP_Q} />
        </div>
      </div>
    </>
  );
}
