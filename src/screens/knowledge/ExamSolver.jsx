import { useState } from 'react';
import { Sparkles, GraduationCap, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { solveExam, fileToImagePayload } from '../../lib/api.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import MarkdownLite from '../../components/MarkdownLite.jsx';

const BASE_RULES = `Réponds en français, texte brut uniquement (aucun Markdown : pas de **, ##, $$).
Ne présente JAMAIS de tableau (interdit : les caractères "|", les colonnes alignées avec des espaces). Pour une écriture comptable ou toute liste de lignes (compte, montant...), utilise une ligne par élément, préfixée par "- ", au format : "- Compte 607 (Achats de marchandises) : Débit 1000 DT".
Si une image est fournie, commence par une ligne "Énoncé lu :" suivie d'une transcription fidèle de l'exercice que tu lis dessus, avant de le résoudre. Si l'image est illisible ou coupée, dis-le clairement plutôt que d'inventer.
Structure ensuite ta réponse avec des titres courts sur leur propre ligne :
1. Analyse : ce que l'énoncé demande, en une ou deux phrases.
2. Résolution étape par étape : le raisonnement complet et les calculs détaillés.
3. Résultat final : la réponse chiffrée ou la conclusion, mise en avant clairement.
4. Points clés à retenir : 2-3 rappels de cours utiles pour ce type d'exercice.

Si l'énoncé est incomplet ou ambigu, indique les hypothèses que tu poses pour pouvoir résoudre quand même.`;

const SYSTEM_PROMPTS = {
  comptabilite: `Tu es un professeur de comptabilité tunisien qui corrige un examen (journal, grand livre, bilan, compte de résultat, amortissements, TVA...).

Utilise IMPÉRATIVEMENT la numérotation du plan comptable tunisien (Système Comptable des Entreprises, SCE) — PAS le plan comptable général français. Exemples de comptes SCE corrects : 607 Achats de marchandises, 707 Ventes, 401 Fournisseurs, 411 Clients, 4366 TVA déductible sur achats, 4367 TVA collectée.

${BASE_RULES}`,
  finance: `Tu es un professeur de finance d'entreprise tunisien qui corrige un examen (analyse financière, rentabilité, trésorerie, investissement, ratios, VAN, TRI, coût du capital...).

${BASE_RULES}`,
};

export default function ExamSolver() {
  const { toast } = useStore();
  const { t } = useT();
  const [subject, setSubject] = useState('comptabilite');
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState(null); // { file, previewUrl }
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState('');
  const [aiOff, setAiOff] = useState(null);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage({ file, previewUrl: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const removeImage = () => {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
  };

  const canSolve = (question.trim() || image) && !busy;

  const solve = async () => {
    if (!canSolve) return;
    setBusy(true);
    setAnswer('');
    setAiOff(null);
    try {
      const imagePayload = image ? await fileToImagePayload(image.file) : null;
      const text = await solveExam({
        system: SYSTEM_PROMPTS[subject],
        prompt: question.trim(),
        image: imagePayload,
        maxTokens: 2200,
      });
      setAnswer(text);
    } catch (e) {
      const offCodes = ['api_disabled', 'bad_key', 'no_credits', 'no_vision'];
      if (offCodes.includes(e.friendly?.code)) setAiOff(e.friendly);
      else toast(e.friendly?.code ? t(`aiOff.codes.${e.friendly.code}`) : t('aiOff.codes.upstream_error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.examSolver')} 🎓`} />
      <p className="muted small">{t('knowledge.examSolverHint')}</p>

      <SegmentedControl
        options={[{ id: 'comptabilite', label: t('accounting.title') }, { id: 'finance', label: 'Finance' }]}
        value={subject} onChange={setSubject}
      />

      {image ? (
        <div className="card" style={{ padding: 12, position: 'relative' }}>
          <img src={image.previewUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 12 }} />
          <button className="icon-btn" style={{ position: 'absolute', top: 20, insetInlineEnd: 20, background: 'rgba(0,0,0,0.55)', color: '#fff' }} onClick={removeImage}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="row" style={{ gap: 10 }}>
          <label className="btn btn-primary grow" style={{ cursor: 'pointer' }}>
            <Camera size={18} /> {t('knowledge.examTakePhoto')}
            <input type="file" accept="image/*" capture="environment" hidden onChange={pickImage} />
          </label>
          <label className="btn btn-ghost grow" style={{ cursor: 'pointer' }}>
            <ImageIcon size={18} /> {t('knowledge.examImportPhoto')}
            <input type="file" accept="image/*" hidden onChange={pickImage} />
          </label>
        </div>
      )}

      <div className="field">
        <label>{t('knowledge.examQuestion')}</label>
        <textarea
          className="input"
          rows={image ? 3 : 6}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={image ? t('knowledge.examPlaceholderWithPhoto') : t('knowledge.examPlaceholder')}
        />
      </div>

      <button className="btn btn-primary btn-block" disabled={!canSolve} onClick={solve}>
        <Sparkles size={16} /> {busy ? t('chat.generating') : t('knowledge.examSolve')}
      </button>

      {aiOff && (
        <div className="card tint-amber">
          <p className="small" style={{ fontWeight: 600 }}>{t(`aiOff.codes.${aiOff.code}`) || t('aiOff.title')}</p>
          <p className="tiny muted">{t('aiOff.body')}</p>
        </div>
      )}

      {busy && (
        <div className="card center" style={{ gap: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="typing"><i /><i /><i /></div>
          <span className="tiny muted">{image ? t('knowledge.examReading') : t('knowledge.examSolving')}</span>
        </div>
      )}

      {answer && !busy && (
        <div className="card tint-indigo">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <GraduationCap size={18} color="#4F46E5" />
            <span className="small" style={{ fontWeight: 700 }}>{t('knowledge.examAnswer')}</span>
          </div>
          <MarkdownLite text={answer} />
        </div>
      )}

      <p className="disclaimer">{t('knowledge.examDisclaimer')}</p>
    </div>
  );
}
