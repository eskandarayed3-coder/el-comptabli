import { useMemo, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis } from 'recharts';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { CATEGORIES } from '../../lib/taxRules.js';
import FilterPills from '../../components/FilterPills.jsx';
import { postedCategoryTotals } from '../../../shared/accountingReporting.js';

export default function ExpenseCharts() {
  const { state } = useStore();
  const { t, lang } = useT();
  const [cat, setCat] = useState('all');

  const trend = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const ym = d.toISOString().slice(0, 7);
    const categories = postedCategoryTotals(state.generalLedger, ym, 6);
    const v = categories.filter((row) => cat === 'all' || row.id === cat).reduce((sum, row) => sum + row.value, 0);
    return { name: d.toLocaleDateString('fr-FR', { month: 'short' }), value: Math.round(v) };
  }), [state.generalLedger, cat]);

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('common.expenses')}</h1></div>
      <FilterPills options={[{ id: 'all', label: t('common.all') }, ...CATEGORIES.slice(0, 4).map((c) => ({ id: c.id, label: c[lang === 'ar' ? 'ar' : 'fr'] }))]} value={cat} onChange={setCat} />
      <div className="card">
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer><BarChart data={trend}><XAxis dataKey="name" fontSize={11} stroke="var(--text-2)" /><Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>
      {!trend.some((row) => row.value) && <p className="small muted center">Aucune charge comptabilisée pour cette période.</p>}
    </div>
  );
}
