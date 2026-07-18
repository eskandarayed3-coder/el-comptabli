import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { CATEGORIES } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

export default function Categories() {
  const { state } = useStore();
  const { t, lang } = useT();
  const ym = new Date().toISOString().slice(0, 7);

  const totals = useMemo(() => {
    const map = {};
    state.transactions.filter((tx) => tx.date.startsWith(ym)).forEach((tx) => {
      const sign = tx.kind === 'income' ? 1 : -1;
      map[tx.category] = (map[tx.category] || 0) + sign * Number(tx.amountTTC);
    });
    return map;
  }, [state.transactions, ym]);

  return (
    <div className="screen stagger">
      <TopBar title={t('money.categories')} />
      <div className="grid-2">
        {CATEGORIES.map((c) => {
          const Icon = Icons[c.icon] || Icons.Circle;
          const total = totals[c.id];
          return (
            <div key={c.id} className="card inner" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="icon-wrap teal"><Icon size={18} /></span>
              <span className="small" style={{ fontWeight: 600 }}>{c[lang === 'ar' ? 'ar' : 'fr']}</span>
              <span className="num small" style={{ color: total > 0 ? 'var(--pill-success-fg)' : total < 0 ? 'var(--pill-danger-fg)' : 'var(--text-2)' }}>
                {total ? fmtDT(total, { sign: true, decimals: 0 }) : fmtDT(0, { decimals: 0 })}
              </span>
            </div>
          );
        })}
        <button className="card inner" style={{ border: '2px dashed var(--hairline)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-2)' }}>
          <Plus size={20} />
          <span className="tiny">Nouvelle catégorie</span>
        </button>
      </div>
      <p className="tiny center muted">Maintiens pour modifier</p>
    </div>
  );
}
