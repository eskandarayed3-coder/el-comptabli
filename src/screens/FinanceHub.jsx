import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Landmark, BookOpen, FileSpreadsheet, BarChart3,
  Calculator, CalendarClock, FolderOpen, Receipt, PieChart, Wallet,
  Banknote, FileSignature, Package, ShoppingCart, Users, Sparkles, Target, Search, Settings, ChevronRight,
  LayoutGrid, List,
} from 'lucide-react';
import { useStore, monthTotals } from '../lib/store.jsx';
import { useT } from '../i18n/index.js';
import { fmtDT } from '../lib/format.js';
import StatCard from '../components/StatCard.jsx';

function Section({ title, items, navigate, view }) {
  return (
    <div className="col" style={{ gap: 8 }}>
      <h3>{title}</h3>
      {view === 'grid' ? (
        <div className="grid-2">
          {items.map(({ to, icon: Icon, label }) => (
            <button
              key={to + label}
              className="card inner"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, textAlign: 'start' }}
              onClick={() => navigate(to)}
            >
              <span className="icon-wrap teal"><Icon size={18} /></span>
              <span className="small" style={{ fontWeight: 600, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="col" style={{ gap: 6 }}>
          {items.map(({ to, icon: Icon, label }) => (
            <button key={to + label} className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate(to)}>
              <span className="icon-wrap teal"><Icon size={18} /></span>
              <span className="small grow" style={{ fontWeight: 600 }}>{label}</span>
              <ChevronRight size={16} color="var(--text-2)" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const ESSENTIALS = [
  { to: '/income', icon: TrendingUp, key: 'eIncome' },
  { to: '/expenses', icon: TrendingDown, key: 'eExpense' },
  { to: '/income/invoice', icon: Receipt, key: 'eInvoice' },
  { to: '/tax/vat', icon: Calculator, key: 'eVat' },
  { to: '/tax/investment', icon: BarChart3, key: 'eInvest' },
  { to: '/tax', icon: Landmark, key: 'eTax' },
];

export default function FinanceHub() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const ym = new Date().toISOString().slice(0, 7);
  const totals = useMemo(() => monthTotals(state.transactions, ym), [state.transactions, ym]);
  const view = state.settings.financeView || 'list';
  const setView = (v) => patch('settings', { financeView: v });
  const showAll = state.settings.financeAll || false;
  const toggleAll = () => patch('settings', { financeAll: !showAll });

  return (
    <div className="screen stagger">
      <div className="row between">
        <h1>{t('nav.finance')}</h1>
        <div className="row" style={{ gap: 8 }}>
          <div className="segmented" style={{ padding: 3, minHeight: 0 }}>
            <button className={view === 'list' ? 'active' : ''} style={{ minHeight: 32, padding: '0 10px' }} onClick={() => setView('list')} title={t('common.listView')}>
              <List size={16} />
            </button>
            <button className={view === 'grid' ? 'active' : ''} style={{ minHeight: 32, padding: '0 10px' }} onClick={() => setView('grid')} title={t('common.gridView')}>
              <LayoutGrid size={16} />
            </button>
          </div>
          <button className="icon-btn" onClick={() => navigate('/profile/settings')} title="Paramètres"><Settings size={18} /></button>
          <button className="icon-btn" onClick={() => navigate('/screens')} title="Tous les écrans"><Search size={18} /></button>
        </div>
      </div>

      <div className="grid-3">
        <StatCard label={t('common.incomes')} value={fmtDT(totals.income, { decimals: 0 })} tone="teal" onClick={() => navigate('/income')} />
        <StatCard label={t('common.expenses')} value={fmtDT(totals.expense, { decimals: 0 })} tone="coral" onClick={() => navigate('/expenses')} />
        <StatCard label={t('common.profit')} value={fmtDT(totals.profit, { sign: true, decimals: 0 })} tone="indigo" onClick={() => navigate('/overview')} />
      </div>

      {/* Essentiel — the 6 things most users need, each with a plain subtitle */}
      <div className="col" style={{ gap: 8 }}>
        <h3>{t('finhub.essential')}</h3>
        <div className="grid-2">
          {ESSENTIALS.map(({ to, icon: Icon, key }) => (
            <button
              key={key}
              className="card inner"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, textAlign: 'start' }}
              onClick={() => navigate(to)}
            >
              <span className="icon-wrap teal"><Icon size={18} /></span>
              <span className="small" style={{ fontWeight: 700 }}>{t(`finhub.${key}`)}</span>
              <span className="tiny muted">{t(`finhub.${key}Sub`)}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-ghost btn-block" onClick={toggleAll}>
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

      <Section view={view} title={t('accounting.title')} navigate={navigate} items={[
        { to: '/accounting', icon: BookOpen, label: t('accounting.title') },
        { to: '/accounting/journal', icon: FileSpreadsheet, label: t('accounting.journal') },
        { to: '/accounting/trial-balance', icon: BarChart3, label: t('accounting.trial') },
        { to: '/accounting/ledger', icon: BookOpen, label: t('accounting.ledger') },
        { to: '/accounting/reports', icon: FileSpreadsheet, label: t('accounting.reports') },
      ]} />

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

      <Section view={view} title={t('future.teaser')} navigate={navigate} items={[
        { to: '/future/bank', icon: Banknote, label: t('future.bank') },
        { to: '/future/bank-import', icon: Banknote, label: t('future.bankImport') },
        { to: '/future/einvoice', icon: Receipt, label: t('future.einvoice') },
        { to: '/future/signature', icon: FileSignature, label: t('future.signature') },
        { to: '/future/payroll', icon: Users, label: t('future.payroll') },
        { to: '/future/employees', icon: Users, label: t('future.employees') },
        { to: '/future/inventory', icon: Package, label: t('future.inventory') },
        { to: '/future/sales', icon: ShoppingCart, label: t('future.sales') },
        { to: '/future/purchases', icon: ShoppingCart, label: t('future.purchases') },
        { to: '/future/crm', icon: Users, label: t('future.crm') },
        { to: '/future/suppliers', icon: Package, label: t('future.suppliers') },
        { to: '/future/multi-company', icon: LayoutGrid, label: t('future.multi') },
        { to: '/future/forecast', icon: Sparkles, label: t('future.forecast') },
        { to: '/future/budget', icon: Target, label: t('future.budget') },
        { to: '/future/audit', icon: Search, label: t('future.audit') },
        { to: '/experts', icon: Users, label: t('experts.find') },
        { to: '/team', icon: Users, label: t('team.title') },
      ]} />
      </>
      )}
    </div>
  );
}
