import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FAB from '../../components/FAB.jsx';

const SUPPLIERS = [
  { name: 'STEG', total: 846, invoices: 6, tva: 160 },
  { name: 'Station Agil', total: 512, invoices: 5, tva: 97 },
  { name: 'Orange', total: 390, invoices: 6, tva: 74 },
];

export default function SupplierManagement() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.suppliers')} 🚚`} />
      <div className="card tint-amber"><span className="small">890 DT d’impayés fournisseurs</span></div>
      <div className="col" style={{ gap: 8 }}>
        {SUPPLIERS.map((s) => (
          <div key={s.name} className="list-row">
            <span className="icon-wrap coral">🚚</span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{s.name}</span><span className="tiny muted">{s.invoices} factures · TVA récupérée {fmtDT(s.tva)}</span></span>
            <span className="num" style={{ fontWeight: 700 }}>{fmtDT(s.total)}</span>
          </div>
        ))}
      </div>
      <FAB icon={Plus} label="Fournisseur" onClick={() => {}} />
    </div>
  );
}
