import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Settings, MessageCircle, ScanLine, PlusCircle, X, TrendingDown, TrendingUp, FileScan } from 'lucide-react';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import { fmtDT, fmtDate } from '../../lib/format.js';
import HeroCard, { ProgressRing } from '../../components/HeroCard.jsx';
import StatCard from '../../components/StatCard.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import SuggestionChips from '../../components/SuggestionChips.jsx';
import AgentAvatar from '../../components/AgentAvatar.jsx';
import AiQuickAsk from '../../components/AiQuickAsk.jsx';
import { AGENTS } from '../../lib/agents.js';
import { getDisplayIdentity } from '../../../shared/displayIdentity.js';

export default function Home() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t, lang } = useT();
  const { guest, user } = useAuth();
  const identity = getDisplayIdentity(user, state.profile, lang);
  const trialActive = Boolean(user?.isAnonymous);
  const showTour = !state.settings.tourDone;
  const dismissTour = () => patch('settings', { tourDone: true });
  const tourStep = (to) => { dismissTour(); navigate(to); };
  const TOUR = guest
    ? [{ icon: PlusCircle, key: 'tourTrack', to: '/income/add' }]
    : [
      { icon: MessageCircle, key: 'tourAsk', to: '/chat' },
      { icon: ScanLine, key: 'tourScan', to: '/scanner' },
      { icon: PlusCircle, key: 'tourTrack', to: '/income/add' },
    ];
  const ym = new Date().toISOString().slice(0, 7);
  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening';
  // The greeting strings are "Hi, {name} 👋" — clean up the stray comma when
  // there's no name yet (e.g. right after a data reset, before onboarding).
  // The trial status is already explained by the card below. Repeating its
  // long localized label in the hero makes the mobile/RTL header unreadable.
  const greetingName = trialActive ? '' : identity.displayName;
  const greeting = greetingName
    ? t(`home.${greetKey}`, { name: greetingName })
    : t(`home.${greetKey}`, { name: '' }).replace(/[,،]/g, '').replace(/\s{2,}/g, ' ').trim();
  const totals = useMemo(() => monthTotals(state.transactions, ym, state.generalLedger), [state.transactions, state.generalLedger, ym]);

  const nextDeadline = state.deadlines
    .filter((d) => d.status !== 'paid')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const monthDeadlines = state.deadlines.filter((d) => d.date.startsWith(ym) && d.status !== 'paid').length;
  const aiUsed = state.settings.aiQuestionsUsed || 0;
  const todayTasks = state.tasks;
  const openTasks = todayTasks.filter((task) => !task.done);
  const doneCount = todayTasks.filter((x) => x.done).length;
  const healthPct = todayTasks.length ? Math.round((doneCount / todayTasks.length) * 100) : 0;
  const quickActions = [
    { icon: TrendingUp, label: t('money.addIncome'), detail: t('home.actionIncome'), to: '/income/add' },
    { icon: TrendingDown, label: t('money.addExpense'), detail: t('home.actionExpense'), to: '/expenses/add' },
    { icon: FileScan, label: t('home.actionScan'), detail: t('home.actionScanDetail'), to: guest ? '/login?next=/scanner' : '/scanner' },
  ];

  return (
    <div className="screen stagger">
      <header className="home-header">
        <div className="home-identity">
          <div className="avatar" aria-hidden="true">
            {identity.initials}
          </div>
          <h1 className="home-greeting">{greeting}</h1>
        </div>
        <div className="home-tools">
          <button className="icon-btn" type="button" onClick={() => navigate('/profile/settings')} aria-label={t('profile.settings')} title={t('profile.settings')}>
            <Settings size={18} aria-hidden="true" />
          </button>
          <button className="icon-btn" type="button" onClick={() => navigate('/notifications')} aria-label={t('notif.title')}>
            <Bell size={18} aria-hidden="true" />
            {state.notifications.some((n) => !n.read) && <span className="dot" />}
          </button>
        </div>
      </header>

      {guest && (
        <div className="card tint-amber col" style={{ gap: 8 }}>
          <span className="small" style={{ fontWeight: 700 }}>{t('guest.title')}</span>
          <span className="tiny muted">{t('guest.body')}</span>
          <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/login?next=/home')}>
            {t('guest.createAccount')}
          </button>
        </div>
      )}

      {trialActive && (
        <div className="card tint-teal col" style={{ gap: 6 }}>
          <span className="small" style={{ fontWeight: 700 }}>{t('trial.title')}</span>
          <span className="tiny muted">{t('trial.body')}</span>
        </div>
      )}

      {showTour && (
        <div className="card tint-teal" style={{ position: 'relative' }}>
          <button className="icon-btn" type="button" style={{ position: 'absolute', top: 8, insetInlineEnd: 8, width: 32, height: 32, background: 'transparent' }} onClick={dismissTour} aria-label={t('common.close')} title={t('common.later')}>
            <X size={16} aria-hidden="true" />
          </button>
          <span className="small" style={{ fontWeight: 700 }}>{t('home.tourTitle')}</span>
          <div className="col" style={{ gap: 8, marginTop: 10 }}>
            {TOUR.map(({ key, to }, i) => (
              <button type="button" key={key} className="row" style={{ gap: 10, width: '100%', textAlign: 'start' }} onClick={() => tourStep(to)}>
                <span className="icon-wrap teal" style={{ width: 34, height: 34, flexShrink: 0 }}>{i + 1}</span>
                <span className="small grow" style={{ fontWeight: 600 }}>{t(`home.${key}`)}</span>
                <ChevronRight size={16} color="var(--teal-700)" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      <HeroCard className="summary">
        <div className="row between">
          <div className="col" style={{ gap: 10 }}>
            <span className="small" style={{ fontWeight: 700 }}>{t('home.heroTitle')}</span>
            {nextDeadline && (
              <span className="tiny">
                {t('home.nextDeadline', { what: `${nextDeadline.title[lang] || nextDeadline.title.fr} · ${fmtDate(nextDeadline.date, lang)}` })}
              </span>
            )}
            {!nextDeadline && <span className="tiny">{t('home.noDeadline')}</span>}
            <button className="btn btn-white btn-sm" type="button" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/tax/calendar')}>
              {t('home.calendarAction')}
            </button>
          </div>
          <ProgressRing pct={healthPct} />
        </div>
        <div className="summary-grid" aria-label={t('home.monthSummary')}>
          <div className="summary-metric"><span>{t('common.incomes')}</span><strong className="num">{fmtDT(totals.income, { decimals: 0 })}</strong></div>
          <div className="summary-metric"><span>{t('common.expenses')}</span><strong className="num">{fmtDT(totals.expense, { decimals: 0 })}</strong></div>
        </div>
      </HeroCard>

      <AiQuickAsk guest={guest} />

      <div className="grid-3">
        <StatCard label={t('home.statDeadlines')} value={monthDeadlines} tone="amber" onClick={() => navigate('/tax/calendar')} />
        <StatCard label={t('home.statBalance')} value={fmtDT(totals.profit, { sign: true, decimals: 0 })} tone="teal" onClick={() => navigate('/finance')} />
        <StatCard label={t('home.statAI')} value={aiUsed} tone="indigo" onClick={() => navigate('/chat')} />
      </div>

      <section className="col" style={{ gap: 10 }} aria-labelledby="quick-actions-title">
        <div className="section-head">
          <h2 id="quick-actions-title">{t('home.quickActions')}</h2>
        </div>
        <div className="action-grid">
          {quickActions.map(({ icon: Icon, label, detail, to }) => (
            <button key={to} className="action-card" type="button" onClick={() => navigate(to)}>
              <span className="icon-wrap teal"><Icon size={20} aria-hidden="true" /></span>
              <strong className="small">{label}</strong>
              <span>{detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="col" style={{ gap: 10 }} aria-labelledby="today-title">
        <div className="section-head">
          <h2 id="today-title">{t('home.todaySection')}</h2>
          <button className="section-link" type="button" onClick={() => navigate('/today-tasks')}>{t('common.seeAll')}</button>
        </div>
        <div className="col" style={{ gap: 10 }}>
          {openTasks.length ? openTasks.slice(0, 2).map((task) => (
            <TintCard key={task.id} tone={task.status === 'late' ? 'coral' : 'amber'} onClick={() => navigate('/today-tasks')} ariaLabel={task.text[lang] || task.text.fr}>
              <div className="row between">
                <span className="small" style={{ fontWeight: 600 }}>{task.text[lang] || task.text.fr}</span>
                <StatusPill tone={task.status === 'late' ? 'danger' : 'warning'}>{task.status === 'late' ? t('common.late') : t('common.upcoming')}</StatusPill>
              </div>
            </TintCard>
          )) : (
            <TintCard tone="teal" onClick={() => navigate('/income/add')} ariaLabel={t('home.noTasksTitle')}>
              <div className="col" style={{ gap: 4 }}>
                <span className="small" style={{ fontWeight: 700 }}>{t('home.noTasksTitle')}</span>
                <span className="tiny muted">{t('home.noTasksBody')}</span>
              </div>
            </TintCard>
          )}
        </div>
      </section>

      <TintCard tone="indigo" onClick={() => navigate(guest ? '/login?next=/chat' : (state.transactions.length ? '/ai-recommendations' : '/expenses/add'))} ariaLabel={state.transactions.length ? t('home.aiInsight') : t('home.aiInsightEmpty')}>
        <div className="row" style={{ gap: 10 }}>
          <AgentAvatar agent={AGENTS[0]} size={28} />
          <span className="small" style={{ fontWeight: 600 }}>{state.transactions.length ? t('home.aiInsight') : t('home.aiInsightEmpty')}</span>
          <ChevronRight size={16} style={{ marginInlineStart: 'auto' }} aria-hidden="true" />
        </div>
      </TintCard>

      <SuggestionChips items={t('home.chips')} onPick={() => navigate(guest ? '/login?next=/chat' : '/chat')} />
    </div>
  );
}
