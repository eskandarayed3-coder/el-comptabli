import { MessageCircle, Rocket, UserPlus, LayoutDashboard, Sparkles, ScanLine, Wallet, CalendarClock, KeyRound, RotateCcw } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

const WHATSAPP = '21628456450';

const STEPS = [
  {
    tone: 'teal', icon: Rocket,
    title: { fr: 'Ouvrir l’application', ar: 'حل الأبليكاسيون' },
    body: {
      fr: 'Pas besoin de store : ouvre le lien dans ton navigateur. Pour l’avoir comme une vraie app, utilise « Ajouter à l’écran d’accueil » dans le menu du navigateur.',
      ar: 'ما تحتاجش store : حل الرابط في المتصفح. باش تولي مثل أبليكاسيون حقيقية، استعمل « زيد للشاشة الرئيسية » من قائمة المتصفح.',
    },
  },
  {
    tone: 'amber', icon: UserPlus,
    title: { fr: 'Créer ton compte', ar: 'اعمل حسابك' },
    body: {
      fr: 'La 1ère fois, l’app te demande ta langue, qui tu es (freelance, patente…), ton nom et email (obligatoires — ils servent à retrouver ton accès), et ton régime fiscal.',
      ar: 'أول مرة، الأبليكاسيون تسقسيك على لغتك، شكون انتي (فريلانس، براءة...)، اسمك والإيميل (لازمين — يعاونوك ترجع لحسابك)، والنظام الجبائي متاعك.',
    },
  },
  {
    tone: 'indigo', icon: LayoutDashboard,
    title: { fr: 'Ton écran d’accueil', ar: 'الشاشة الرئيسية' },
    body: {
      fr: 'D’un coup d’œil : ta prochaine échéance, ton solde du mois, tes tâches du jour et les suggestions de l’IA.',
      ar: 'بلمحة وحدة : أقرب أجل، رصيدك هالشهر، مهامك اليوم، واقتراحات الذكاء الاصطناعي.',
    },
  },
  {
    tone: 'teal', icon: MessageCircle,
    title: { fr: 'Poser une question à l’IA', ar: 'اسقسي الذكاء الاصطناعي' },
    body: {
      fr: 'Onglet IA. Écris ta question normalement : « Je déclare quoi ce mois ? », « Comment calculer ma TVA ? »',
      ar: 'تبويب الذكاء. اكتب سؤالك عادي : « نصرّح شنوة هالشهر؟ »، « كيفاش نحسب التVA؟ »',
    },
  },
  {
    tone: 'amber', icon: ScanLine,
    title: { fr: 'Scanner une facture', ar: 'سكاني فاتورة' },
    body: {
      fr: 'Onglet Scanner. Prends une photo — l’IA lit le montant, le fournisseur et la TVA toute seule. Tu vérifies, tu enregistres.',
      ar: 'تبويب Scanner. خذ تصويرة — الذكاء الاصطناعي يقرا المبلغ والمورد والTVA وحدو. تثبّت، تسجّل.',
    },
  },
  {
    tone: 'coral', icon: Wallet,
    title: { fr: 'Suivre revenus et dépenses', ar: 'تابع الدخل والمصاريف' },
    body: {
      fr: 'Onglet Finance. Ajoute une recette ou une dépense en quelques secondes, classée par catégorie et par mois.',
      ar: 'تبويب Finance. زيد قبض ولا مصروف في ثواني، مرتّب حسب الصنف والشهر.',
    },
  },
  {
    tone: 'indigo', icon: CalendarClock,
    title: { fr: 'Ne rater aucune échéance', ar: 'ما تفوتش أي أجل' },
    body: {
      fr: 'Le calendrier fiscal affiche tes prochaines déclarations avec les dates limites — en retard, à venir, ou payées.',
      ar: 'الروزنامة الجبائية توري تصاريحك الجاية بالتواريخ — متأخرة، جاية، ولا خالصة.',
    },
  },
  {
    tone: 'teal', icon: KeyRound,
    title: { fr: 'Débloquer l’accès complet', ar: 'حل الدخول الكامل' },
    body: {
      fr: 'Choisis un plan (1 DT/jour, 5 DT/semaine, 20 DT/mois), paie via Ooredoo/carte/e-Dinar, envoie la preuve sur WhatsApp, reçois ton code et active-le dans l’app.',
      ar: 'اختار خطة (1 د/نهار، 5 د/جمعة، 20 د/شهر)، خلص بـ Ooredoo/كارت/e-Dinar، إبعث إثبات الخلاص في واتساب، خذ الكود ونشّطو في الأبليكاسيون.',
    },
  },
  {
    tone: 'amber', icon: RotateCcw,
    title: { fr: 'Nouveau téléphone ?', ar: 'تليفون جديد؟' },
    body: {
      fr: 'Rien n’est perdu : Profil → Paramètres → Récupérer mon accès, entre ton email, et ton abonnement revient tout seul.',
      ar: 'ما يخسرش شيء : بروفيل → الإعدادات → رجّع الدخول متاعي، دخّل الإيميل، والاشتراك يرجّع وحدو.',
    },
  },
];

export default function Guide() {
  const { t, lang } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={t('guide.title')} />
      <p className="muted small">{t('guide.intro')}</p>

      <div className="col" style={{ gap: 14 }}>
        {STEPS.map((s, i) => (
          <div key={i} className={`card tint-${s.tone}`}>
            <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span className={`icon-wrap ${s.tone}`} style={{ flexShrink: 0 }}><s.icon size={18} /></span>
              <div className="col" style={{ gap: 4 }}>
                <span className="small" style={{ fontWeight: 700 }}>{i + 1}. {s.title[lang] || s.title.fr}</span>
                <span className="tiny">{s.body[lang] || s.body.fr}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <a
        className="btn btn-block" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
        style={{ background: '#25D366', color: '#fff', marginTop: 8 }}
      >
        <Sparkles size={16} /> {t('guide.waCta')}
      </a>
    </div>
  );
}
