// Genuinely blank starting state for every real user — nothing pre-filled,
// nothing fake. Every new visitor (and anyone who resets their data in
// Settings) gets this, not a demo dataset: real customers must never see
// someone else's business name, transactions, or chat history.
export function seedState() {
  return {
    __v: 1,
    settings: {
      lang: 'fr',
      plan: 'free',
      onboarded: false,
      notifications: true,
      camera: true,
      storage: false,
      aiQuestionsUsed: 0,
      theme: 'light',
      currency: 'DT',
    },
    profile: {
      name: '',
      userType: 'freelance',
      activity: '',
      city: 'Nabeul',
      sector: 'Services numériques',
      taxId: '',
      regime: 'reel',
      email: '',
      phone: '',
    },
    transactions: [],
    journalEntries: [],
    dashboard: { invoice_count: 0, posted_entry_count: 0, income_ttc: 0, expense_ttc: 0, vat_collected: 0, vat_deductible: 0, vat_to_pay: 0 },
    accounts: [],
    trialBalance: [],
    generalLedger: [],
    financialStatements: [],
    vatSummary: [],
    deadlines: [],
    tasks: [],
    chats: [],
    documents: [],
    notifications: [],
    activities: [],
    calcHistory: [],
    aiReports: [],
    ui: { toast: null },
  };
}
