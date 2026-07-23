import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { fmtDT } from '../../lib/format.js';
import TintCard from '../../components/TintCard.jsx';

function ym(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

export default function AiInsights() {
  const navigate = useNavigate();
  const { t } = useT();
  const { state } = useStore();

  const insights = useMemo(() => {
    const out = [];
    const thisMonth = monthTotals(state.transactions, ym(0));
    const lastMonth = monthTotals(state.transactions, ym(-1));

    const unscanned = state.transactions.filter((tx) => tx.kind === 'expense' && !tx.scanned && (tx.date || '').startsWith(ym(0)));
    if (unscanned.length > 0) {
      out.push({ icon: '💰', text: `${unscanned.length} dépense${unscanned.length > 1 ? 's' : ''} sans facture scannée ce mois — la TVA déductible pourrait ne pas être captée`, action: 'Scanner', to: '/scanner' });
    }

    if (thisMonth.income && lastMonth.income) {
      const margeNow = (thisMonth.profit / thisMonth.income) * 100;
      const margeAvant = (lastMonth.profit / lastMonth.income) * 100;
      const diff = Math.round(margeNow - margeAvant);
      if (diff < -2) {
        out.push({ icon: '📉', text: `Marge en baisse de ${Math.abs(diff)}pts vs le mois dernier`, action: 'Voir pourquoi', to: '/analytics/expenses' });
      } else if (diff > 2) {
        out.push({ icon: '📈', text: `Marge en hausse de ${diff}pts vs le mois dernier`, action: 'Détail', to: '/analytics/revenue' });
      }
    }

    const nextTva = state.deadlines.filter((d) => d.kind === 'tva' && d.status !== 'paid' && d.amount).sort((a, b) => a.date.localeCompare(b.date))[0];
    if (nextTva) {
      const projected = thisMonth.profit - nextTva.amount;
      out.push({ icon: '📅', text: `Solde projeté après TVA du ${nextTva.date.slice(-2)} : ${fmtDT(projected, { decimals: 0 })}`, action: 'Voir la tréso', to: '/tax/calendar' });
    }

    return out;
  }, [state.transactions, state.deadlines]);

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('analytics.insights')} ✨</h1>
        <span className="pill premium">{t('common.premium')}</span>
      </div>
      {insights.length > 0 ? (
        <div className="col" style={{ gap: 12 }}>
          {insights.map((it, i) => (
            <TintCard key={i} tone="indigo" onClick={() => navigate(it.to)}>
              <div className="row between">
                <span className="small">{it.icon} {it.text}</span>
                <span className="pill white">{it.action}</span>
              </div>
            </TintCard>
          ))}
        </div>
      ) : (
        <p className="small muted center">{t('money.noTx')}</p>
      )}
    </div>
  );
}
