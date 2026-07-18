// Demo data matching the copy in PROMPTS_STITCH_120_SCREENS.md.
// Dates are anchored to the current month so the app always looks alive.
import { uid, todayISO } from './format.js';

function ym(offsetMonths = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toISOString().slice(0, 7);
}

export function seedState() {
  const thisMonth = ym(0);
  const lastMonth = ym(-1);
  const twoAgo = ym(-2);

  return {
    __v: 1,
    settings: {
      lang: 'fr',
      plan: 'free',
      onboarded: false,
      notifications: true,
      camera: true,
      storage: false,
      aiQuestionsUsed: 8,
      theme: 'light',
      currency: 'DT',
    },
    profile: {
      name: 'Eskandar',
      userType: 'freelance',
      activity: 'Studio Eskandar Design',
      city: 'Nabeul',
      sector: 'Services numériques',
      taxId: '',
      regime: 'reel',
      email: '',
      phone: '',
    },
    transactions: [
      { id: uid(), kind: 'expense', vendor: 'STEG', label: 'Facture STEG', category: 'electricite', date: `${thisMonth}-10`, amountHT: 118.6, tva: 22.534, amountTTC: 141.134, scanned: true },
      { id: uid(), kind: 'income', vendor: 'Client Wafa', label: 'Recette client Wafa', category: 'ventes', date: `${thisMonth}-08`, amountHT: 714.3, tva: 135.7, amountTTC: 850 },
      { id: uid(), kind: 'income', vendor: 'Client Karim', label: 'Site vitrine, acompte', category: 'ventes', date: `${thisMonth}-03`, amountHT: 1000, tva: 190, amountTTC: 1190 },
      { id: uid(), kind: 'expense', vendor: 'Ooredoo', label: 'Internet fibre', category: 'telecom', date: `${thisMonth}-05`, amountHT: 55, tva: 10.45, amountTTC: 65.45 },
      { id: uid(), kind: 'expense', vendor: 'Agil', label: 'Carburant', category: 'carburant', date: `${thisMonth}-12`, amountHT: 90, tva: 17.1, amountTTC: 107.1 },
      { id: uid(), kind: 'expense', vendor: 'Propriétaire', label: 'Loyer bureau', category: 'loyer', date: `${thisMonth}-02`, amountHT: 450, tva: 0, amountTTC: 450 },
      { id: uid(), kind: 'income', vendor: 'Client Amine', label: 'Identité visuelle', category: 'ventes', date: `${lastMonth}-22`, amountHT: 1500, tva: 285, amountTTC: 1785 },
      { id: uid(), kind: 'expense', vendor: 'Librairie El Kitab', label: 'Fournitures', category: 'achats', date: `${lastMonth}-15`, amountHT: 120, tva: 22.8, amountTTC: 142.8 },
      { id: uid(), kind: 'income', vendor: 'Client Salma', label: 'Refonte logo', category: 'ventes', date: `${twoAgo}-18`, amountHT: 800, tva: 152, amountTTC: 952 },
      { id: uid(), kind: 'expense', vendor: 'Agil', label: 'Carburant', category: 'carburant', date: `${lastMonth}-20`, amountHT: 70, tva: 13.3, amountTTC: 83.3 },
    ],
    deadlines: [
      { id: uid(), title: { fr: 'Déclaration TVA juin', ar: 'تصريح الأداء (TVA) جوان' }, date: `${thisMonth}-28`, status: 'late', kind: 'tva', amount: 312, note: { fr: 'Tu déclares la TVA collectée moins la TVA payée.', ar: 'تصرّح بالأداء اللي جمعتو ناقص اللي خلصتو.' } },
      { id: uid(), title: { fr: 'Déclaration TVA juillet', ar: 'تصريح الأداء (TVA) جويلية' }, date: `${thisMonth}-28`, status: 'upcoming', kind: 'tva', amount: null, note: { fr: 'Tu déclares la TVA collectée moins la TVA payée.', ar: 'تصرّح بالأداء اللي جمعتو ناقص اللي خلصتو.' } },
      { id: uid(), title: { fr: 'Acompte provisionnel n°2', ar: 'التسبقة الثانية' }, date: `${ym(2)}-25`, status: 'upcoming', kind: 'acompte', amount: 780, note: { fr: '30 % de l’impôt de l’année dernière.', ar: '30% من ضريبة العام الفارط.' } },
      { id: uid(), title: { fr: 'Déclaration TVA mai', ar: 'تصريح الأداء (TVA) ماي' }, date: `${lastMonth}-28`, status: 'paid', kind: 'tva', amount: 301, note: { fr: 'Payée, bien joué 👌', ar: 'خالصة، يعطيك الصحة 👌' } },
    ],
    tasks: [
      { id: uid(), text: { fr: 'Déposer déclaration TVA juin', ar: 'قدّم تصريح TVA جوان' }, status: 'late', done: false },
      { id: uid(), text: { fr: 'Scanner 3 factures fournisseurs', ar: 'سكاني 3 فواتير موردين' }, status: 'upcoming', done: false },
      { id: uid(), text: { fr: 'Vérifier facture STEG', ar: 'ثبّت في فاتورة الستاغ' }, status: 'upcoming', done: false },
      { id: uid(), text: { fr: 'Enregistrer recette client Wafa', ar: 'سجّل قبض الحريفة وفاء' }, status: 'done', done: true },
      { id: uid(), text: { fr: 'Répondre à l’IA sur le régime', ar: 'جاوب الذكاء الاصطناعي على النظام' }, status: 'done', done: true },
    ],
    chats: [
      {
        id: uid(), title: 'TVA freelance', domain: 'Fiscalité', pinned: true, updatedAt: `${thisMonth}-14T09:12:00`,
        messages: [
          { role: 'user', text: 'Est-ce que je dois facturer la TVA comme freelance ?' },
          { role: 'model', text: 'Si tu es au régime réel, oui : tu factures 19 % de TVA sur tes prestations.\nExemple : mission 1 000 DT HT → facture 1 190 DT TTC.\nPour un cas complexe, vérifie avec un expert-comptable.' },
        ],
      },
      {
        id: uid(), title: 'Régime forfaitaire 2026', domain: 'Fiscalité', pinned: false, updatedAt: `${lastMonth}-28T18:40:00`,
        messages: [
          { role: 'user', text: 'C’est quoi le régime forfaitaire ?' },
          { role: 'model', text: 'C’est un régime simplifié pour les petites activités : un impôt unique calculé sur ton chiffre d’affaires, sans TVA à gérer.\nExemple : CA 20 000 DT → impôt forfaitaire ≈ 200 DT.\nConsulte la recette des finances pour ton cas.' },
        ],
      },
      {
        id: uid(), title: 'Calcul IRPP 24 000 DT', domain: 'Compta', pinned: false, updatedAt: `${twoAgo}-12T11:05:00`,
        messages: [
          { role: 'user', text: 'Combien d’IRPP sur 24 000 DT net par an ?' },
          { role: 'model', text: 'Environ 4 450 DT avec le barème progressif :\n5 000 × 0 % = 0\n5 000 × 15 % = 750\n10 000 × 25 % = 2 500\n4 000 × 30 % = 1 200\nEstimation indicative, vérifie avec un expert.' },
        ],
      },
    ],
    documents: [
      { id: uid(), name: 'Facture STEG juin.jpg', type: 'facture', date: `${thisMonth}-10`, size: '1,2 Mo', scanned: true },
      { id: uid(), name: 'Déclaration TVA mai.pdf', type: 'declaration', date: `${lastMonth}-26`, size: '340 Ko' },
      { id: uid(), name: 'Facture client Wafa.pdf', type: 'facture', date: `${thisMonth}-08`, size: '210 Ko' },
      { id: uid(), name: 'Contrat Studio · Karim.pdf', type: 'contrat', date: `${twoAgo}-02`, size: '890 Ko' },
    ],
    notifications: [
      { id: uid(), kind: 'deadline', icon: 'CalendarClock', tone: 'coral', at: `${todayISO()}T08:00:00`, read: false, text: { fr: 'TVA juin en retard, à régler avant le 28.', ar: 'TVA جوان متأخرة، خلّصها قبل 28.' } },
      { id: uid(), kind: 'ai', icon: 'Sparkles', tone: 'indigo', at: `${todayISO()}T07:30:00`, read: false, text: { fr: 'Tes dépenses carburant ont augmenté de 30 % ce mois.', ar: 'مصاريف الإسانس زادت 30% هالشهر.' } },
      { id: uid(), kind: 'scan', icon: 'ScanLine', tone: 'amber', at: `${thisMonth}-12T16:20:00`, read: true, text: { fr: '3 factures scannées attendent validation.', ar: '3 فواتير مسكانية يستنّوا في التثبيت.' } },
    ],
    activities: [
      { id: uid(), icon: 'ScanLine', at: `${todayISO()}T10:24:00`, text: { fr: 'Facture STEG scannée (141,134 DT)', ar: 'فاتورة الستاغ تسكانات (141,134 د)' } },
      { id: uid(), icon: 'MessageCircle', at: `${todayISO()}T09:12:00`, text: { fr: 'Question posée à l’IA : TVA freelance', ar: 'سؤال للذكاء الاصطناعي: TVA فريلانس' } },
      { id: uid(), icon: 'TrendingUp', at: `${thisMonth}-08T15:00:00`, text: { fr: 'Recette +850 DT ajoutée', ar: 'قبض +850 د تزاد' } },
      { id: uid(), icon: 'FileSpreadsheet', at: `${thisMonth}-07T11:30:00`, text: { fr: 'Rapport juin exporté en Excel', ar: 'تقرير جوان تصدّر Excel' } },
      { id: uid(), icon: 'CheckCircle2', at: `${lastMonth}-26T10:00:00`, text: { fr: 'Déclaration TVA mai marquée payée', ar: 'تصريح TVA ماي تعلّم خالص' } },
    ],
    calcHistory: [],
    aiReports: [],
    ui: { toast: null },
  };
}
