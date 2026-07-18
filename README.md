# Base de connaissance El Comptabli (RAG)

Ce dossier contient les fichiers `.md` qui **nourrissent l'assistant IA** d'El Comptabli.
Chaque fichier est une fiche de connaissance vérifiée sur la fiscalité ou la comptabilité tunisienne.

## Fichiers

| Fichier | Domaine | Statut |
|---|---|---|
| `00_fiscalite_tunisie_apercu.md` | Vue d'ensemble fiscale + orientation | Partiellement vérifié |
| `01_tva_tunisie.md` | TVA : taux, calcul, déclaration | Vérifié 2026 |
| `02_irpp_is_forfaitaire.md` | IRPP, IS, forfaitaire, CNSS, CSS | Vérifié 2026 (partiel) |
| `03_echeances_fiscales.md` | Calendrier des obligations | **À vérifier** (placeholders) |
| `10_plan_comptable_tunisien.md` | Plan comptable SCE : classes + comptes | Structure vérifiée |

## Convention des labels (IMPORTANT)

Chaque chiffre ou règle porte un label de fiabilité :

- `[VÉRIFIÉ 2026]` → confirmé sur une source fiable, utilisable.
- `[À_VÉRIFIER]` → structure correcte mais **chiffre/date à confirmer sur la source officielle avant mise en prod**.
- `[À_CRÉER]` → fiche référencée mais pas encore écrite.

> RÈGLE D'OR : l'assistant ne doit **jamais présenter un `[À_VÉRIFIER]` comme certain**.
> Sur ces points, il répond avec prudence et recommande de vérifier / consulter un expert-comptable.

## Frontmatter (métadonnées en tête de chaque fichier)

Le bloc YAML en haut de chaque `.md` (`id`, `domaine`, `regime`, `statut_verification`,
`sources`, `tags`...) sert à :
- **filtrer** la connaissance selon le profil de l'utilisateur (ex. ne montrer les fiches
  `regime: [reel]` qu'aux utilisateurs au réel) ;
- **tracer les sources** de chaque réponse ;
- **prioriser** les fiches vérifiées.

## Comment ces fichiers alimentent l'app (pipeline RAG)

```
Fichiers .md (ce dossier)
   │  1. Découpage en "chunks" (morceaux) par section
   ▼
Embeddings (vecteurs)
   │  2. Stockés dans une table Supabase (pgvector) ou un index vectoriel
   ▼
retrieveContext(question)      ← fonction réservée dans app/api/chat/route.ts
   │  3. Retrouve les chunks les plus pertinents pour la question
   ▼
System prompt + chunks → API Anthropic
   │  4. L'IA répond EN S'APPUYANT sur ces chunks (pas d'invention)
   ▼
Réponse sourcée à l'utilisateur
```

### Étapes concrètes côté Claude Code (prompt à donner plus tard)
1. Créer une table Supabase `knowledge_chunks` (id, source_file, section, content, embedding vector).
2. Script d'ingestion : lire chaque `.md`, découper par titre `##`, générer les embeddings, insérer.
3. Implémenter `retrieveContext(question)` : embedding de la question → recherche des N chunks
   les plus proches (cosine) → renvoyer leur texte.
4. Injecter ces chunks dans le system prompt du chat, avec la consigne :
   « Réponds uniquement à partir du CONTEXTE fourni. Si le contexte ne suffit pas ou porte un
   label À_VÉRIFIER, dis-le et recommande un expert-comptable. Ne jamais inventer un chiffre. »

## Prochaines fiches à ajouter
- `03_cnss_social.md` (détail cotisations indépendants)
- `11_journaux_comptables.md` (journal, grand livre, balance)
- `12_etats_financiers_nct.md` (bilan, état de résultat, SIG)
- Fiches par persona/activité (freelance, café, artisan)

## Avertissement global
Contenu pédagogique et indicatif. Ne remplace pas un expert-comptable agréé.
Chaque chiffre `[À_VÉRIFIER]` doit être validé sur la source officielle
(Ministère des Finances, jibaya.tn, loi de finances de l'exercice) avant tout usage réel.
