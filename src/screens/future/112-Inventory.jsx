import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FAB from '../../components/FAB.jsx';

const PRODUCTS = [
  { name: 'T-shirt logo', sku: 'TS-001', stock: 'ok', buy: 8, sell: 22 },
  { name: 'Mug personnalisé', sku: 'MG-014', stock: 'low', buy: 4, sell: 15 },
  { name: 'Sticker pack', sku: 'ST-090', stock: 'out', buy: 1, sell: 5 },
];
const DOT = { ok: 'var(--pill-success-fg)', low: 'var(--pill-warning-fg)', out: 'var(--pill-danger-fg)' };

export default function Inventory() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.inventory')} 📦`} />
      <div className="card tint-coral"><span className="small">3 produits sous le seuil</span></div>
      <div className="col" style={{ gap: 8 }}>
        {PRODUCTS.map((p) => (
          <div key={p.sku} className="list-row">
            <span className="icon-wrap teal">📦</span>
            <span className="col grow"><span className="small" style={{ fontWeight: 600 }}>{p.name}</span><span className="tiny muted num">{p.sku}</span></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: DOT[p.stock] }} />
            <span className="tiny muted num">{fmtDT(p.buy)} / {fmtDT(p.sell)}</span>
          </div>
        ))}
      </div>
      <div className="card tint-gray"><span className="small">Valeur du stock : <b className="num">8 420 DT</b></span></div>
      <FAB icon={Plus} label="Produit" onClick={() => {}} />
    </div>
  );
}
