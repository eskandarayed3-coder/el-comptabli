import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import HeroCard from '../../components/HeroCard.jsx';

const BUDGETS = [
  { cat: 'Loyer', spent: 680, budget: 680 },
  { cat: 'Carburant', spent: 180, budget: 150 },
  { cat: 'Achats', spent: 590, budget: 800 },
];

export default function BudgetPlanning() {
  const { t } = useT();
  const total = { spent: 1960, budget: 2500 };
  const pct = Math.round((total.spent / total.budget) * 100);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.budget')} 🎯`} />
      <HeroCard>
        <div className="col" style={{ gap: 8 }}>
          <span className="small">Dépensé {fmtDT(total.spent, { decimals: 0 })} / {fmtDT(total.budget, { decimals: 0 })}</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </HeroCard>
      <div className="col" style={{ gap: 12 }}>
        {BUDGETS.map((b) => {
          const p = Math.round((b.spent / b.budget) * 100);
          const over = b.spent > b.budget;
          return (
            <div key={b.cat} className="col" style={{ gap: 4 }}>
              <div className="row between small"><span>{b.cat}</span><span className="num" style={{ color: over ? 'var(--pill-danger-fg)' : 'inherit' }}>{fmtDT(b.spent, { decimals: 0 })}/{fmtDT(b.budget, { decimals: 0 })} {over ? '⚠️' : p === 100 ? '✓' : ''}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, p)}%`, background: over ? 'var(--pill-danger-fg)' : undefined }} /></div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-ghost btn-block">+ Définir un budget</button>
      <div className="card tint-indigo"><span className="small">Ajuste ton budget carburant à 200 DT</span></div>
    </div>
  );
}
