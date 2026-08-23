import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Landmark, BookOpen, FileSpreadsheet, BarChart3,
  Calculator, CalendarClock, FolderOpen, Receipt, PieChart, Wallet,
  Users, Sparkles, Target, Search, Settings, ChevronRight,
  LayoutGrid, List,
} from 'lucide-react';
import { useStore, monthTotals } from '../lib/store.jsx';
import { useT } from '../i18n/index.js';
import { fmtDT } from '../lib/format.js';
import HeroCard from '../components/HeroCard.jsx';

function Section({ title, items, navigate, view }) {
  return (
    <section className="col" style={{ gap: 8 }}>
      <h2 style={{ font: 'var(--h3)' }}>{title}</h2>
      {view === 'grid' ? (
        <div className="grid-2">
          {items.map(({ to, icon: Icon, label }) => (
            <button
              type="button"
              key={to + label}
              className="card inner"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, textAlign: 'start' }}
              onClick={() => navigate(to)}
            >
              <span className="icon-wrap teal"><Icon size={18} aria-hidden="true" /></span>
              <span className="small" style={{ fontWeight: 600, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="col" style={{ gap: 6 }}>
          {items.map(({ to, icon: Icon, label }) => (
            <button type="button" key={to + label} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(to)}>
              <span className="icon-wrap teal"><Icon size={18} aria-hidden="true" /></span>
              <span className="small grow" style={{ fontWeight: 600 }}>{label}</span>
              <ChevronRight size={16} color="var(--text-2)" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// Forfaitaire is legally exempt from TVA and from full double-entry
// bookkeeping (per the app's own guides), so those items are just noise for
// that regime — shown to everyone else since real/unknown may need them.
const ESSENTIALS_BASE = [
  { to: '/income', icon: TrendingUp, key: 'eIncome' },
  { to: '/expenses', icon: TrendingDown, key: 'eExpense' },
  { to: '/income/invoice', icon: Receipt, key: 'eInvoice' },
  { to: '/tax', icon: Landmark, key: 'eTax' },
];
const ESSENTIALS_REEL_ONLY = [
  { to: '/tax/vat', icon: Calculator, key: 'eVat' },
  { to: '/tax/investment', icon: BarChart3, key: 'eInvest' },
];

export default function FinanceHub() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym, state.generalLedger), [state.transactions, state.generalLedger, ym]);
  const view = state.settings.financeView || 'list';
  const setView = (v) => patch('settings', { financeView: v });
  const showAll = state.settings.financeAll || false;
  const toggleAll = () => patch('settings', { financeAll: !showAll });
  const isForfait = state.profile.regime === 'forfaitaire';
  const ESSENTIALS = isForfait ? ESSENTIALS_BASE : [...ESSENTIALS_BASE, ...ESSENTIALS_REEL_ONLY];

  return (
    <div className="screen stagger">
      <div className="row between">
        <h1>{t('nav.finance')}</h1>
        <div className="row" style={{ gap: 8 }}>
          <div className="segmented" style={{ padding: 3, minHeight: 0 }} aria-label={t('common.view')}>
            <button type="button" className={view === 'list' ? 'active' : ''} aria-label={t('common.listView')} aria-pressed={view === 'list'} style={{ minHeight: 32, padding: '0 10px' }} onClick={() => setView('list')} title={t('common.listView')}>
              <List size={16} aria-hidden="true" />
            </button>
            <button type="button" className={view === 'grid' ? 'active' : ''} aria-label={t('common.gridView')} aria-pressed={view === 'grid'} style={{ minHeight: 32, padding: '0 10px' }} onClick={() => setView('grid')} title={t('common.gridView')}>
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
          </div>
          <button className="icon-btn" type="button" onClick={() => navigate('/profile/settings')} aria-label={t('profile.settings')} title={t('profile.settings')}><Settings size={18} aria-hidden="true" /></button>
          {import.meta.env.DEV && <button className="icon-btn" type="button" onClick={() => navigate('/screens')} aria-label={t('profile.allScreens')} title={t('profile.allScreens')}><Search size={18} aria-hidden="true" /></button>}
        </div>
      </div>

      <HeroCard className="summary">
        <span className="small" style={{ fontWeight: 700 }}>{t('money.thisMonth')}</span>
        <strong className="summary-value num">{fmtDT(totals.profit, { sign: true, decimals: 0 })}</strong>
        <span className="tiny">{t('common.balance')}</span>
        <div className="summary-grid">
          <button className="summary-metric" type="button" onClick={() => navigate('/income')}>
            <span>{t('common.incomes')}</span><strong className="num">{fmtDT(totals.income, { decimals: 0 })}</strong>
          </button>
          <button className="summary-metric" type="button" onClick={() => navigate('/expenses')}>
            <span>{t('common.expenses')}</span><strong className="num">{fmtDT(totals.expense, { decimals: 0 })}</strong>
          </button>
        </div>
      </HeroCard>

      {/* Essentiel — the 6 things most users need, each with a plain subtitle */}
      <section className="col" style={{ gap: 8 }} aria-labelledby="finance-essential-title">
        <div className="section-head"><h2 id="finance-essential-title">{t('finhub.essential')}</h2></div>
        <div className="grid-2">
          {ESSENTIALS.map(({ to, icon: Icon, key }) => (
            <button
              key={key}
              className="card inner"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, textAlign: 'start' }}
              type="button"
              onClick={() => navigate(to)}
            >
              <span className="icon-wrap teal"><Icon size={18} aria-hidden="true" /></span>
              <span className="small" style={{ fontWeight: 700 }}>{t(`finhub.${key}`)}</span>
              <span className="tiny muted">{t(`finhub.${key}Sub`)}</span>
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="btn btn-ghost btn-block" onClick={toggleAll}>
        {showAll ? t('finhub.hide') : t('finhub.advanced')}
      </button>

      {showAll && (
      <>
      <Section view={view} title={t('common.incomes') + ' & ' + t('common.expenses')} navigate={navigate} items={[
        { to: '/expenses/categories', icon: FolderOpen, label: t('money.categories') },
        { to: '/overview', icon: PieChart, label: t('home.overviewTitle') },
      ]} />

      <Section view={view} title={t('tax.dashTitle')} navigate={navigate} items={[
        { to: '/tax/irpp', icon: Calculator, label: t('tax.irppCalcTitle') },
        { to: '/tax/calendar', icon: CalendarClock, label: t('tax.calendarTitle') },
        { to: '/tax/estimate', icon: Receipt, label: t('tax.estimTitle') },
        { to: '/tax/cnss', icon: Landmark, label: t('cnss.title') },
        { to: '/tax/history', icon: FileSpreadsheet, label: t('tax.historyTitle') },
      ]} />

      {isForfait ? (
        <div className="card tint-amber">
          <span className="small" style={{ fontWeight: 700 }}>{t('finhub.forfaitNoteTitle')}</span>
          <p className="tiny muted" style={{ marginTop: 4 }}>{t('finhub.forfaitNoteBody')}</p>
        </div>
      ) : (
        <Section view={view} title={t('accounting.title')} navigate={navigate} items={[
          { to: '/accounting', icon: BookOpen, label: t('accounting.title') },
          { to: '/accounting/journal', icon: FileSpreadsheet, label: t('accounting.journal') },
          { to: '/accounting/trial-balance', icon: BarChart3, label: t('accounting.trial') },
          { to: '/accounting/ledger', icon: BookOpen, label: t('accounting.ledger') },
          { to: '/accounting/reports', icon: FileSpreadsheet, label: t('accounting.reports') },
        ]} />
      )}

      <Section view={view} title={t('reports.monthly') + ' & ' + t('analytics.performance')} navigate={navigate} items={[
        { to: '/reports/monthly', icon: FileSpreadsheet, label: t('reports.monthly') },
        { to: '/reports/annual', icon: FileSpreadsheet, label: t('reports.annual') },
        { to: '/reports/pnl', icon: BarChart3, label: t('reports.pnl') },
        { to: '/reports/cashflow', icon: Wallet, label: t('reports.cashflow') },
        { to: '/reports/balance-sheet', icon: BarChart3, label: t('reports.balanceSheet') },
        { to: '/reports/expense-analysis', icon: PieChart, label: t('reports.expenseAnalysis') },
        { to: '/analytics', icon: BarChart3, label: t('analytics.kpi') },
        { to: '/analytics/revenue', icon: TrendingUp, label: t('analytics.revenue') },
        { to: '/analytics/expenses', icon: TrendingDown, label: t('analytics.expenses') },
        { to: '/analytics/performance', icon: Target, label: t('analytics.performance') },
        { to: '/analytics/insights', icon: Sparkles, label: t('analytics.insights') },
      ]} />

      <Section view={view} title={t('docs.title')} navigate={navigate} items={[
        { to: '/documents', icon: FolderOpen, label: t('docs.title') },
        { to: '/documents/export', icon: FileSpreadsheet, label: t('docs.exportTitle') },
      ]} />

      <Section view={view} title={t('experts.find') + ' & ' + t('team.title')} navigate={navigate} items={[
        { to: '/experts', icon: Users, label: t('experts.find') },
        { to: '/team', icon: Users, label: t('team.title') },
      ]} />

      {/* One honest roadmap card instead of 15 dead-end buttons (Payroll,
          Inventory, CRM, Bank connection...) — none of those are wired to
          real functionality yet, so listing them separately just looked
          broken. This links to the single roadmap screen instead. */}
      <button type="button" className="card row between" style={{ width: '100%', textAlign: 'start', opacity: 0.85 }} onClick={() => navigate('/future/roadmap')}>
        <span className="col" style={{ gap: 2 }}>
          <span className="small" style={{ fontWeight: 700 }}>{t('future.roadmapTitle')}</span>
          <span className="tiny muted">{t('future.roadmapSub')}</span>
        </span>
        <ChevronRight size={16} color="var(--text-2)" aria-hidden="true" />
      </button>
      </>
      )}
    </div>
  );
}
