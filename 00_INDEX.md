# 📁 EL COMPTABLI — Dossier de projet complet

Kit de démarrage pour construire l'app **El Comptabli** (assistant fiscal/comptable IA pour entrepreneurs tunisiens). Tout ce dont tu as besoin pour lancer, dans l'ordre.

---

## 📄 Contenu du dossier

| Fichier | À quoi ça sert | Quand l'utiliser |
|---|---|---|
| **00_INDEX.md** | Ce fichier — la carte du dossier | Maintenant |
| **PROMPTS_CLAUDE_CODE.md** | 10 prompts pour construire l'app écran par écran | Étape 1 : coder l'app |
| **PROCESSUS_STITCH_CLAUDECODE.md** | Le flux design Stitch → Figma → Claude Code | Étape 2 : embellir |
| **Dossier_Design_UXUI_ElComptabli.docx** | Le dossier de design complet (19 pages) | Référence design |
| **PROMPTS_RAG.md** | 5 prompts pour brancher la base fiscale au chat | Étape 3 : le cerveau IA |
| **kb/** (6 fichiers) | La base de connaissance fiscale/comptable | Nourrit le chat |

---

## 🗺️ Dans quel ordre travailler

### Phase 1 — Préparer (aujourd'hui, 30 min)
Crée tes comptes : **Supabase**, **Vercel**, **clé API Anthropic**, **GitHub**.

### Phase 2 — Construire l'app (demain)
Ouvre **Claude Code** et suis **PROMPTS_CLAUDE_CODE.md** :
- PROMPT 0 (fondations) → PROMPT 1 à 7 (écrans) → PROMPT 8 (auth) → PROMPT 9 (Vercel).
- Résultat : app fonctionnelle **en ligne**.

### Phase 3 — Brancher le cerveau fiscal
Copie le dossier **kb/** à la racine du projet, puis suis **PROMPTS_RAG.md** :
- RAG-0 → RAG-1 → RAG-2 → RAG-3 → RAG-4.
- Résultat : le chat répond à partir de ta base vérifiée, sans inventer.

### Phase 4 — Embellir (après)
Suis **PROCESSUS_STITCH_CLAUDECODE.md** : design Stitch → Figma → Claude Code, écran par écran.

### Phase 5 — Valider le contenu fiscal (ton travail d'expert)
Ouvre les fichiers **kb/** et remplace chaque **[À_VÉRIFIER]** par la valeur officielle
(jibaya.tn, Ministère des Finances, loi de finances). Relance l'ingestion RAG.

---

## ⚠️ Le point qui décide de tout

Le design et le code peuvent être parfaits — mais El Comptabli ne sera **utilisable** que si
le contenu fiscal est **exact**. Les fichiers kb/ contiennent des labels :
- `[VÉRIFIÉ 2026]` = utilisable
- `[À_VÉRIFIER]` = à confirmer sur source officielle AVANT la mise en production

C'est ta zone d'expertise (étudiant compta-finance) et ton avantage sur n'importe quel dev.

---

## ✅ État d'avancement

- [x] Prompts de construction (Claude Code)
- [x] Processus de design (Stitch → Figma)
- [x] Dossier UX/UI complet
- [x] Base de connaissance fiscale de départ (6 fiches)
- [x] Pipeline RAG (prompts)
- [ ] Comptes créés (Supabase/Vercel/Anthropic/GitHub) ← à toi
- [ ] App construite en Claude Code ← à toi
- [ ] Contenu [À_VÉRIFIER] validé ← à toi
- [ ] App déployée sur Vercel ← à toi

### Prochaines pièces possibles (demande-les quand tu veux)
- Fiches fiscales en plus : CNSS détaillé, journaux comptables, états financiers NCT, ratios/analyse financière
- Documents business : business plan, pitch deck, étude de marché, modèle financier
- Schéma Supabase complet en un seul SQL
- Dictionnaire i18n FR/darija de départ
