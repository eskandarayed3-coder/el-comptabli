import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

// QCM bank — comptabilité + fiscalité tunisiennes (SCE / LF), bilingual.
// correct = index in options. Kept in-file: it's pedagogical content, not state.
const BANK = [
  {
    correct: 1,
    fr: { q: 'Achat de marchandises à crédit : quel compte est débité ?', options: ['401 Fournisseurs', '607 Achats de marchandises', '707 Ventes', '411 Clients'], explain: 'L’achat augmente les charges : on débite 607. Le crédit va au 401 Fournisseurs (dette).' },
    ar: { q: 'شراء سلعة بالكريدي: شنوة الحساب اللي يتسجل مدين؟', options: ['401 موردين', '607 شراءات سلع', '707 مبيعات', '411 حرفاء'], explain: 'الشراء يزيد في المصاريف: نسجلو 607 مدين، و401 موردين دائن (دين).' },
  },
  {
    correct: 2,
    fr: { q: 'Quel est le taux standard de TVA en Tunisie ?', options: ['13 %', '7 %', '19 %', '21 %'], explain: '19 % est le taux standard. 13 % et 7 % sont des taux réduits pour certains biens et services.' },
    ar: { q: 'شنية النسبة العادية للـ TVA في تونس؟', options: ['13%', '7%', '19%', '21%'], explain: '19% هي النسبة العادية. 13% و7% نسب مخففة لبعض السلع والخدمات.' },
  },
  {
    correct: 0,
    fr: { q: 'Dans le plan comptable tunisien (SCE), le compte "Clients" est le :', options: ['411', '401', '532', '607'], explain: '411 = Clients (créance). 401 = Fournisseurs. Ne pas confondre avec le plan français !' },
    ar: { q: 'في المخطط المحاسبي التونسي (SCE)، حساب "الحرفاء" هو:', options: ['411', '401', '532', '607'], explain: '411 = حرفاء (مستحقات). 401 = موردين.' },
  },
  {
    correct: 3,
    fr: { q: 'La TVA déductible sur achats s’enregistre au compte :', options: ['4367', '445', '707', '4366'], explain: '4366 = TVA déductible (achats). 4367 = TVA collectée (ventes). 445 est un compte du plan français.' },
    ar: { q: 'الـ TVA القابلة للخصم على الشراءات تتسجل في حساب:', options: ['4367', '445', '707', '4366'], explain: '4366 = TVA قابلة للخصم (شراءات). 4367 = TVA مجمّعة (مبيعات).' },
  },
  {
    correct: 1,
    fr: { q: 'La première tranche IRPP à 0 % s’applique jusqu’à :', options: ['3 000 DT', '5 000 DT', '8 000 DT', '10 000 DT'], explain: 'Les premiers 5 000 DT de revenu annuel net ne sont pas imposés (barème progressif à 8 tranches).' },
    ar: { q: 'أول شريحة IRPP بـ 0% توصل حتى لـ:', options: ['3 000 دينار', '5 000 دينار', '8 000 دينار', '10 000 دينار'], explain: 'أول 5 000 دينار من الدخل السنوي الصافي ما عليهمش ضريبة.' },
  },
  {
    correct: 0,
    fr: { q: 'Un forfaitaire facture-t-il la TVA à ses clients ?', options: ['Non, jamais', 'Oui, à 19 %', 'Oui, à 7 %', 'Seulement en export'], explain: 'Le régime forfaitaire est hors champ TVA : pas de TVA facturée, pas de TVA récupérée.' },
    ar: { q: 'اللي في النظام التقديري يفوتر TVA لحرفائه؟', options: ['لا، أبدا', 'نعم، بـ 19%', 'نعم، بـ 7%', 'كان في التصدير'], explain: 'النظام التقديري خارج مجال TVA: لا يفوترها ولا يسترجعها.' },
  },
  {
    correct: 2,
    fr: { q: 'Combien d’acomptes provisionnels par an au régime réel ?', options: ['1', '2', '3', '4'], explain: '3 acomptes de 30 % chacun de l’impôt de l’année précédente : juin, septembre, décembre.' },
    ar: { q: 'قداش من تسبقة (acompte) في العام في النظام الحقيقي؟', options: ['1', '2', '3', '4'], explain: '3 تسبقات، كل وحدة 30% من ضريبة العام الفارط: جوان، سبتمبر، ديسمبر.' },
  },
  {
    correct: 1,
    fr: { q: 'Vente de 1 000 DT HT avec TVA 19 % : le TTC est :', options: ['1 019 DT', '1 190 DT', '1 900 DT', '1 090 DT'], explain: '1 000 + (1 000 × 19 %) = 1 000 + 190 = 1 190 DT.' },
    ar: { q: 'بيع بـ 1 000 دينار HT مع TVA 19%: الـ TTC هو:', options: ['1 019 دينار', '1 190 دينار', '1 900 دينار', '1 090 دينار'], explain: '1 000 + (1 000 × 19%) = 1 190 دينار.' },
  },
  {
    correct: 3,
    fr: { q: 'La balance comptable vérifie que :', options: ['Le résultat est positif', 'La caisse n’est pas vide', 'La TVA est payée', 'Total débits = total crédits'], explain: 'C’est le contrôle de base de la partie double : la somme des débits doit égaler la somme des crédits.' },
    ar: { q: 'الميزان المحاسبي يثبّت اللي:', options: ['النتيجة موجبة', 'الصندوق ماهوش فارغ', 'الـ TVA خالصة', 'مجموع المدين = مجموع الدائن'], explain: 'هذا هو التثبّت الأساسي للقيد المزدوج.' },
  },
  {
    correct: 0,
    fr: { q: 'Machine à 10 000 DT amortie en linéaire sur 5 ans : annuité ?', options: ['2 000 DT', '1 000 DT', '2 500 DT', '5 000 DT'], explain: 'Amortissement linéaire = 10 000 ÷ 5 = 2 000 DT par an.' },
    ar: { q: 'آلة بـ 10 000 دينار تستهلك خطيا على 5 سنين: قداش في العام؟', options: ['2 000 دينار', '1 000 دينار', '2 500 دينار', '5 000 دينار'], explain: 'الاستهلاك الخطي = 10 000 ÷ 5 = 2 000 دينار في العام.' },
  },
  {
    correct: 2,
    fr: { q: 'La TVA à payer chaque mois se calcule ainsi :', options: ['TVA collectée + TVA déductible', 'TVA déductible − TVA collectée', 'TVA collectée − TVA déductible', 'CA × 19 %'], explain: 'Tu verses la différence entre ce que tu as facturé (collectée) et ce que tu as payé (déductible).' },
    ar: { q: 'الـ TVA اللي تتخلص كل شهر تتحسب هكا:', options: ['مجمّعة + قابلة للخصم', 'قابلة للخصم − مجمّعة', 'مجمّعة − قابلة للخصم', 'رقم المعاملات × 19%'], explain: 'تخلص الفرق بين اللي فوترتو واللي خلصتو على شراءاتك.' },
  },
  {
    correct: 1,
    fr: { q: 'Date limite mensuelle de déclaration TVA (personne physique) :', options: ['Le 15', 'Le 28', 'Le 20', 'Fin du mois'], explain: 'Les personnes physiques au régime réel déclarent avant le 28 du mois suivant.' },
    ar: { q: 'آخر أجل شهري لتصريح الـ TVA (شخص طبيعي):', options: ['15 في الشهر', '28 في الشهر', '20 في الشهر', 'آخر الشهر'], explain: 'الأشخاص الطبيعيون في النظام الحقيقي يصرّحو قبل 28 في الشهر الموالي.' },
  },
];

export default function Quiz() {
  const { state, patch } = useStore();
  const { t, lang } = useT();
  const L = lang === 'ar' ? 'ar' : 'fr';

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0); // reshuffle key

  const questions = useMemo(
    () => [...BANK].sort(() => Math.random() - 0.5),
    [run],
  );
  const q = questions[i];
  const best = state.settings.quizBest || 0;

  const pick = (idx) => {
    if (picked != null) return;
    setPicked(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (i + 1 >= questions.length) {
      const final = score;
      if (final > best) patch('settings', { quizBest: final });
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setRun((r) => r + 1);
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="screen stagger">
        <TopBar title={`${t('quiz.title')} 🏆`} />
        <div className="card tint-teal center col" style={{ gap: 10, alignItems: 'center', padding: 28 }}>
          <Trophy size={40} color="var(--teal-700)" />
          <h1 className="num">{score} / {questions.length}</h1>
          <p className="small muted">
            {score === questions.length ? t('quiz.perfect') : score >= questions.length * 0.7 ? t('quiz.great') : t('quiz.keepGoing')}
          </p>
          {best > 0 && <span className="pill teal num">{t('quiz.best', { n: Math.max(best, score) })}</span>}
        </div>
        <button className="btn btn-primary btn-block" onClick={restart}>
          <RotateCcw size={16} /> {t('quiz.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="screen stagger">
      <TopBar title={`${t('quiz.title')} 🎯`} />
      <div className="row between small">
        <span className="muted num">{t('quiz.progress', { i: i + 1, n: questions.length })}</span>
        <span className="pill teal num">{t('quiz.score', { n: score })}</span>
      </div>

      <div className="card">
        <p className="small" style={{ fontWeight: 700 }}>{q[L].q}</p>
      </div>

      <div className="col" style={{ gap: 8 }}>
        {q[L].options.map((opt, idx) => {
          const isCorrect = picked != null && idx === q.correct;
          const isWrongPick = picked === idx && idx !== q.correct;
          return (
            <button
              key={idx}
              className={`card row between small ${isCorrect ? 'tint-teal pop' : isWrongPick ? 'tint-coral shake' : ''}`}
              style={{ width: '100%', textAlign: 'start', fontWeight: 600, opacity: picked != null && !isCorrect && !isWrongPick ? 0.55 : 1 }}
              onClick={() => pick(idx)}
            >
              <span className="grow">{opt}</span>
              {isCorrect && <CheckCircle2 size={18} color="var(--teal-700)" />}
              {isWrongPick && <XCircle size={18} color="var(--pill-danger-fg)" />}
            </button>
          );
        })}
      </div>

      {picked != null && (
        <div className={`card ${picked === q.correct ? 'tint-teal' : 'tint-amber'}`}>
          <p className="small" style={{ fontWeight: 700 }}>{picked === q.correct ? t('quiz.correct') : t('quiz.wrong')}</p>
          <p className="small" style={{ marginTop: 4 }}>{q[L].explain}</p>
        </div>
      )}

      {picked != null && (
        <button className="btn btn-primary btn-block" onClick={next}>
          {i + 1 >= questions.length ? t('quiz.finish') : t('quiz.next')}
        </button>
      )}
    </div>
  );
}
