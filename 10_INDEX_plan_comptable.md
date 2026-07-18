---
id: index-plan-comptable-tunisien
domaine: comptabilite
statut_verification: "[VÉRIFIÉ]"
sources: ["Système Comptable des Entreprises (SCE) - Nomenclature des comptes"]
tags: [plan-comptable, sce, index]
---

# Index — Plan comptable tunisien détaillé (SCE)

Ce dossier remplace/complète le fichier `10_plan_comptable_tunisien.md` mentionné dans le
`README.md` principal (qui était marqué "Structure vérifiée" mais incomplet). Il est
découpé **par classe** pour un meilleur chunking RAG (chaque `##` = un chunk contenant
un groupe de comptes cohérent).

| Fichier | Classe | Contenu | Statut |
|---|---|---|---|
| `11_plan_comptable_classe1.md` | Classe 1 | Capitaux propres, réserves, provisions, emprunts non courants | [VÉRIFIÉ] |
| `12_plan_comptable_classe2.md` | Classe 2 | Immobilisations incorporelles/corporelles, amortissements | [VÉRIFIÉ] |
| `13_plan_comptable_classe3.md` | Classe 3 | Stocks (matières premières, marchandises, en-cours) | [VÉRIFIÉ] |
| `14_plan_comptable_classe4.md` | Classe 4 | **Tiers : fournisseurs, clients, TVA, CNSS, personnel** | [VÉRIFIÉ] |
| `15_plan_comptable_classe5.md` | Classe 5 | **Trésorerie : banque, caisse, placements** | [VÉRIFIÉ] |
| `16_plan_comptable_classe6.md` | Classe 6 | **Charges : achats, services, salaires, impôts** | [VÉRIFIÉ] |
| `17_plan_comptable_classe7.md` | Classe 7 | **Produits : ventes, prestations, subventions** | [VÉRIFIÉ] |

## Comptes prioritaires pour le MVP (usage freelance/TPE)

Si tu veux limiter la première version de l'assistant IA à un sous-ensemble pertinent
pour un freelance/petit commerce tunisien (au lieu du plan comptable complet, très
orienté grandes entreprises), voici les ~20 comptes qui couvrent 90% des cas réels :

**Ventes / revenus**
- `705` Études et prestations de services (freelance/service)
- `707` Ventes de marchandises (commerce)

**Achats / charges courantes**
- `606` Achats non stockés de matières et fournitures
- `613` Locations (loyer local/bureau)
- `622` Rémunération d'intermédiaires et honoraires (sous-traitance)
- `626` Frais postaux et télécommunications
- `627` Services bancaires et assimilés

**Fiscalité et social**
- `43651` TVA à payer
- `43662` / `43666` TVA déductible
- `45311` CNSS
- `4341`–`4343` Impôt sur le revenu (retenue, acomptes, à liquider)

**Trésorerie**
- `532` Banque
- `541` Caisse

**Immobilisations courantes**
- `2282` Équipement de bureau
- `213` Logiciels

**Personnel (si l'utilisateur a des employés)**
- `640` Salaires
- `647` Charges sociales légales

## Prochaine étape suggérée

1. Ingérer ces 7 fichiers dans la table Supabase `knowledge_chunks` (pipeline déjà décrit
   dans le `README.md` du repo).
2. Mettre à jour le statut de `10_plan_comptable_tunisien.md` dans le README principal :
   passer de "Structure vérifiée" à **"Vérifié 2026"** puisque le contenu est maintenant complet.
3. Ajouter un champ `regime` filtrant côté RAG pour ne proposer à un utilisateur forfaitaire
   que les comptes pertinents (éviter de lui montrer les 200+ comptes de la classe 6 par ex.).
