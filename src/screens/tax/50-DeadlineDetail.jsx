import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate, daysUntil } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import HeroCard from '../../components/HeroCard.jsx';

export default function DeadlineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, update, toast } = useStore();
  const { t, lang } = useT();
  const d = state.deadlines.find((x) => x.id === id) || state.deadlines[0];
  if (!d) return null;
  const days = daysUntil(d.date);

  const markPaid = () => { update('deadlines', d.id, { status: 'paid' }); toast(t('tax.markPaid')); navigate('/tax/calendar'); };

  return (
    <div className="screen stagger">
      <TopBar title={t('tax.calendarTitle')} />
      <HeroCard tone="amber">
        <span className="small" style={{ fontWeight: 700 }}>{d.title[lang] || d.title.fr}</span>
        <div className="num" style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{fmtDate(d.date, lang, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        {days >= 0 && <span className="pill white" style={{ marginTop: 8 }}>{t('tax.countdown', { n: days })}</span>}
      </HeroCard>

      <div className="card">
        <p className="small">{d.note[lang] || d.note.fr}</p>
      </div>

      <div className="card inner" style={{ background: 'var(--bg-2)' }}>
        <h3 style={{ marginBottom: 10 }}>{t('tax.checklist')}</h3>
        <div className="col" style={{ gap: 8 }}>
          {['Factures de vente saisies ✓', 'Factures d’achat scannées, 3 manquantes', `Montant calculé ✓ ${fmtDT(d.amount || 0)}`].map((c, i) => (
            <span key={i} className="small">{c}</span>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-primary grow" onClick={markPaid}>{t('tax.markPaid')}</button>
        <button className="btn btn-ghost grow" onClick={() => navigate('/chat?q=' + encodeURIComponent(d.title.fr))}>{t('knowledge.askAI')}</button>
      </div>
    </div>
  );
}
