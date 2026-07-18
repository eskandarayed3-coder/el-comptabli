import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

const EMPLOYEES = [
  { name: 'Sana M.', role: 'Assistante', brut: 1200, net: 942 },
  { name: 'Karim F.', role: 'Développeur', brut: 1800, net: 1380 },
];

export default function Payroll() {
  const { toast } = useStore();
  const { t } = useT();
  const masse = EMPLOYEES.reduce((s, e) => s + e.brut, 0);

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('future.payroll')} 👥</h1><span className="pill teal">{t('common.soon')}</span></div>
      <div className="col" style={{ gap: 10 }}>
        {EMPLOYEES.map((e) => (
          <div key={e.name} className="card row between">
            <span className="col"><span style={{ fontWeight: 600 }}>{e.name}</span><span className="tiny muted">{e.role}</span></span>
            <span className="col" style={{ alignItems: 'flex-end' }}><span className="num" style={{ fontWeight: 700 }}>{fmtDT(e.brut)}</span><span className="tiny muted num">net {fmtDT(e.net)}</span></span>
          </div>
        ))}
      </div>
      <div className="card tint-gray">
        <div className="col" style={{ gap: 6 }}>
          <div className="row between small"><span>Masse salariale</span><span className="num">{fmtDT(masse)}</span></div>
          <div className="row between small"><span>CNSS patronale</span><span className="num">{fmtDT(masse * 0.17, { decimals: 0 })}</span></div>
          <div className="row between small"><span>Retenues IRPP</span><span className="num">{fmtDT(187)}</span></div>
        </div>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => toast(t('common.saved'))}>Générer les fiches de paie</button>
      <p className="tiny center muted">Calculs CNSS/IRPP automatiques</p>
    </div>
  );
}
