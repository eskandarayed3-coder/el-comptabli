import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const EMPLOYEES = [
  { name: 'Sana M.', role: 'Assistante', contract: 'CDI', salary: 1200, seniority: '2 ans' },
  { name: 'Karim F.', role: 'Développeur', contract: 'CDD', salary: 1800, seniority: '8 mois' },
];

export default function EmployeeManagement() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={t('future.employees')} />
      <div className="col" style={{ gap: 10 }}>
        {EMPLOYEES.map((e) => (
          <div key={e.name} className="card row between">
            <span className="row" style={{ gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{e.name[0]}</span>
              <span className="col"><span style={{ fontWeight: 600 }}>{e.name}</span><span className="tiny muted">{e.role} · {e.seniority}</span></span>
            </span>
            <span className="pill teal">{e.contract}</span>
          </div>
        ))}
        <button className="card" style={{ border: '2px dashed var(--hairline)', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)' }}>
          <Plus size={18} /> Ajouter un employé
        </button>
      </div>
    </div>
  );
}
