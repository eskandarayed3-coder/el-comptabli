import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Settings, MessageCircle, ScanLine, PlusCircle, X } from 'lucide-react';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate, daysUntil, todayISO } from '../../lib/format.js';
import HeroCard, { ProgressRing } from '../../components/HeroCard.jsx';
import StatCard from '../../components/StatCard.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import SuggestionChips from '../../components/SuggestionChips.jsx';
import AgentAvatar from '../../components/AgentAvatar.jsx';
import { AGENTS } from '../../lib/agents.js';

export default function Home() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t, lang } = useT();
  const showTour = !state.settings.tourDone;
  const dismissTour = () => patch('settings', { tourDone: true });
  const tourStep = (to) => { dismissTour(); navigate(to); };
  const TOUR = [
    { icon: MessageCircle, key: 'tourAsk', to: '/chat' },
    { icon: ScanLine, key: 'tourScan', to: '/scanner' },
    { icon: PlusCircle, key: 'tourTrack', to: '/income/add' },
  ];
  const ym = new Date().toISOString().slice(0, 7);
  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening';
  const totals = useMemo(() => monthTotals(state.transactions, ym), [state.transactions, ym]);

  const nextDeadline = state.deadlines
    .filter((d) => d.status !== 'paid')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const monthDeadlines = state.deadlines.filter((d) => d.date.startsWith(ym) && d.status !== 'paid').length;
  const aiUsed = state.settings.aiQuestionsUsed || 0;
  const todayTasks = state.tasks;
  const doneCount = todayTasks.filter((x) => x.done).length;

  return (
    <div className="screen stagger">
      <div className="row between">
        <div className="row" style={{ gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%', background: 'var(--tint-teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--teal-800)',
            }}
          >
            {(state.profile.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <h1>{t(`home.${greetKey}`, { name: state.profile.name })}</h1>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="icon-btn" onClick={() => navigate('/profile/settings')} title="Paramètres">
            <Settings size={18} />
          </button>
          <button className="icon-btn" onClick={() => navigate('/notifications')}>
            <Bell size={18} />
            {state.notifications.some((n) => !n.read) && <span className="dot" />}
          </button>
        </div>
      </div>

      {showTour && (
        <div className="card tint-teal" style={{ position: 'relative' }}>
          <button className="icon-btn" style={{ position: 'absolute', top: 8, insetInlineEnd: 8, width: 32, height: 32, background: 'transparent' }} onClick={dismissTour} title={t('common.later')}>
            <X size={16} />
          </button>
          <span className="small" style={{ fontWeight: 700 }}>{t('home.tourTitle')}</span>
          <div className="col" style={{ gap: 8, marginTop: 10 }}>
            {TOUR.map(({ icon: Icon, key, to }, i) => (
              <button key={key} className="row" style={{ gap: 10, width: '100%', textAlign: 'start' }} onClick={() => tourStep(to)}>
                <span className="icon-wrap teal" style={{ width: 34, height: 34, flexShrink: 0 }}>{i + 1}</span>
                <span className="small grow" style={{ fontWeight: 600 }}>{t(`home.${key}`)}</span>
                <ChevronRight size={16} color="var(--teal-700)" />
              </button>
            ))}
          </div>
        </div>
      )}

      <HeroCard>
        <div className="row between">
          <div className="col" style={{ gap: 10 }}>
            <span className="small" style={{ fontWeight: 600 }}>{t('home.heroTitle')}</span>
            {nextDeadline && (
              <span className="tiny">
                {t('home.nextDeadline', { what: `${nextDeadline.title[lang] || nextDeadline.title.fr} · ${fmtDate(nextDeadline.date, lang)}` })}
              </span>
            )}
            {!todayTasks.some((x) => x.status === 'late' && !x.done) && (
              <span className="tiny" style={{ opacity: 0.95 }}>{t('home.heroEncourage')}</span>
            )}
            <button className="btn btn-white btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/tax/calendar')}>
              {t('common.see')}
            </button>
          </div>
          <ProgressRing pct={80} />
        </div>
      </HeroCard>

      <div className="grid-3">
        <StatCard label={t('home.statDeadlines')} value={monthDeadlines} tone="amber" onClick={() => navigate('/tax/calendar')} />
        <StatCard label={t('home.statBalance')} value={fmtDT(totals.profit, { sign: true, decimals: 0 })} tone="teal" onClick={() => navigate('/finance')} />
        <StatCard label={t('home.statAI')} value={aiUsed} tone="indigo" onClick={() => navigate('/chat')} />
      </div>

      <div className="col" style={{ gap: 10 }}>
        <div className="row between">
          <h3>{t('home.todaySection')}</h3>
          <button className="small" style={{ color: 'var(--teal-700)' }} onClick={() => navigate('/today-tasks')}>{t('common.seeAll')}</button>
        </div>
        <div className="col" style={{ gap: 10 }}>
          {todayTasks.filter((x) => !x.done).slice(0, 2).map((task) => (
            <TintCard key={task.id} tone={task.status === 'late' ? 'coral' : 'amber'} onClick={() => navigate('/today-tasks')}>
              <div className="row between">
                <span className="small" style={{ fontWeight: 600 }}>{task.text[lang] || task.text.fr}</span>
                <StatusPill tone={task.status === 'late' ? 'danger' : 'warning'}>{task.status === 'late' ? t('common.late') : t('common.upcoming')}</StatusPill>
              </div>
            </TintCard>
          ))}
        </div>
      </div>

      <TintCard tone="indigo" onClick={() => navigate('/ai-recommendations')}>
        <div className="row" style={{ gap: 10 }}>
          <AgentAvatar agent={AGENTS[0]} size={28} />
          <span className="small" style={{ fontWeight: 600 }}>{t('home.aiInsight')}</span>
          <ChevronRight size={16} style={{ marginInlineStart: 'auto' }} />
        </div>
      </TintCard>

      <SuggestionChips items={t('home.chips')} onPick={() => navigate('/chat')} />
    </div>
  );
}
