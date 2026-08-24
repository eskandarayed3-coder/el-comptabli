import {
  Banknote, Receipt, FileSignature, Users, Package, ShoppingCart, LayoutGrid, Sparkles, Target, Search,
} from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

// One honest place for everything not built yet, instead of 15 separate
// buttons scattered in Finance that each looked broken (no real save,
// no real data) because they simply aren't implemented yet.
const ITEMS = [
  { icon: Banknote, key: 'bank' },
  { icon: Banknote, key: 'bankImport' },
  { icon: Receipt, key: 'einvoice' },
  { icon: FileSignature, key: 'signature' },
  { icon: Users, key: 'payroll' },
  { icon: Users, key: 'employees' },
  { icon: Package, key: 'inventory' },
  { icon: ShoppingCart, key: 'sales' },
  { icon: ShoppingCart, key: 'purchases' },
  { icon: Users, key: 'crm' },
  { icon: Package, key: 'suppliers' },
  { icon: LayoutGrid, key: 'multi' },
  { icon: Sparkles, key: 'forecast' },
  { icon: Target, key: 'budget' },
  { icon: Search, key: 'audit' },
];

export default function Roadmap() {
  const { t } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.roadmapTitle')} 🗺️`} />
      <p className="muted small">{t('future.roadmapIntro')}</p>

      <div className="col" style={{ gap: 8 }}>
        {ITEMS.map(({ icon: Icon, key }) => (
          <div key={key} className="list-row" style={{ width: '100%', textAlign: 'start', opacity: 0.85 }}>
            <span className="icon-wrap teal"><Icon size={18} /></span>
            <span className="small grow" style={{ fontWeight: 600 }}>{t(`future.${key}`)}</span>
            <span className="pill teal">{t('common.soon')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
