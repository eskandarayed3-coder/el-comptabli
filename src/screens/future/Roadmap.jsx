import { useNavigate } from 'react-router-dom';
import {
  Banknote, Receipt, FileSignature, Users, Package, ShoppingCart, LayoutGrid, Sparkles, Target, Search,
} from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

// One honest place for everything not built yet, instead of 15 separate
// buttons scattered in Finance that each looked broken (no real save,
// no real data) because they simply aren't implemented yet.
const ITEMS = [
  { to: '/future/bank', icon: Banknote, key: 'bank' },
  { to: '/future/bank-import', icon: Banknote, key: 'bankImport' },
  { to: '/future/einvoice', icon: Receipt, key: 'einvoice' },
  { to: '/future/signature', icon: FileSignature, key: 'signature' },
  { to: '/future/payroll', icon: Users, key: 'payroll' },
  { to: '/future/employees', icon: Users, key: 'employees' },
  { to: '/future/inventory', icon: Package, key: 'inventory' },
  { to: '/future/sales', icon: ShoppingCart, key: 'sales' },
  { to: '/future/purchases', icon: ShoppingCart, key: 'purchases' },
  { to: '/future/crm', icon: Users, key: 'crm' },
  { to: '/future/suppliers', icon: Package, key: 'suppliers' },
  { to: '/future/multi-company', icon: LayoutGrid, key: 'multi' },
  { to: '/future/forecast', icon: Sparkles, key: 'forecast' },
  { to: '/future/budget', icon: Target, key: 'budget' },
  { to: '/future/audit', icon: Search, key: 'audit' },
];

export default function Roadmap() {
  const navigate = useNavigate();
  const { t } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.roadmapTitle')} 🗺️`} />
      <p className="muted small">{t('future.roadmapIntro')}</p>

      <div className="col" style={{ gap: 8 }}>
        {ITEMS.map(({ to, icon: Icon, key }) => (
          <button key={to} className="list-row" style={{ width: '100%', textAlign: 'start', opacity: 0.85 }} onClick={() => navigate(to)}>
            <span className="icon-wrap teal"><Icon size={18} /></span>
            <span className="small grow" style={{ fontWeight: 600 }}>{t(`future.${key}`)}</span>
            <span className="pill teal">{t('common.soon')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
