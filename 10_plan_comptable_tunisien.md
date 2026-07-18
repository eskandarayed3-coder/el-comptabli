---
id: compta-pcg-001
titre: Plan comptable tunisien (SCE) — classes et comptes
domaine: comptabilite
sous_domaine: plan_comptable
langue: fr
public: entrepreneur, comptable, etudiant
regime: [reel]
statut_verification: structure_verifiee
date_source: 2026-07
sources:
  - "Système Comptable des Entreprises (SCE) — Loi n°96-112 du 30 décembre 1996"
  - "Normes Comptables Tunisiennes (NCT)"
  - "Nomenclature comptable tunisienne (plan de comptes)"
avertissement: "Structure du plan comptable tunisien à 7 classes. Les libellés de comptes sont standards ; vérifier les subdivisions exactes dans le référentiel SCE officiel de l'entreprise."
tags: [plan_comptable, sce, nct, comptes, classes, debit, credit, ecritures]
---

# Plan comptable tunisien (Système Comptable des Entreprises — SCE)

## À quoi sert ce document
Référence des **numéros de comptes** et de leurs **libellés** pour la catégorisation automatique des écritures, la préparation des journaux, et la correction d'exercices de comptabilité générale (mode Examen).

## Cadre
`[VÉRIFIÉ]` La comptabilité des entreprises tunisiennes est régie par le **Système Comptable des Entreprises (SCE)**, institué par la **loi n°96-112 du 30 décembre 1996**, complété par les **Normes Comptables Tunisiennes (NCT)**. Le plan de comptes est organisé en **7 classes** (comptes de bilan 1 à 5, comptes de gestion 6 et 7), plus la classe 0 pour les comptes spéciaux/engagements selon les besoins.

## Les 7 classes

| Classe | Intitulé | Nature |
|---|---|---|
| 1 | Comptes de capitaux | Bilan — Passif (ressources durables) |
| 2 | Comptes d'immobilisations | Bilan — Actif (emplois durables) |
| 3 | Comptes de stocks et en-cours | Bilan — Actif circulant |
| 4 | Comptes de tiers | Bilan — Actif ou Passif (créances/dettes) |
| 5 | Comptes financiers | Bilan — Trésorerie |
| 6 | Comptes de charges | Gestion — Résultat |
| 7 | Comptes de produits | Gestion — Résultat |

## Comptes principaux par classe (labels standards)

### Classe 1 — Capitaux
- **10** Capital et réserves
  - 101 Capital social
  - 106 Réserves
  - 11 Report à nouveau
  - 12 Résultat de l'exercice
- **13** Subventions d'investissement
- **14** Provisions réglementées
- **15** Provisions pour risques et charges
- **16** Emprunts et dettes assimilées
  - 164 Emprunts auprès des établissements de crédit

### Classe 2 — Immobilisations
- **21** Immobilisations corporelles
  - 213 Constructions
  - 218 Autres immobilisations corporelles (matériel, mobilier)
  - 2183 Matériel de bureau et informatique
  - 2184 Mobilier
- **22** Immobilisations incorporelles `[À_VÉRIFIER subdivision exacte SCE]`
- **23** Immobilisations en cours
- **28** Amortissements des immobilisations
- **29** Provisions pour dépréciation des immobilisations

### Classe 3 — Stocks
- **31** Matières premières
- **32** Autres approvisionnements
- **35** Stocks de produits
- **37** Stocks de marchandises
- **39** Provisions pour dépréciation des stocks

### Classe 4 — Tiers
- **40** Fournisseurs et comptes rattachés
  - 401 Fournisseurs
  - 403 Fournisseurs — effets à payer
  - 404 Fournisseurs d'immobilisations
- **41** Clients et comptes rattachés
  - 411 Clients
  - 413 Clients — effets à recevoir
  - 416 Clients douteux
- **43** État et collectivités publiques
  - 4366 TVA déductible
  - 4367 TVA collectée (ou TVA à décaisser) `[À_VÉRIFIER numérotation exacte TVA dans le SCE]`
  - 432 État — impôts et taxes
- **44** Sociétés du groupe / associés `[À_VÉRIFIER]`
- **45** Groupe et associés
- **47** Comptes d'attente
- **48** Comptes de régularisation

### Classe 5 — Financiers
- **53** Banques `[À_VÉRIFIER : dans le SCE la banque est souvent en 532]`
- **54** Caisse `[À_VÉRIFIER : caisse souvent en 54]`
- 532 Banques
- 54 Caisse
- 58 Virements internes

> Note `[À_VÉRIFIER]` : la numérotation exacte des comptes financiers (banque/caisse) dans le SCE tunisien peut différer du plan français. À caler sur la nomenclature SCE officielle.

### Classe 6 — Charges
- **60** Achats
  - 601 Achats de matières premières
  - 607 Achats de marchandises
- **61 / 62** Services extérieurs et autres services extérieurs
  - 613 Locations
  - 616 Assurances
  - 624 Transports
  - 626 Frais postaux et télécommunications
- **63** Impôts et taxes
- **64** Charges de personnel
  - 640 Salaires et traitements
  - 645 Charges sociales (CNSS patronale)
- **65** Autres charges d'exploitation
- **66** Charges financières
- **68** Dotations aux amortissements et provisions

### Classe 7 — Produits
- **70** Ventes
  - 701 Ventes de produits finis
  - 707 Ventes de marchandises
  - 706 Prestations de services
- **74** Subventions d'exploitation
- **75** Autres produits d'exploitation
- **76** Produits financiers
- **78** Reprises sur amortissements et provisions

## Mécanisme débit / crédit (rappel)

| | Augmente au... | Diminue au... |
|---|---|---|
| Actif (classes 2,3,4-créances,5) | Débit | Crédit |
| Passif (classes 1,4-dettes) | Crédit | Débit |
| Charges (classe 6) | Débit | Crédit |
| Produits (classe 7) | Crédit | Débit |

**Principe de la partie double :** pour chaque écriture, total débit = total crédit.

## Exemple d'écriture (étudiant) — vente avec TVA

**Énoncé :** vente de marchandises 1 000 DT HT, TVA 19 %, réglée par le client à crédit.
**Écriture au journal :**
```
411  Clients ................... Débit  1 190
   707  Ventes de marchandises ..... Crédit  1 000
   4367 TVA collectée ............... Crédit    190
```
**Règle appliquée :** le client doit le TTC (débit 411) ; la vente HT est un produit (crédit 707) ; la TVA collectée est une dette envers l'État (crédit classe 4).

## Catégories El Comptabli → comptes (mapping suggéré)

| Catégorie app | Compte suggéré |
|---|---|
| Ventes / recettes | 701 / 706 / 707 |
| Achats marchandises | 607 |
| Loyer | 613 |
| Carburant / transport | 624 |
| Télécom / internet | 626 |
| Assurances | 616 |
| Salaires | 640 |
| Charges sociales | 645 |
| TVA collectée | 4367 `[À_VÉRIFIER]` |
| TVA déductible | 4366 `[À_VÉRIFIER]` |

## Disclaimer
Structure conforme au SCE tunisien à 7 classes. Les numéros de sous-comptes (notamment TVA et comptes financiers) doivent être calés sur la nomenclature SCE officielle de l'entreprise avant usage comptable réel. Ne remplace pas un expert-comptable.
