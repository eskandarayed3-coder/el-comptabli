import { useMemo } from 'react';
import { useT } from '../../i18n/index.js';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { ProgressRing } from '../../components/HeroCard.jsx';

function ym(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

export default function BusinessPerformance() {
  const { t } = useT();
  const { state } = useStore();

  const { scores, hasData } = useMemo(() => {
    const thisMonth = monthTotals(state.transactions, ym(0));
    const lastMonth = monthTotals(state.transactions, ym(-1));
    const rentabilite = thisMonth.income ? Math.max(0, Math.min(100, Math.round((thisMonth.profit / thisMonth.income) * 100))) : 0;
    const croissance = lastMonth.income ? Math.max(0, Math.min(100, Math.round(50 + ((thisMonth.income - lastMonth.income) / lastMonth.income) * 100))) : 50;
    const paidDeadlines = state.deadlines.filter((d) => d.status === 'paid').length;
    const regularite = state.deadlines.length ? Math.round((paidDeadlines / state.deadlines.length) * 100) : 100;
    const vals = [rentabilite, croissance, regularite];
    return {
      scores: [
        ['Rentabilité (marge)', rentabilite],
        ['Croissance vs mois dernier', croissance],
        ['Régularité fiscale', regularite],
      ],
      hasData: state.transactions.length > 0,
      avg: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
    };
  }, [state.transactions, state.deadlines]);

  const avg = Math.round(scores.reduce((s, [, v]) => s + v, 0) / scores.length);

  return (
    <div className="screen stagger">
      {!hasData ? (
        <p className="small muted center">{t('money.noTx')}</p>
      ) : (
        <>
          <div className="hero-card center" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <span className="small" style={{ fontWeight: 700 }}>Santé financière</span>
            <ProgressRing pct={avg} size={100} />
            <span style={{ fontSize: 22, fontWeight: 700 }} className="num">{avg}/100</span>
          </div>
          <div className="col" style={{ gap: 12 }}>
            {scores.map(([label, v]) => (
              <div key={label} className="col" style={{ gap: 4 }}>
                <div className="row between small"><span>{label}</span><span className="num">{v}</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
          <p className="tiny center muted">Calculé à partir de tes transactions et échéances réelles.</p>
        </>
      )}
    </div>
  );
}
