# El Comptabli — Prompts Claude Code : Pipeline RAG

> **But** : brancher tes fichiers de connaissance (`kb/*.md`) dans le chat IA, pour que
> l'assistant réponde À PARTIR de ta base fiscale vérifiée — sans inventer.
>
> **Prérequis** : projet monté (PROMPT 0), écran Chat créé (PROMPT 3), Supabase configuré,
> `ANTHROPIC_API_KEY` dans `.env`. Copie ton dossier `kb/` à la racine du projet avant de commencer.
>
> **Ordre** : RAG-0 → RAG-1 → RAG-2 → RAG-3 → RAG-4. Un prompt à la fois.

---

## RAG-0 — Préparer la base vectorielle Supabase

```
On ajoute un système RAG (Retrieval-Augmented Generation) à El Comptabli pour que le chat
réponde à partir d'une base de connaissance fiscale/comptable tunisienne vérifiée.

Étape base de données (Supabase + pgvector) :
1. Active l'extension "vector" (pgvector) sur le projet Supabase.
2. Crée une table `knowledge_chunks` avec les colonnes :
   - id (uuid, pk, default gen_random_uuid())
   - source_file (text)        -- ex: "01_tva_tunisie.md"
   - domaine (text)            -- fiscalite | comptabilite
   - sous_domaine (text)
   - regime (text[])           -- ex: {reel} ou {forfaitaire,reel}
   - statut_verification (text)-- verifie_2026 | a_verifier | ...
   - section (text)            -- le titre ## de la section
   - content (text)            -- le texte du chunk
   - embedding vector(1536)    -- adapte la dimension au modèle d'embedding choisi
   - created_at (timestamptz default now())
3. Crée un index ivfflat sur embedding (vector_cosine_ops) pour la recherche par similarité.
4. Crée une fonction SQL RPC `match_chunks(query_embedding vector, match_count int,
   filter_regime text)` qui retourne les N chunks les plus proches (cosine), en filtrant
   optionnellement par régime (un chunk passe si son regime contient filter_regime OU si
   filter_regime est null).
5. Fournis-moi tout le SQL (migration) dans un fichier supabase/migrations/, et les RLS
   policies : lecture publique des chunks (ce sont des connaissances générales), écriture
   réservée au service role.

Donne-moi aussi la commande pour appliquer la migration.
```

---

## RAG-1 — Script d'ingestion des fichiers .md

```
Crée un script d'ingestion qui lit les fichiers de connaissance et remplit la table
knowledge_chunks.

Fichier : scripts/ingest-kb.ts (exécutable via `npx tsx scripts/ingest-kb.ts`).

Comportement :
1. Lit tous les fichiers de kb/*.md.
2. Pour chaque fichier :
   - Parse le frontmatter YAML en tête (id, domaine, sous_domaine, regime,
     statut_verification, source_file...). Utilise un parseur YAML (gray-matter).
   - Découpe le corps en chunks PAR SECTION de niveau ## (chaque titre ## commence un
     nouveau chunk ; garde le titre comme `section`). Si une section dépasse ~1500 caractères,
     re-découpe-la en sous-morceaux qui gardent le même titre de section.
3. Pour chaque chunk, génère un embedding via l'API Anthropic ou un modèle d'embedding
   compatible (précise dans le code quel endpoint/modèle est utilisé et la dimension du
   vecteur ; adapte la colonne vector(N) en conséquence si besoin).
4. Insère chaque chunk dans knowledge_chunks (source_file, domaine, sous_domaine, regime,
   statut_verification, section, content, embedding).
5. Avant insertion, VIDE la table (delete all) pour permettre une réingestion propre.
6. Affiche un résumé : nombre de fichiers lus, nombre de chunks créés, erreurs éventuelles.

Le script utilise SUPABASE_SERVICE_ROLE_KEY (jamais la clé publique) et lit .env.local.
Gère les erreurs proprement (fichier illisible, embedding échoué) sans tout arrêter.
```

---

## RAG-2 — Implémenter retrieveContext()

```
Implémente la fonction retrieveContext() dans le code du chat (là où on avait laissé un
placeholder statique, dans app/api/chat/route.ts ou un lib/rag.ts dédié).

Signature : retrieveContext(question: string, regime?: string): Promise<RetrievedChunk[]>

Comportement :
1. Génère l'embedding de la question (même modèle/dimension que l'ingestion).
2. Appelle la fonction RPC Supabase match_chunks(query_embedding, match_count=5,
   filter_regime=regime ?? null).
3. Retourne les chunks trouvés avec leurs métadonnées : content, section, source_file,
   statut_verification.
4. Si aucun chunk pertinent (score trop faible ou liste vide), retourne un tableau vide —
   le chat devra alors répondre prudemment.

Expose aussi un helper formatContextForPrompt(chunks) qui assemble les chunks en un bloc
texte lisible pour le system prompt, en préfixant chaque chunk par sa source et son statut,
par ex :
   [Source: 01_tva_tunisie.md — section "Les taux applicables" — statut: verifie_2026]
   <contenu du chunk>
   ---
```

---

## RAG-3 — System prompt anti-hallucination + branchement

```
Modifie la route du chat (app/api/chat/route.ts) pour utiliser le RAG à chaque message.

Flux à chaque question utilisateur :
1. Récupère le régime de l'utilisateur depuis son profil Supabase (forfaitaire/réel), si connu.
2. Appelle retrieveContext(question, regime) → chunks.
3. Construis le system prompt avec le CONTEXTE injecté (via formatContextForPrompt).
4. Appelle l'API Anthropic en streaming avec ce system prompt.

SYSTEM PROMPT (à implémenter, adapte la formulation) :
"""
Tu es l'assistant fiscal et comptable d'El Comptabli, pour les entrepreneurs tunisiens.
Réponds dans la langue de l'utilisateur (darija tunisienne ou français), de façon simple
et concrète, avec un exemple chiffré quand c'est utile.

RÈGLES ABSOLUES :
1. Réponds UNIQUEMENT à partir du CONTEXTE fourni ci-dessous. N'invente jamais un taux,
   un seuil, une date ou un numéro de compte qui n'est pas dans le contexte.
2. Si un élément du contexte porte le statut "a_verifier", présente-le comme une indication
   à confirmer, PAS comme une certitude, et invite à vérifier auprès d'un expert-comptable
   ou sur jibaya.tn.
3. Si le contexte ne contient pas de quoi répondre, dis-le honnêtement et recommande de
   consulter un expert-comptable certifié. Ne comble jamais un manque par une supposition.
4. Rappelle, quand c'est pertinent, qu'El Comptabli est un outil pédagogique et ne remplace
   pas un expert-comptable, et n'est pas un outil de télédéclaration officielle.
5. Cite ta source quand tu donnes un chiffre (ex : "d'après la fiche TVA").

CONTEXTE :
{chunks formatés ici}
"""

Si retrieveContext renvoie un tableau vide, le system prompt doit basculer sur une réponse
prudente : expliquer que tu n'as pas cette information dans ta base vérifiée et orienter
vers un expert.

Historise toujours la conversation dans la table messages (déjà en place).
```

---

## RAG-4 — Afficher les sources dans l'UI du chat

```
Dans l'écran Chat (app/(app)/chat), affiche les sources utilisées sous chaque réponse de
l'assistant, pour renforcer la confiance.

- Sous une bulle assistant, affiche discrètement les fichiers sources utilisés (ex :
  "Sources : TVA, Plan comptable") sous forme de petits badges gris cliquables.
- Si une des sources utilisées a le statut "a_verifier", affiche un mini-badge orange
  "à vérifier" à côté, pour être transparent avec l'utilisateur.
- La route API doit donc renvoyer, en plus du texte streamé, la liste des sources
  (source_file + statut) des chunks utilisés. Passe-les au front après le streaming.

Style cohérent : badges arrondis, teal pour les sources normales, orange pour "à vérifier".
```

---

## Vérifier que ça marche (checklist)

Après RAG-3, teste avec de vraies questions :

```
Questions de test à poser dans le chat :
1. "C'est quoi les taux de TVA en Tunisie ?"        → doit citer 19/13/7 % (fiche TVA)
2. "Comment se calcule l'IRPP ?"                     → doit décrire le barème 8 tranches
3. "Je suis au forfaitaire, je paye la TVA ?"        → doit dire : généralement exonéré
4. "Quel numéro de compte pour une vente ?"          → doit citer 707 / 4367 (plan comptable)
5. "Quel est le seuil exact du forfaitaire 2026 ?"   → doit répondre PRUDEMMENT (a_verifier)
                                                         et orienter vers vérification
```

Le test 5 est le plus important : il prouve que l'anti-hallucination fonctionne. L'IA ne
doit PAS inventer un chiffre, elle doit signaler que c'est à vérifier.

---

## Réingestion après validation

Quand tu auras validé tes `[À_VÉRIFIER]` et corrigé les fichiers kb/*.md, relance
simplement :

```
npx tsx scripts/ingest-kb.ts
```

La base vectorielle se met à jour, et le chat répond avec les nouveaux contenus — sans
toucher au code.

---

## Résumé du pipeline

```
kb/*.md ──(RAG-1 ingestion)──► knowledge_chunks (Supabase pgvector)
                                        │
question utilisateur ──(RAG-2 retrieveContext)──► chunks pertinents
                                        │
                          (RAG-3 system prompt anti-hallucination)
                                        │
                                   API Anthropic
                                        │
                          réponse sourcée ──(RAG-4)──► UI avec badges sources
```

> Rappel : la qualité des réponses dépend à 100 % de la qualité de tes fichiers kb/*.md.
> Le RAG ne corrige pas une donnée fausse — il la sert fidèlement. D'où l'importance de
> valider les `[À_VÉRIFIER]` avant la mise en production.
