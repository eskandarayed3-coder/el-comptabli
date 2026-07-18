import { lazy } from 'react';

// Vite can only statically analyze dynamic import() one path segment deep,
// so subfoldered screens need import.meta.glob instead of a templated import().
const modules = import.meta.glob('./screens/**/*.jsx');

// After a dev-server restart or redeploy, old code-split chunk URLs 404, which
// would blank the screen. Reload the page once (guarded to avoid a loop) so the
// device fetches the fresh chunks — fixes "screen missing" from a stale cache.
function importWithReload(loader) {
  return () => loader().catch((err) => {
    const key = 'chunk-reload-once';
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      window.location.reload();
      return new Promise(() => {}); // hold render while reloading
    }
    throw err;
  });
}

const L = (path) => {
  const key = `./screens/${path}.jsx`;
  if (!modules[key]) throw new Error(`Screen not found: ${key}`);
  return lazy(importWithReload(modules[key]));
};

// Manifest = single source of truth for routing AND the /screens dev index.
// `label` / `module` power the dev index; `mvp` marks the 🎯 screens from the prompts doc.
export const manifest = [
  // ---- Module 1 — Onboarding ----
  { path: '/splash', Component: L('onboarding/01-Splash'), label: '1. Splash', module: 'Onboarding', mvp: true },
  { path: '/welcome', Component: L('onboarding/02-Welcome'), label: '2. Welcome', module: 'Onboarding', mvp: true },
  { path: '/language', Component: L('onboarding/03-ChooseLanguage'), label: '3. Choose Language', module: 'Onboarding', mvp: true },
  { path: '/user-type', Component: L('onboarding/04-UserType'), label: '4. Select User Type', module: 'Onboarding', mvp: true },
  { path: '/business-info', Component: L('onboarding/05-BusinessInfo'), label: '5. Business Information', module: 'Onboarding', mvp: true },
  { path: '/tax-regime', Component: L('onboarding/06-TaxRegime'), label: '6. Tax Regime Selection', module: 'Onboarding', mvp: true },
  { path: '/ai-intro', Component: L('onboarding/07-AiIntro'), label: '7. AI Introduction', module: 'Onboarding', mvp: true },
  { path: '/subscription-select', Component: L('onboarding/08-SubscriptionSelect'), label: '8. Subscription Selection', module: 'Onboarding', mvp: true },
  { path: '/permissions', Component: L('onboarding/09-Permissions'), label: '9. Permissions', module: 'Onboarding' },
  { path: '/setup-complete', Component: L('onboarding/10-SetupComplete'), label: '10. Complete Setup', module: 'Onboarding' },

  // ---- Nav hubs (not numbered screens, required by the bottom nav) ----
  { path: '/finance', Component: L('FinanceHub'), label: 'Finance (hub)', module: 'Hubs' },
  { path: '/knowledge', Component: L('KnowledgeHub'), label: 'Savoir (hub)', module: 'Hubs' },

  // ---- Module 2 — Authentication ----
  { path: '/login', Component: L('auth/11-Login'), label: '11. Login', module: 'Authentication', mvp: true },
  { path: '/register', Component: L('auth/12-Register'), label: '12. Register', module: 'Authentication', mvp: true },
  { path: '/forgot-password', Component: L('auth/13-ForgotPassword'), label: '13. Forgot Password', module: 'Authentication' },
  { path: '/otp', Component: L('auth/14-Otp'), label: '14. OTP Verification', module: 'Authentication', mvp: true },
  { path: '/security/2fa', Component: L('auth/15-TwoFactor'), label: '15. Two-Factor Authentication', module: 'Authentication' },

  // ---- Module 3 — Dashboard ----
  { path: '/home', Component: L('dashboard/16-Home'), label: '16. Dashboard Home', module: 'Dashboard', mvp: true },
  { path: '/overview', Component: L('dashboard/17-FinancialOverview'), label: '17. Financial Overview', module: 'Dashboard', mvp: true },
  { path: '/today-tasks', Component: L('dashboard/18-TodayTasks'), label: '18. Today’s Tasks', module: 'Dashboard' },
  { path: '/ai-recommendations', Component: L('dashboard/19-AiRecommendations'), label: '19. AI Recommendations', module: 'Dashboard' },
  { path: '/activity', Component: L('dashboard/20-RecentActivities'), label: '20. Recent Activities', module: 'Dashboard' },

  // ---- Module 4 — AI Assistant ----
  { path: '/chat', Component: L('chat/21-AIChat'), label: '21. AI Chat', module: 'AI Assistant', mvp: true },
  { path: '/chat/voice', Component: L('chat/22-VoiceChat'), label: '22. Voice Chat', module: 'AI Assistant' },
  { path: '/chat/history', Component: L('chat/23-ChatHistory'), label: '23. Chat History', module: 'AI Assistant', mvp: true },
  { path: '/chat/suggested', Component: L('chat/24-SuggestedQuestions'), label: '24. Suggested Questions', module: 'AI Assistant', mvp: true },
  { path: '/chat/reports', Component: L('chat/25-AiReports'), label: '25. AI Generated Reports', module: 'AI Assistant' },

  // ---- Module 5 — AI Scanner ----
  { path: '/scanner', Component: L('scanner/26-ScanInvoice'), label: '26. Scan Invoice', module: 'AI Scanner', mvp: true },
  { path: '/scanner/receipt', Component: L('scanner/27-ScanReceipt'), label: '27. Scan Receipt', module: 'AI Scanner' },
  { path: '/scanner/tax-doc', Component: L('scanner/28-ScanTaxDoc'), label: '28. Scan Tax Document', module: 'AI Scanner' },
  { path: '/scanner/review', Component: L('scanner/29-OcrReview'), label: '29. OCR Review', module: 'AI Scanner', mvp: true },
  { path: '/scanner/validation', Component: L('scanner/30-DocumentValidation'), label: '30. Document Validation', module: 'AI Scanner' },
  { path: '/documents/:id', Component: L('scanner/31-DocumentDetails'), label: '31. Document Details', module: 'AI Scanner', mvp: true },

  // ---- Module 6 — Income ----
  { path: '/income', Component: L('income/32-IncomeList'), label: '32. Income List', module: 'Income', mvp: true },
  { path: '/income/add', Component: L('income/33-AddIncome'), label: '33. Add Income', module: 'Income', mvp: true },
  { path: '/income/invoice', Component: L('income/InvoiceCreator'), label: 'Invoice Creator', module: 'Income' },
  { path: '/income/:id', Component: L('income/34-IncomeDetails'), label: '34. Income Details', module: 'Income' },
  { path: '/income/:id/edit', Component: L('income/35-EditIncome'), label: '35. Edit Income', module: 'Income' },

  // ---- Module 7 — Expenses ----
  { path: '/expenses', Component: L('expenses/36-ExpenseList'), label: '36. Expense List', module: 'Expenses', mvp: true },
  { path: '/expenses/add', Component: L('expenses/37-AddExpense'), label: '37. Add Expense', module: 'Expenses', mvp: true },
  { path: '/expenses/:id', Component: L('expenses/38-ExpenseDetails'), label: '38. Expense Details', module: 'Expenses', mvp: true },
  { path: '/expenses/categories', Component: L('expenses/39-Categories'), label: '39. Categories', module: 'Expenses', mvp: true },

  // ---- Module 9 — Tax ----
  { path: '/tax', Component: L('tax/46-TaxDashboard'), label: '46. Tax Dashboard', module: 'Tax', mvp: true },
  { path: '/tax/vat', Component: L('tax/47-VatCalculator'), label: '47. VAT Calculator', module: 'Tax', mvp: true },
  { path: '/tax/irpp', Component: L('tax/48-IrppCalculator'), label: '48. Income Tax Calculator', module: 'Tax', mvp: true },
  { path: '/tax/calendar', Component: L('tax/49-TaxCalendar'), label: '49. Tax Calendar', module: 'Tax', mvp: true },
  { path: '/tax/deadline/:id', Component: L('tax/50-DeadlineDetail'), label: '50. Tax Deadline Detail', module: 'Tax' },
  { path: '/tax/estimate', Component: L('tax/51-TaxEstimation'), label: '51. Tax Estimation', module: 'Tax', mvp: true },
  { path: '/tax/history', Component: L('tax/52-TaxHistory'), label: '52. Tax History', module: 'Tax', mvp: true },
  { path: '/tax/cnss', Component: L('tax/CnssCalculator'), label: 'CNSS Calculator', module: 'Tax' },
  { path: '/tax/investment', Component: L('tax/InvestmentCalculator'), label: 'Investment (VAN/TRI/DRCI)', module: 'Tax' },

  // ---- Module 8 — Accounting ----
  { path: '/accounting', Component: L('accounting/40-AccountingDashboard'), label: '40. Accounting Dashboard', module: 'Accounting' },
  { path: '/accounting/journal', Component: L('accounting/41-JournalEntries'), label: '41. Journal Entries', module: 'Accounting' },
  { path: '/accounting/accounts', Component: L('accounting/42-ChartOfAccounts'), label: '42. Chart of Accounts', module: 'Accounting' },
  { path: '/accounting/trial-balance', Component: L('accounting/43-TrialBalance'), label: '43. Trial Balance', module: 'Accounting' },
  { path: '/accounting/ledger', Component: L('accounting/44-GeneralLedger'), label: '44. General Ledger', module: 'Accounting' },
  { path: '/accounting/reports', Component: L('accounting/45-FinancialReportsAccounting'), label: '45. Financial Reports', module: 'Accounting' },

  // ---- Module 10 — Reports ----
  { path: '/reports/monthly', Component: L('reports/53-MonthlyReport'), label: '53. Monthly Report', module: 'Reports', mvp: true },
  { path: '/reports/annual', Component: L('reports/54-AnnualReport'), label: '54. Annual Report', module: 'Reports' },
  { path: '/reports/pnl', Component: L('reports/55-ProfitLoss'), label: '55. Profit & Loss', module: 'Reports' },
  { path: '/reports/cashflow', Component: L('reports/56-CashFlow'), label: '56. Cash Flow', module: 'Reports' },
  { path: '/reports/balance-sheet', Component: L('reports/57-BalanceSheet'), label: '57. Balance Sheet', module: 'Reports' },
  { path: '/reports/expense-analysis', Component: L('reports/58-ExpenseAnalysis'), label: '58. Expense Analysis', module: 'Reports' },

  // ---- Module 11 — Analytics ----
  { path: '/analytics', Component: L('analytics/59-KpiDashboard'), label: '59. KPI Dashboard', module: 'Analytics' },
  { path: '/analytics/revenue', Component: L('analytics/60-RevenueCharts'), label: '60. Revenue Charts', module: 'Analytics' },
  { path: '/analytics/expenses', Component: L('analytics/61-ExpenseCharts'), label: '61. Expense Charts', module: 'Analytics' },
  { path: '/analytics/performance', Component: L('analytics/62-BusinessPerformance'), label: '62. Business Performance', module: 'Analytics' },
  { path: '/analytics/insights', Component: L('analytics/63-AiInsights'), label: '63. AI Insights', module: 'Analytics' },

  // ---- Module 12 — Knowledge Center ----
  { path: '/knowledge/guides', Component: L('knowledge/64-AccountingGuides'), label: '64. Accounting Guides', module: 'Knowledge' },
  { path: '/knowledge/tax-guides', Component: L('knowledge/65-TaxGuides'), label: '65. Tax Guides', module: 'Knowledge', mvp: true },
  { path: '/knowledge/laws', Component: L('knowledge/66-TunisianLaws'), label: '66. Tunisian Laws', module: 'Knowledge' },
  { path: '/knowledge/law-updates', Component: L('knowledge/67-FinanceLawUpdates'), label: '67. Finance Law Updates', module: 'Knowledge', mvp: true },
  { path: '/knowledge/faq', Component: L('knowledge/68-Faq'), label: '68. FAQ', module: 'Knowledge' },
  { path: '/knowledge/read/:type/:slug', Component: L('knowledge/ContentDetail'), label: 'Knowledge article detail', module: 'Knowledge' },
  { path: '/knowledge/exam-solver', Component: L('knowledge/ExamSolver'), label: 'AI Exam Solver', module: 'Knowledge' },
  { path: '/knowledge/quiz', Component: L('knowledge/Quiz'), label: 'Quiz Comptabilité & Fiscalité', module: 'Knowledge' },
  { path: '/knowledge/search', Component: L('knowledge/69-SearchKnowledge'), label: '69. Search Knowledge', module: 'Knowledge' },

  // ---- Module 13 — Expert Accountants ----
  { path: '/experts', Component: L('experts/70-FindAccountant'), label: '70. Find Accountant', module: 'Experts' },
  { path: '/experts/:id', Component: L('experts/71-AccountantProfile'), label: '71. Accountant Profile', module: 'Experts' },
  { path: '/experts/:id/book', Component: L('experts/72-AppointmentBooking'), label: '72. Appointment Booking', module: 'Experts' },
  { path: '/experts/:id/chat', Component: L('experts/73-ChatWithAccountant'), label: '73. Chat with Accountant', module: 'Experts' },
  { path: '/experts/:id/video', Component: L('experts/74-VideoConsultation'), label: '74. Video Consultation', module: 'Experts' },
  { path: '/experts/history', Component: L('experts/75-ConsultationHistory'), label: '75. Consultation History', module: 'Experts' },

  // ---- Module 14 — Documents ----
  { path: '/documents', Component: L('documents/76-AllDocuments'), label: '76. All Documents', module: 'Documents', mvp: true },
  { path: '/documents/upload', Component: L('documents/77-UploadDocument'), label: '77. Upload Document', module: 'Documents' },
  { path: '/documents/categories', Component: L('documents/78-DocumentCategories'), label: '78. Document Categories', module: 'Documents' },
  { path: '/documents/view', Component: L('documents/79-PdfViewer'), label: '79. PDF Viewer', module: 'Documents' },
  { path: '/documents/export', Component: L('documents/80-ExcelExport'), label: '80. Excel Export', module: 'Documents', mvp: true },

  // ---- Module 15 — Notifications ----
  { path: '/notifications', Component: L('notifications/81-Notifications'), label: '81. Notifications', module: 'Notifications', mvp: true },
  { path: '/notifications/reminders', Component: L('notifications/82-TaxReminders'), label: '82. Tax Reminders', module: 'Notifications' },
  { path: '/notifications/ai-alerts', Component: L('notifications/83-AiAlerts'), label: '83. AI Alerts', module: 'Notifications' },

  // ---- Module 16 — Team ----
  { path: '/team', Component: L('team/84-TeamMembers'), label: '84. Team Members', module: 'Team' },
  { path: '/team/roles', Component: L('team/85-RolesPermissions'), label: '85. Roles & Permissions', module: 'Team' },

  // ---- Module 17 — Subscription ----
  { path: '/pricing', Component: L('subscription/86-Pricing'), label: '86. Pricing', module: 'Subscription', mvp: true },
  { path: '/upgrade', Component: L('subscription/87-UpgradePremium'), label: '87. Upgrade to Premium', module: 'Subscription' },
  { path: '/payment', Component: L('subscription/88-Payment'), label: '88. Payment', module: 'Subscription', mvp: true },
  { path: '/billing', Component: L('subscription/89-BillingHistory'), label: '89. Billing History', module: 'Subscription' },

  // ---- Module 18 — Profile ----
  { path: '/profile', Component: L('profile/90-MyProfile'), label: '90. My Profile', module: 'Profile', mvp: true },
  { path: '/profile/company', Component: L('profile/91-CompanyProfile'), label: '91. Company Profile', module: 'Profile' },
  { path: '/profile/settings', Component: L('profile/92-Settings'), label: '92. Settings', module: 'Profile' },
  { path: '/profile/security', Component: L('profile/93-Security'), label: '93. Security', module: 'Profile' },
  { path: '/profile/language', Component: L('profile/94-Language'), label: '94. Language', module: 'Profile' },
  { path: '/profile/about', Component: L('profile/95-About'), label: '95. About', module: 'Profile' },

  // ---- Module 20 — Future Features ----
  { path: '/future/bank', Component: L('future/106-BankConnection'), label: '106. Bank Account Connection', module: 'Future' },
  { path: '/future/bank-import', Component: L('future/107-BankImport'), label: '107. Bank Transaction Import', module: 'Future' },
  { path: '/future/einvoice', Component: L('future/108-EInvoice'), label: '108. E-Invoice', module: 'Future' },
  { path: '/future/signature', Component: L('future/109-DigitalSignature'), label: '109. Digital Signature', module: 'Future' },
  { path: '/future/payroll', Component: L('future/110-Payroll'), label: '110. Payroll', module: 'Future' },
  { path: '/future/employees', Component: L('future/111-EmployeeManagement'), label: '111. Employee Management', module: 'Future' },
  { path: '/future/inventory', Component: L('future/112-Inventory'), label: '112. Inventory', module: 'Future' },
  { path: '/future/sales', Component: L('future/113-SalesManagement'), label: '113. Sales Management', module: 'Future' },
  { path: '/future/purchases', Component: L('future/114-PurchaseManagement'), label: '114. Purchase Management', module: 'Future' },
  { path: '/future/crm', Component: L('future/115-ClientCrm'), label: '115. Client CRM', module: 'Future' },
  { path: '/future/suppliers', Component: L('future/116-SupplierManagement'), label: '116. Supplier Management', module: 'Future' },
  { path: '/future/multi-company', Component: L('future/117-MultiCompany'), label: '117. Multi-Company', module: 'Future' },
  { path: '/future/forecast', Component: L('future/118-AiForecasting'), label: '118. AI Forecasting', module: 'Future' },
  { path: '/future/budget', Component: L('future/119-BudgetPlanning'), label: '119. Budget Planning', module: 'Future' },
  { path: '/future/audit', Component: L('future/120-AuditAssistant'), label: '120. Audit Assistant', module: 'Future' },
];

export const adminManifest = [
  { path: '/admin', Component: L('admin/96-AdminDashboard'), label: '96. Admin Dashboard' },
  { path: '/admin/users', Component: L('admin/97-UsersManagement'), label: '97. Users Management' },
  { path: '/admin/subscriptions', Component: L('admin/98-SubscriptionsManagement'), label: '98. Subscriptions Management' },
  { path: '/admin/knowledge', Component: L('admin/99-KnowledgeBaseManagement'), label: '99. Knowledge Base Management' },
  { path: '/admin/ai-logs', Component: L('admin/100-AiLogs'), label: '100. AI Logs' },
  { path: '/admin/accountants', Component: L('admin/101-AccountantManagement'), label: '101. Accountant Management' },
  { path: '/admin/content', Component: L('admin/102-ContentManagement'), label: '102. Content Management' },
  { path: '/admin/notifications', Component: L('admin/103-NotificationsManagement'), label: '103. Notifications Management' },
  { path: '/admin/analytics', Component: L('admin/104-AdminAnalytics'), label: '104. Admin Analytics' },
  { path: '/admin/settings', Component: L('admin/105-SystemSettings'), label: '105. System Settings' },
];
