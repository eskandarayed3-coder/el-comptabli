import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import { useStore } from '../../lib/store.jsx';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import TintCard from '../../components/TintCard.jsx';

function ym(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

export default function AiRecommendations() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { state } = useStore();

  // Every recommendation below is conditional on something real in the
  // user's own data — no fixed example text. If nothing qualifies, the
  // empty state shows instead of a generic filler recommendation.
  const recos = useMemo(() => {
    const out = [];
    const thisMonth = ym(0);
    const lastMonth = ym(-1);
    const expense = state.transactions.filter((tx) => tx.kind === 'expense');

    const byCategoryThisMonth = {};
    const byCategoryLastMonth = {};
    for (const tx of expense) {
      const bucket = (tx.date || '').startsWith(thisMonth) ? byCategoryThisMonth : (tx.date || '').startsWith(lastMonth) ? byCategoryLastMonth : null;
      if (!bucket) continue;
      const amt = tx.amountTTC ?? tx.amount ?? 0;
      bucket[tx.category] = (bucket[tx.category] || 0) + amt;
    }
    for (const [cat, amt] of Object.entries(byCategoryThisMonth)) {
      const prev = byCategoryLastMonth[cat];
      if (prev && amt > prev * 1.15) {
        const pct = Math.round(((amt - prev) / prev) * 100);
        out.push({
          text: { fr: `Tes dépenses "${cat}" ont augmenté de ${pct} % ce mois, voir le détail`, ar: `مصاريف "${cat}" زادت ${pct}% هالشهر، شوف التفاصيل` },
          action: () => navigate('/expenses'),
        });
      }
    }

    const tvaDeductible = expense.filter((tx) => (tx.date || '').startsWith(thisMonth)).reduce((s, tx) => s + (tx.tva ?? 0), 0);
    if (tvaDeductible > 0) {
      out.push({
        text: { fr: `Tu as ${fmtDT(tvaDeductible, { decimals: 0 })} de TVA déductible ce mois, comment la reporter ?`, ar: `عندك ${fmtDT(tvaDeductible, { decimals: 0 })} TVA قابلة للخصم هالشهر، كيفاش نرجعها؟` },
        action: () => navigate('/chat?q=' + encodeURIComponent('Comment reporter ma TVA déductible ?')),
      });
    }

    const nextDeadline = state.deadlines
      .filter((d) => d.status !== 'paid')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (nextDeadline) {
      const daysLeft = Math.ceil((new Date(nextDeadline.date) - new Date()) / 86400000);
      if (daysLeft <= 14) {
        out.push({
          text: { fr: `${nextDeadline.title.fr} dans ${Math.max(0, daysLeft)}j, estimer le montant`, ar: `${nextDeadline.title.ar} في ${Math.max(0, daysLeft)} يوم، قدّر المبلغ` },
          action: () => navigate('/tax/calendar'),
        });
      }
    }

    const unscanned = state.transactions.filter((tx) => tx.kind === 'expense' && !tx.scanned && (tx.date || '').startsWith(thisMonth));
    if (unscanned.length >= 2) {
      out.push({
        text: { fr: `${unscanned.length} dépenses sans facture scannée ce mois, ajouter les preuves`, ar: `${unscanned.length} مصاريف بلا فاتورة مسكانة هالشهر، زيد الوثائق` },
        action: () => navigate('/scanner'),
      });
    }

    return out;
  }, [state.transactions, state.deadlines, navigate]);

  return (
    <div className="screen stagger">
      <TopBar title={t('home.recoTitle')} />
      {recos.length > 0 ? (
        <div className="col" style={{ gap: 12 }}>
          {recos.map((r, i) => (
            <TintCard key={i} tone="indigo" onClick={r.action}>
              <div className="col" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Sparkles size={16} color="#4F46E5" />
                  <span className="small" style={{ fontWeight: 600 }}>{r.text[lang] || r.text.fr}</span>
                </div>
                <span className="tiny muted">{t('home.recoBased')}</span>
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
