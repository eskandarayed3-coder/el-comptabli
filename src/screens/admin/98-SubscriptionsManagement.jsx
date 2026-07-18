import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis } from 'recharts';
import KpiRow from '../../components/admin/KpiRow.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

const DIST = [{ name: 'Gratuit', value: 2535 }, { name: 'Premium', value: 312 }];
const CHURN = [{ name: 'Fév', value: 4 }, { name: 'Mar', value: 3 }, { name: 'Avr', value: 5 }, { name: 'Mai', value: 2 }, { name: 'Jun', value: 3 }, { name: 'Jul', value: 2 }];
const SUBS = [
  { user: 'Rania S.', plan: 'Premium', status: 'Actif', start: '15/07/2026', next: '15/08/2026', amount: '20 DT' },
  { user: 'Amine T.', plan: 'Premium', status: 'Impayé', start: '01/06/2026', next: '01/07/2026', amount: '20 DT' },
  { user: 'Sami R.', plan: 'Premium', status: 'Annulé', start: '01/04/2026', next: 'N/D', amount: 'N/D' },
];
const STATUS_TONE = { Actif: 'success', Impayé: 'danger', Annulé: 'warning' };

export default function SubscriptionsManagement() {
  return (
    <>
      <h1>Abonnements</h1>
      <KpiRow items={[{ label: 'MRR', value: '6 240 DT' }, { label: 'Abonnés actifs', value: '298' }, { label: 'Churn mensuel', value: '2,1%' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Répartition des plans</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer><PieChart><Pie data={DIST} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}><Cell fill="#E5E7EB" /><Cell fill="#7C3AED" /></Pie></PieChart></ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Churn</h3>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer><LineChart data={CHURN}><XAxis dataKey="name" fontSize={11} /><Line dataKey="value" stroke="#DC2626" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="row between"><h3>Abonnements</h3><button className="btn btn-ghost btn-sm">Exporter</button></div>
      <DataTable
        columns={[
          { key: 'user', label: 'Utilisateur' }, { key: 'plan', label: 'Plan' },
          { key: 'status', label: 'Statut', render: (r) => <span className={`pill ${STATUS_TONE[r.status]}`}>{r.status}</span> },
          { key: 'start', label: 'Début' }, { key: 'next', label: 'Prochaine facture' }, { key: 'amount', label: 'Montant' },
        ]}
        rows={SUBS}
      />
    </>
  );
}
