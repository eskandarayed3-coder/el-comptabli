# El Comptabli — Prompts Claude Code (écran par écran)

> **Mode d'emploi**
> 1. Ouvre un terminal, crée un dossier `el-comptabli`, entre dedans, lance `claude`.
> 2. Copie-colle les prompts **dans l'ordre**, un par un. Attends que Claude Code finisse chaque étape avant de passer au suivant.
> 3. Si tu as un design Stitch/Figma pour l'écran, ajoute à la fin du prompt :
>    *« Utilise le design Figma de cet écran via le Figma MCP comme référence visuelle exacte. »*
> 4. Commande utile après chaque écran : `npm run dev` puis ouvre http://localhost:3000

---

## PROMPT 0 — Fondations du projet (à lancer en premier, une seule fois)

```
Tu es mon développeur senior sur un projet from scratch. On construit "El Comptabli",
une web app d'assistant fiscal/comptable IA pour entrepreneurs tunisiens.

STACK OBLIGATOIRE :
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui pour les composants
- Supabase (base de données + auth) — client déjà prévu, clés en .env.local
- lucide-react pour les icônes
- Déploiement cible : Vercel

CONTRAINTES PRODUIT :
- Mobile-first (la cible utilise surtout son téléphone). Largeur de référence 390px.
- Bilingue : Français et Darija tunisienne. Prépare une structure i18n simple
  (un fichier de dictionnaire { fr, ar }), darija par défaut, avec un toggle FR/AR.
  Le layout doit gérer le RTL pour l'arabe.
- Un disclaimer légal permanent doit pouvoir s'afficher (outil pédagogique,
  ne remplace pas un expert-comptable, pas de télédéclaration officielle).

IDENTITÉ VISUELLE :
- Style moderne, épuré, rassurant (finance + confiance).
- Couleur primaire : un bleu-vert profond (#0F766E teal-700) + accent (#14B8A6).
- Beaucoup de blanc, coins arrondis (rounded-2xl), ombres douces, typographie lisible.

CE QUE JE VEUX MAINTENANT :
1. Initialise le projet Next.js 15 + TypeScript + Tailwind + shadcn/ui.
2. Installe et configure : @supabase/supabase-js, @supabase/ssr, lucide-react.
3. Crée la structure de dossiers : app/, components/, lib/ (avec lib/supabase/client.ts
   et lib/supabase/server.ts), lib/i18n/ (dictionnaire fr/ar + hook useT()).
4. Crée un layout global mobile-first avec : une barre de navigation basse (bottom nav)
   à 5 onglets (Accueil, Échéances, Scanner, Suivi, Profil) — icônes lucide, l'onglet
   actif en teal. Le contenu occupe l'espace au-dessus.
5. Crée un composant <Disclaimer /> réutilisable (bandeau discret) et un composant
   <LangToggle /> (FR / عربي).
6. Crée un fichier .env.local.example avec les variables Supabase à remplir.
7. Crée un README court expliquant comment lancer le projet.

Ne code PAS encore les écrans métier — juste les fondations, la nav et le layout.
Quand c'est fait, lance `npm run dev` et dis-moi ce qui s'affiche.
```

---

## PROMPT 1 — Écran Accueil (Onboarding + disclaimer + langue)

```
Crée l'écran d'accueil / onboarding de El Comptabli (route: app/page.tsx ou app/(app)/accueil).

Contenu :
- En haut : logo texte "El Comptabli" + sous-titre "Assistant fiscal & comptable IA".
- Le <LangToggle /> FR / عربي visible.
- Un bloc de bienvenue chaleureux en darija par défaut (ex : « أهلا بيك. هوني تفهم الجباية،
  تحسب الضرائب، وتنظّم مصاريفك — بلغة تفهمها. ») avec la traduction FR dans le dictionnaire.
- 3 cartes "ce que tu peux faire" : Poser une question fiscale / Voir mes échéances /
  Estimer mes impôts — chacune avec une icône lucide et un texte court.
- Un gros bouton primaire "Commencer" → redirige vers l'écran Choix d'activité.
- En bas, le <Disclaimer /> permanent.

Contraintes : mobile-first 390px, teal primaire, coins arrondis, animations douces
d'apparition (fade/slide léger). Textes tirés du dictionnaire i18n (fr + ar), RTL géré.
```

---

## PROMPT 2 — Écran Choix d'activité + régime fiscal

```
Crée l'écran "Choix d'activité et régime fiscal" (route: app/(app)/profil-activite).

Étape 1 — Type d'activité (cartes sélectionnables, une seule) :
Freelance / Prestation de service, Commerce (achat-revente), Artisanat,
Petit café / Restauration, Profession libérale, Autre.
Chaque carte : icône lucide + libellé + une phrase d'exemple.

Étape 2 — Régime fiscal (cartes sélectionnables) :
- Régime forfaitaire (avec sous-texte : "petites structures, impôt simplifié")
- Régime réel (avec sous-texte : "TVA, comptabilité détaillée")
- "Je ne sais pas" → affiche une note : l'IA t'aidera à déterminer ton régime.

Comportement :
- Barre de progression en haut (étape 1/2, 2/2).
- Bouton "Continuer" désactivé tant qu'aucune sélection.
- À la validation : enregistre le choix dans Supabase (table profiles: activity_type,
  tax_regime) pour l'utilisateur connecté, sinon en localStorage si pas encore d'auth.
- Puis redirige vers l'écran Conversation IA.

Style cohérent avec le reste : mobile-first, teal, cartes rounded-2xl, i18n fr/ar + RTL.
Crée aussi la migration/SQL Supabase pour la table `profiles` si elle n'existe pas
(id uuid ref auth.users, activity_type text, tax_regime text, lang text, created_at).
```

---

## PROMPT 3 — Écran Conversation IA (le cœur du produit)

```
Crée l'écran "Conversation IA" (route: app/(app)/chat) — c'est le cœur de El Comptabli.

Interface :
- Style messagerie : bulles utilisateur (à droite) et assistant (à gauche).
- Zone de saisie en bas fixée, bouton envoyer, support Entrée pour envoyer.
- Au premier chargement : message d'accueil de l'assistant + 4 questions suggérées
  en "chips" cliquables adaptées au type d'activité choisi
  (ex : "Est-ce que je dois facturer la TVA ?", "Comment déclarer mes revenus ?",
   "C'est quoi le régime forfaitaire ?", "Quelles échéances me concernent ?").
- Indicateur "l'assistant écrit..." pendant la réponse.
- Le <Disclaimer /> reste visible (bandeau discret en haut ou pied).

Backend :
- Crée une route API app/api/chat/route.ts qui appelle l'API Anthropic
  (modèle claude-sonnet, clé dans .env : ANTHROPIC_API_KEY), en streaming.
- IMPORTANT (anti-hallucination) : le system prompt doit imposer que l'assistant
  répond UNIQUEMENT sur la fiscalité/comptabilité tunisienne, dans la langue de
  l'utilisateur (darija ou français), avec des exemples concrets, et qu'il DOIT
  répondre "Je te recommande de consulter un expert-comptable certifié pour ce cas"
  dès qu'une situation dépasse une réponse pédagogique sûre. Il ne doit jamais
  inventer un chiffre de loi précis dont il n'est pas certain.
- Prévois un emplacement clair dans le code (fonction `retrieveContext()`) où on
  branchera plus tard le RAG sur la base de connaissance fiscale. Pour l'instant,
  laisse-la retourner un contexte statique de base que je te fournirai.
- Historise la conversation dans Supabase (table `messages`: id, user_id, role,
  content, created_at) + crée la migration SQL correspondante.

Style : mobile-first, teal, i18n fr/ar + RTL, fluide.
```

---

## PROMPT 4 — Écran Échéances fiscales

```
Crée l'écran "Échéances fiscales" (route: app/(app)/echeances).

Contenu :
- Affiche un calendrier / une liste des obligations fiscales selon le régime de
  l'utilisateur (forfaitaire ou réel), récupéré depuis son profil Supabase.
- Chaque échéance = une carte : titre (ex : "Déclaration TVA mensuelle"), date/fréquence,
  et UNE phrase d'explication simple ("Tu déclares la TVA collectée moins la TVA payée").
- Regroupe par : Mensuel / Trimestriel / Annuel.
- Mets un badge de couleur selon l'urgence (échéance proche = orange/rouge).
- Bouton "Me rappeler" sur chaque carte (pour l'instant : ouvre juste un toast
  "Rappels bientôt disponibles" — la vraie notif viendra plus tard).

Données :
- Crée un fichier lib/data/echeances.ts avec un jeu d'échéances par régime
  (forfaitaire vs réel). Mets des placeholders RÉALISTES mais marqués clairement
  comme "à valider avec un expert-comptable" — je te donnerai le contenu fiscal exact
  ensuite pour remplacer les placeholders.
- Le <Disclaimer /> reste visible.

Style : mobile-first, teal, i18n fr/ar + RTL.
```

---

## PROMPT 5 — Écran Estimateur fiscal (TVA + IRPP/IS)

```
Crée l'écran "Estimateur fiscal" (route: app/(app)/estimateur).

Formulaire :
- Champ "Chiffre d'affaires" (TND), champ "Charges / dépenses" (TND).
- Selon le régime du profil, adapte les champs (ex : TVA seulement en régime réel).
- Bouton "Estimer".

Résultat (affiché sous le formulaire, animé) :
- TVA estimée (si applicable), IRPP ou IS estimé, résultat net estimé.
- DÉTAIL DU CALCUL affiché étape par étape (formule → chiffres → résultat), pas juste
  le total, pour que l'utilisateur comprenne.
- Bandeau bien visible : "⚠️ Estimation indicative — ce n'est pas un montant officiel.
  Consulte un expert-comptable pour ta déclaration réelle."

Logique :
- Mets toute la logique de calcul dans lib/fiscal/estimateur.ts, avec des TAUX
  déclarés en constantes en haut du fichier et commentés "// À VALIDER — taux fiscal
  tunisien". Je remplacerai ces taux par les valeurs exactes ensuite.
- Ne code pas les taux en dur dans le composant : tout passe par ce fichier.

Style : mobile-first, teal, i18n fr/ar + RTL, résultat en cartes claires.
```

---

## PROMPT 6 — Écran Suivi recettes / dépenses + Dashboard

```
Crée deux vues reliées : "Suivi financier" (route: app/(app)/suivi) et un mini
"Dashboard" en haut de cette même page.

Dashboard (en haut) :
- 4 cartes KPI : Chiffre d'affaires du mois, Dépenses du mois, Profit, TVA estimée.
- Un petit graphique (recharts) : évolution recettes vs dépenses sur les derniers mois.

Suivi (en dessous) :
- Bouton "+ Ajouter" ouvrant un formulaire (modal) : type (Recette/Dépense), montant,
  catégorie (liste : Ventes, Achats, Loyer, Carburant, Salaires, Autre), date, note.
- Liste des transactions, triées par date, avec catégorie en badge et montant coloré
  (vert recette / rouge dépense).
- Solde courant affiché.

Données :
- Table Supabase `transactions` (id, user_id, type, amount, category, note, date,
  created_at) + migration SQL.
- CRUD complet (ajouter, lister, supprimer). Recalcule les KPI à partir des données.

Style : mobile-first, teal, i18n fr/ar + RTL, KPIs en rounded-2xl.
```

---

## PROMPT 7 — Écran Scanner de factures (OCR) — version "squelette"

```
Crée l'écran "Scanner de factures" (route: app/(app)/scanner).

Interface :
- Gros bouton "Prendre une photo / Importer" (accepte image ou PDF).
- Après upload : upload le fichier vers Supabase Storage (bucket "invoices").
- Affiche un état "Analyse en cours..." puis un FORMULAIRE PRÉ-REMPLI avec les champs :
  Fournisseur, N° facture, Date, Montant HT, TVA, Montant TTC, Catégorie.

OCR :
- Crée une route API app/api/ocr/route.ts. Pour l'instant, implémente-la en appelant
  l'API Anthropic (vision) : on envoie l'image et on demande d'extraire en JSON strict
  { fournisseur, numero, date, ht, tva, ttc }. Parse le JSON et renvoie-le au front
  pour pré-remplir le formulaire.
- L'utilisateur peut corriger les champs puis "Enregistrer" → crée une transaction
  de type Dépense dans la table `transactions` + garde le lien vers le fichier.

Marque cette fonctionnalité comme "Premium" dans l'UI (petit badge), mais laisse-la
fonctionnelle en dev. Style : mobile-first, teal, i18n fr/ar + RTL.
```

---

## PROMPT 8 — Auth Supabase (à faire quand les écrans tournent)

```
Ajoute l'authentification Supabase à El Comptabli.

- Écran de connexion / inscription (email + mot de passe, et magic link si simple).
- Protège les routes de l'app (chat, suivi, scanner, echeances, estimateur) : redirige
  vers /login si non connecté. Utilise @supabase/ssr (middleware Next.js).
- Après login, relie le profil (activity_type, tax_regime) au user.id.
- Ajoute un écran Profil (onglet 5 de la bottom nav) : infos user, langue, régime,
  bouton déconnexion, et le lien vers le disclaimer complet.

Mets à jour les tables (profiles, messages, transactions) avec les bonnes RLS policies
Supabase (chaque user ne voit que ses données). Fournis le SQL des policies.
```

---

## PROMPT 9 — Préparer le déploiement Vercel

```
Prépare El Comptabli pour le déploiement sur Vercel.

- Vérifie que toutes les variables d'env sont bien lues côté serveur/client
  (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
   ANTHROPIC_API_KEY).
- Crée un fichier .env.local.example à jour + une section "Déploiement" dans le README
  listant les variables à mettre dans Vercel.
- Corrige les erreurs de build (`npm run build` doit passer sans erreur).
- Donne-moi la checklist exacte des étapes pour : pousser le repo sur GitHub,
  importer le projet dans Vercel, ajouter les variables d'env, et déclencher le déploiement.
```

---

## Ordre de bataille recommandé

1. **PROMPT 0** (fondations) — obligatoire en premier.
2. **PROMPT 1 → 6** dans l'ordre : chaque écran s'ajoute proprement.
3. **PROMPT 8** (auth) une fois que les écrans s'affichent.
4. **PROMPT 7** (scanner OCR) — plus lourd, à faire quand le reste tourne.
5. **PROMPT 9** (déploiement Vercel) — le dernier, pour mettre l'app **en live**.

## Ce que je dois encore te fournir (dis-le-moi quand tu es prêt)

- **Le contexte fiscal de base** pour `retrieveContext()` (Prompt 3) et pour remplacer les
  placeholders "À VALIDER" des Prompts 4 et 5. → c'est l'option "Contenu fiscal (RAG)".
- **Le schéma Supabase complet** en un seul fichier SQL, si tu préfères tout créer d'un coup
  plutôt que migration par migration.

> ⚠️ Rappel honnête : les taux fiscaux et échéances générés par Claude Code sont des
> **placeholders**. Ils DOIVENT être validés avec de vraies sources fiscales tunisiennes
> avant que l'app conseille de vrais entrepreneurs. C'est le point le plus important du projet.
