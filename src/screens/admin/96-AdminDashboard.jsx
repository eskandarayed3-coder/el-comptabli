import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import KpiRow from '../../components/admin/KpiRow.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

const GROWTH = [
  { name: 'Fév', value: 1800 }, { name: 'Mar', value: 2050 }, { name: 'Avr', value: 2280 },
  { name: 'Mai', value: 2490 }, { name: 'Jun', value: 2690 }, { name: 'Jul', value: 2847 },
];

const SIGNUPS = [
  { name: 'Amine T.', email: 'amine.t@mail.com', plan: 'Gratuit', date: '16/07/2026' },
  { name: 'Rania S.', email: 'rania.s@mail.com', plan: 'Premium', date: '15/07/2026' },
  { name: 'Mehdi K.', email: 'mehdi.k@mail.com', plan: 'Gratuit', date: '15/07/2026' },
  { name: 'Yosra B.', email: 'yosra.b@mail.com', plan: 'Premium', date: '14/07/2026' },
];

export default function AdminDashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <KpiRow items={[
        { label: 'Utilisateurs', value: '2 847', delta: 12 },
        { label: 'Abonnés Premium', value: '312' },
        { label: 'MRR', value: '6 240 DT' },
        { label: 'Questions IA / jour', value: '1 205' },
      ]} />

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Croissance · 6 mois</h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={GROWTH}>
              <XAxis dataKey="name" stroke="var(--text-2)" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ marginBottom: 12 }}>Inscriptions récentes</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Nom' }, { key: 'email', label: 'Email' },
              { key: 'plan', label: 'Plan', render: (r) => <span className={`pill ${r.plan === 'Premium' ? 'premium' : 'teal'}`}>{r.plan}</span> },
              { key: 'date', label: 'Inscrit le' },
            ]}
            rows={SIGNUPS}
          />
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Santé système</h3>
          <div className="col" style={{ gap: 10 }}>
            {['API', 'OCR', 'RAG'].map((s) => (
              <div key={s} className="row between small"><span>{s}</span><span className="pill success">✓</span></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
