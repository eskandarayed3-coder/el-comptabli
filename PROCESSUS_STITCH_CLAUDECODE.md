# El Comptabli — Processus complet : Design Stitch → Code fonctionnel

> **Le principe en une phrase**
> Pour CHAQUE écran, tu fais 2 passes :
> **Passe 1 (Beauté)** → prompt de design collé dans Stitch → export Figma.
> **Passe 2 (Fonction)** → prompt Claude Code qui lit le Figma et code l'écran réel.

---

## VUE D'ENSEMBLE DU PIPELINE

```
   TOI                STITCH            FIGMA           CLAUDE CODE        RÉSULTAT
    │                   │                 │                  │               │
    │  colle le prompt  │                 │                  │               │
    ├──────────────────►│                 │                  │               │
    │                   │  génère l'écran │                  │               │
    │                   │  (beau design)  │                  │               │
    │                   ├────────────────►│  export Figma    │               │
    │                   │                 │  (éditable)      │               │
    │   copie le lien Figma ◄─────────────┤                  │               │
    │                                     │                  │               │
    │  colle le prompt Claude Code + lien Figma              │               │
    ├───────────────────────────────────────────────────────►│              │
    │                                     │  lit via Figma MCP│              │
    │                                     │                   ├──────────────►│
    │                                     │                   │  code + IA    │  écran
    │                                     │                   │  + Supabase   │  fonctionnel
    │                                     │                   │               │  et joli
```

**Setup une seule fois :** Figma MCP déjà connecté (✅ tu l'as). Projet Claude Code
initialisé avec le PROMPT 0 (fondations) — voir l'autre fichier de prompts.

---

## LES 2 RÈGLES D'OR

1. **UN écran à la fois.** Jamais tout d'un coup. Beauté → Fonction → écran suivant.
2. **La Passe 2 ne touche QUE l'apparence** si l'écran a déjà de la logique. Le code qui
   marche (IA, base de données, calculs) ne se casse pas pour du style.

---

# PROCESSUS ÉCRAN PAR ÉCRAN

Pour chaque écran ci-dessous : d'abord le **Prompt STITCH** (Passe 1), puis le
**Prompt CLAUDE CODE** (Passe 2). Fais-les dans l'ordre des écrans.

---

## ÉCRAN 1 — ACCUEIL / ONBOARDING

### 🎨 Passe 1 — À COLLER DANS STITCH
```
Design a mobile app onboarding/welcome screen for "El Comptabli", an AI tax and
accounting assistant for Tunisian entrepreneurs. Mobile-first, 390px width.
Style: clean, modern, trustworthy (finance + confidence). Primary color deep teal
(#0F766E), accent teal (#14B8A6), lots of white space, rounded-2xl cards, soft shadows.
Content: app logo "El Comptabli" at top with subtitle "AI tax & accounting assistant",
a small language toggle (FR / عربي), a warm welcome sentence, three feature cards
(Ask a tax question / See my deadlines / Estimate my taxes) each with a simple icon,
a large primary "Commencer" button, and a discreet legal disclaimer banner at the bottom.
```
→ Ajuste dans Stitch, puis **Export to Figma**, copie le lien du frame.

### ⚙️ Passe 2 — À COLLER DANS CLAUDE CODE
```
Voici le design Figma de l'écran Accueil : [COLLE LE LIEN FIGMA ICI].
Lis-le via le Figma MCP et crée l'écran d'accueil de El Comptabli (route app/page.tsx)
en reproduisant EXACTEMENT ce design : couleurs, espacements, typographie, disposition.
Utilise les composants du projet (<LangToggle />, <Disclaimer />). Le bouton "Commencer"
redirige vers /profil-activite. Textes via le dictionnaire i18n fr/ar, RTL géré.
Mobile-first 390px.
```

---

## ÉCRAN 2 — CHOIX D'ACTIVITÉ + RÉGIME FISCAL

### 🎨 Passe 1 — STITCH
```
Design a mobile screen "Choose your activity and tax regime" for El Comptabli.
Same visual identity: deep teal #0F766E, white background, rounded-2xl selectable cards,
soft shadows, 390px mobile. Two steps with a progress bar at top.
Step 1: selectable activity cards (Freelance/Service, Commerce, Artisanat, Café/Restaurant,
Profession libérale, Autre), each with an icon and a one-line example.
Step 2: tax regime cards (Régime forfaitaire, Régime réel, "Je ne sais pas") with subtitles.
A "Continuer" primary button, disabled until a selection is made.
```
→ Export to Figma, copie le lien.

### ⚙️ Passe 2 — CLAUDE CODE
```
Voici le design Figma de l'écran Choix d'activité : [LIEN FIGMA].
Lis-le via le Figma MCP et crée l'écran (route app/(app)/profil-activite) fidèle au design.
Fonctionnalités : sélection en 2 étapes avec barre de progression, bouton "Continuer"
désactivé sans sélection. À la validation, enregistre activity_type + tax_regime dans la
table Supabase `profiles` (crée la migration SQL si besoin), puis redirige vers /chat.
i18n fr/ar + RTL. Mobile-first.
```

---

## ÉCRAN 3 — CONVERSATION IA (le cœur)

### 🎨 Passe 1 — STITCH
```
Design a mobile AI chat screen for El Comptabli. Messaging style: assistant bubbles on
the left, user bubbles on the right. Deep teal #0F766E accents, clean white, rounded
bubbles, 390px mobile. Top: a discreet legal disclaimer banner. Below the welcome
message: 4 suggested-question chips (clickable). Bottom: a fixed input bar with a send
button. Include a subtle "assistant is typing..." indicator state.
```
→ Export to Figma, copie le lien.

### ⚙️ Passe 2 — CLAUDE CODE
```
Voici le design Figma de l'écran Chat : [LIEN FIGMA].
Lis-le via le Figma MCP et crée l'écran Conversation IA (route app/(app)/chat) fidèle au
design. FONCTIONNEL :
- Route API app/api/chat/route.ts appelant l'API Anthropic (claude-sonnet, clé en .env)
  en streaming.
- System prompt anti-hallucination : répond UNIQUEMENT sur la fiscalité/comptabilité
  tunisienne, dans la langue de l'utilisateur (darija/français), avec exemples concrets ;
  recommande explicitement un expert-comptable dès qu'on dépasse une réponse pédagogique
  sûre ; n'invente jamais un chiffre de loi.
- Fonction retrieveContext() réservée pour brancher le RAG plus tard (retourne un contexte
  statique pour l'instant).
- Historise dans Supabase (table `messages`) + migration SQL.
- Chips de questions suggérées adaptées au type d'activité du profil.
i18n fr/ar + RTL. Ne touche qu'au visuel si l'écran existe déjà ; sinon crée-le complet.
```

---

## ÉCRAN 4 — ÉCHÉANCES FISCALES

### 🎨 Passe 1 — STITCH
```
Design a mobile "Tax deadlines" screen for El Comptabli. Deep teal #0F766E, white,
rounded-2xl cards, 390px mobile. A grouped list (Monthly / Quarterly / Yearly). Each
deadline is a card: title, date/frequency, a one-sentence plain explanation, an urgency
color badge (orange/red when near), and a small "Me rappeler" button. Discreet disclaimer.
```
→ Export to Figma, copie le lien.

### ⚙️ Passe 2 — CLAUDE CODE
```
Voici le design Figma de l'écran Échéances : [LIEN FIGMA].
Lis-le via le Figma MCP et crée l'écran (route app/(app)/echeances) fidèle au design.
Affiche les échéances selon le régime du profil (forfaitaire/réel) depuis un fichier
lib/data/echeances.ts contenant des placeholders RÉALISTES clairement marqués
"// À VALIDER avec un expert-comptable". Groupe par Mensuel/Trimestriel/Annuel, badge
d'urgence, bouton "Me rappeler" (toast "Rappels bientôt disponibles"). i18n fr/ar + RTL.
```

---

## ÉCRAN 5 — ESTIMATEUR FISCAL

### 🎨 Passe 1 — STITCH
```
Design a mobile "Tax estimator" screen for El Comptabli. Deep teal #0F766E, white,
rounded-2xl, 390px mobile. A form: "Chiffre d'affaires" (TND) and "Charges" (TND) inputs,
an "Estimer" button. Below, a results area (animated) with cards showing estimated VAT,
estimated income tax, and net result, PLUS a step-by-step calculation breakdown.
A very visible warning banner: "Estimation indicative, not an official amount".
```
→ Export to Figma, copie le lien.

### ⚙️ Passe 2 — CLAUDE CODE
```
Voici le design Figma de l'écran Estimateur : [LIEN FIGMA].
Lis-le via le Figma MCP et crée l'écran (route app/(app)/estimateur) fidèle au design.
Toute la logique de calcul va dans lib/fiscal/estimateur.ts avec les TAUX en constantes
commentées "// À VALIDER — taux fiscal tunisien" (jamais en dur dans le composant).
Affiche le détail du calcul étape par étape + le bandeau "estimation indicative".
Adapte les champs selon le régime du profil. i18n fr/ar + RTL.
```

---

## ÉCRAN 6 — SUIVI + DASHBOARD

### 🎨 Passe 1 — STITCH
```
Design a mobile "Financial tracking + dashboard" screen for El Comptabli. Deep teal
#0F766E, white, rounded-2xl, 390px mobile. Top: 4 KPI cards (Revenue, Expenses, Profit,
Estimated VAT) and a small line chart (income vs expenses over months). Below: a "+ Ajouter"
button, a transactions list with category badges and colored amounts (green income / red
expense), and a running balance. Clean, dashboard-like.
```
→ Export to Figma, copie le lien.

### ⚙️ Passe 2 — CLAUDE CODE
```
Voici le design Figma de l'écran Suivi/Dashboard : [LIEN FIGMA].
Lis-le via le Figma MCP et crée l'écran (route app/(app)/suivi) fidèle au design.
FONCTIONNEL : table Supabase `transactions` (+ migration SQL), CRUD complet (modal
d'ajout : type, montant, catégorie, date, note), KPI recalculés depuis les données,
graphique recharts income vs dépenses, solde courant. i18n fr/ar + RTL.
```

---

## ÉCRAN 7 — SCANNER DE FACTURES (OCR)

### 🎨 Passe 1 — STITCH
```
Design a mobile "Invoice scanner" screen for El Comptabli, marked as a Premium feature
(small premium badge). Deep teal #0F766E, white, rounded-2xl, 390px mobile. A big
"Take a photo / Import" button (image or PDF), an "Analyzing..." state, then a pre-filled
form: Supplier, Invoice number, Date, Amount HT, VAT, Total TTC, Category. Editable fields
and a "Save" button.
```
→ Export to Figma, copie le lien.

### ⚙️ Passe 2 — CLAUDE CODE
```
Voici le design Figma de l'écran Scanner : [LIEN FIGMA].
Lis-le via le Figma MCP et crée l'écran (route app/(app)/scanner) fidèle au design.
FONCTIONNEL : upload vers Supabase Storage (bucket "invoices"), route API app/api/ocr/route.ts
appelant l'API Anthropic vision pour extraire un JSON strict {fournisseur, numero, date,
ht, tva, ttc}, formulaire pré-rempli et corrigeable, "Enregistrer" crée une transaction
de type Dépense. Badge Premium visible. i18n fr/ar + RTL.
```

---

## APRÈS LES 7 ÉCRANS

Ces deux prompts n'ont pas besoin de Stitch (pas de design à dessiner) — direct Claude Code :

**Auth Supabase :**
```
Ajoute l'authentification Supabase (login/signup email + mot de passe), protège les routes
via middleware @supabase/ssr, relie le profil au user.id, ajoute un écran Profil (langue,
régime, déconnexion). Ajoute les RLS policies pour que chaque user ne voie que ses données.
Fournis le SQL des policies.
```

**Déploiement Vercel (mise en LIVE) :**
```
Prépare El Comptabli pour Vercel : vérifie toutes les variables d'env, corrige le build
(`npm run build` sans erreur), mets à jour .env.local.example + README. Donne-moi la
checklist exacte : pousser sur GitHub → importer dans Vercel → ajouter les variables d'env
→ déployer.
```

---

## RÉCAP DE L'ORDRE COMPLET

```
1. Claude Code : PROMPT 0 (fondations)              ← une seule fois
2. Écran 1 Accueil     : Stitch → Figma → Claude Code
3. Écran 2 Activité    : Stitch → Figma → Claude Code
4. Écran 3 Chat IA     : Stitch → Figma → Claude Code   ← le cœur
5. Écran 4 Échéances   : Stitch → Figma → Claude Code
6. Écran 5 Estimateur  : Stitch → Figma → Claude Code
7. Écran 6 Suivi       : Stitch → Figma → Claude Code
8. Écran 7 Scanner     : Stitch → Figma → Claude Code
9. Claude Code : Auth Supabase
10. Claude Code : Déploiement Vercel  → APP EN LIVE 🚀
```

---

## ⚠️ LE POINT QUI DÉCIDE DE TOUT

Le design (Stitch) rend l'app belle. Le code (Claude Code) la rend fonctionnelle.
Mais ce qui décide si El Comptabli est VRAIMENT utilisable, c'est le **contenu fiscal**
derrière le chat, les échéances et l'estimateur. Les taux et échéances générés sont des
**placeholders "À VALIDER"** — ils doivent être remplacés par de vraies données fiscales
tunisiennes vérifiées avant de conseiller de vrais entrepreneurs. C'est la brique la plus
importante du projet, et aucun outil de design ou de code ne la fournit à ta place.
```
