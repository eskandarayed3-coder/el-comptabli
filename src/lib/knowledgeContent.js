// Real, structured content for the Knowledge screens (laws + guides).
// Each entry renders as a full detail page with an "infographic" block —
// no redirect to AI chat. Content is pedagogical; rates/thresholds are
// indicative and should be checked against the current Loi de Finances.
import { IRPP_BRACKETS } from './taxRules.js';

export const LAWS = {
  'loi-96-112': {
    type: 'law', num: 'Loi 96-112', date: '1996', badge: 'SCE',
    title: 'Système comptable des entreprises',
    intro: 'C’est la loi qui fixe comment une entreprise tunisienne doit tenir sa comptabilité : quels documents, dans quel ordre, avec quelles règles.',
    sections: [
      { heading: 'Le principe', body: 'Chaque opération (vente, achat, paiement) doit être enregistrée en partie double : un compte est débité, un autre est crédité, pour le même montant.' },
      { heading: 'Les documents obligatoires', body: 'Journal (toutes les écritures dans l’ordre chronologique), Grand livre (les écritures regroupées par compte), Balance (le total de chaque compte), États financiers (bilan, résultat).' },
      { heading: 'Qui est concerné', body: 'Toute société commerciale, et les personnes physiques au régime réel. Le régime forfaitaire est dispensé de cette comptabilité complète.' },
    ],
    infographic: {
      type: 'flow',
      steps: ['Pièce justificative', 'Journal', 'Grand livre', 'Balance', 'États financiers'],
    },
  },
  'code-tva': {
    type: 'law', num: 'Code TVA', date: '2026', badge: 'Code TVA',
    title: 'Code de la TVA',
    intro: 'Le texte qui fixe les taux de TVA, ce qui est taxable, et comment déclarer.',
    sections: [
      { heading: 'Les taux', body: 'La Tunisie applique 3 taux principaux selon le type de bien ou service, plus un taux 0% pour l’exonéré ou l’export.' },
      { heading: 'Comment ça marche', body: 'Tu factures la TVA à tes clients (TVA collectée) et tu récupères celle payée à tes fournisseurs (TVA déductible). Tu verses la différence à l’État chaque mois, avant le 28.' },
      { heading: 'Qui déclare', body: 'Les personnes et sociétés au régime réel. Le régime forfaitaire ne facture pas de TVA.' },
    ],
    infographic: {
      type: 'table',
      headers: ['Taux', 'Exemples'],
      rows: [
        ['19 %', 'Taux standard : la majorité des biens et services'],
        ['13 %', 'Certains services (restauration, transport...)'],
        ['7 %', 'Produits de première nécessité, santé'],
        ['0 %', 'Export, certaines exonérations'],
      ],
    },
  },
  'lf-2026': {
    type: 'law', num: 'LF 2026', date: '2026', badge: 'Loi de finances',
    title: 'Loi de finances 2026',
    intro: 'La loi votée chaque année qui ajuste les règles fiscales : barèmes, nouveaux régimes, obligations.',
    sections: [
      { heading: 'Nouveau régime forfaitaire optionnel BIC', body: 'Les petites activités commerciales et industrielles peuvent désormais opter pour un régime forfaitaire simplifié, sous conditions de chiffre d’affaires.' },
      { heading: 'Facturation électronique', body: 'La facture électronique devient obligatoire pour les prestations de services, avec une mise en œuvre progressive.' },
      { heading: 'Barème IRPP', body: 'Le barème progressif à 8 tranches (0 % à 40 %) est maintenu par rapport à l’année précédente.' },
    ],
    infographic: {
      type: 'timeline',
      items: [
        ['01/01/2026', 'Entrée en vigueur de la loi de finances'],
        ['15/02/2026', 'Circulaire d’application sur la facturation électronique'],
        ['01/06/2026', 'Date limite d’option pour le nouveau régime forfaitaire'],
      ],
    },
  },
};

export const TAX_GUIDES = {
  forfaitaire: {
    type: 'guide', min: 5, badge: 'vérifié 2026',
    title: 'Le régime forfaitaire expliqué simplement',
    intro: 'Le régime forfaitaire est fait pour les petites activités : un impôt simplifié, calculé sur ton chiffre d’affaires, sans avoir à gérer la TVA.',
    sections: [
      { heading: 'Pour qui', body: 'Les freelances et petits commerces sous un certain seuil de chiffre d’affaires annuel.' },
      { heading: 'Comment ça marche', body: 'Tu paies un impôt unique (autour de 0,5 % du CA, avec un minimum), pas de TVA à facturer ni à récupérer, une comptabilité très allégée.' },
      { heading: 'Limite', body: 'Si ton activité grandit et dépasse le seuil, tu passes automatiquement au régime réel.' },
    ],
    infographic: {
      type: 'compare',
      left: { title: 'Forfaitaire', points: ['Impôt simplifié sur le CA', 'Pas de TVA', 'Comptabilité allégée'] },
      right: { title: 'Réel', points: ['TVA facturée et récupérée', 'Comptabilité complète', 'Déduction réelle des charges'] },
    },
  },
  'tva-collectee-deductible': {
    type: 'guide', min: 3, badge: 'vérifié 2026',
    title: 'TVA : collectée vs déductible',
    intro: 'La TVA que tu dois payer chaque mois, c’est la différence entre ce que tu as facturé et ce que tu as payé.',
    sections: [
      { heading: 'TVA collectée', body: 'C’est la TVA que tu ajoutes sur tes factures de vente. Tu la collectes pour le compte de l’État.' },
      { heading: 'TVA déductible', body: 'C’est la TVA que tu as payée sur tes achats professionnels. Tu peux la récupérer.' },
    ],
    infographic: {
      type: 'formula',
      line1: 'TVA collectée − TVA déductible = TVA à payer',
      example: '1 900 DT − 1 588 DT = 312 DT',
    },
  },
  'irpp-tranches': {
    type: 'guide', min: 4, badge: 'à jour LF 2026',
    title: 'IRPP : comment marchent les tranches',
    intro: 'L’IRPP ne s’applique pas d’un seul coup sur tout ton revenu : chaque tranche a son propre taux, comme un escalier.',
    sections: [
      { heading: 'Le principe', body: 'Les premiers 5 000 DT ne sont pas taxés. Au-delà, chaque tranche suivante est taxée à un taux plus élevé, seulement sur la partie qui dépasse.' },
      { heading: 'Déductions', body: 'Des déductions existent pour charges de famille : chef de famille, enfants à charge (davantage pour un enfant en situation de handicap), parents à charge.' },
    ],
    infographic: { type: 'bracket', brackets: IRPP_BRACKETS },
  },
  'acomptes-provisionnels': {
    type: 'guide', min: 3, badge: 'vérifié 2026',
    title: 'Acomptes provisionnels, c’est quoi ?',
    intro: 'Ce sont des avances sur ton impôt de l’année en cours, basées sur ce que tu as payé l’année dernière.',
    sections: [
      { heading: 'Combien', body: '3 acomptes de 30 % chacun de l’impôt de l’année précédente, versés en juin, septembre et décembre.' },
      { heading: 'Régularisation', body: 'L’année suivante, tu régularises : si tu as trop payé, tu es remboursé ou tu déduis ; si pas assez, tu complètes.' },
    ],
    infographic: {
      type: 'timeline',
      items: [['Juin', '1er acompte : 30 %'], ['Septembre', '2e acompte : 30 %'], ['Décembre', '3e acompte : 30 %']],
    },
  },
  'cnss-independants': {
    type: 'guide', min: 5, badge: 'à jour LF 2026',
    title: 'CNSS pour indépendants',
    intro: 'Les travailleurs indépendants cotisent à la CNSS via le régime des travailleurs non-salariés (RSI), pour la retraite et la santé.',
    sections: [
      { heading: 'Comment ça marche', body: 'Tu choisis une catégorie de revenu (classe de cotisation), et tu cotises trimestriellement.' },
      { heading: 'Pourquoi c’est important', body: 'Ça te donne droit à la couverture maladie (CNAM) et à une pension de retraite plus tard.' },
    ],
    infographic: null,
  },
};

export const ACCOUNTING_GUIDES = {
  'partie-double': {
    type: 'guide', min: 4, level: 'Débutant',
    title: 'La partie double expliquée avec un café',
    intro: 'Chaque opération a toujours deux faces : ce qui rentre et ce qui sort. C’est la base de toute comptabilité.',
    sections: [
      { heading: 'L’exemple du café', body: 'Tu achètes un café à 3 DT en espèces : ton compte "Charges" augmente de 3 DT (débit), ton compte "Caisse" diminue de 3 DT (crédit). Les deux montants s’équilibrent toujours.' },
      { heading: 'La règle d’or', body: 'Total débit = Total crédit, sur chaque écriture, et sur l’ensemble de ta comptabilité.' },
    ],
    infographic: {
      type: 'table',
      headers: ['Compte', 'Débit', 'Crédit'],
      rows: [['Charges (café)', '3,000 DT', ''], ['Caisse', '', '3,000 DT']],
    },
  },
  'plan-comptable': {
    type: 'guide', min: 6, level: 'Débutant',
    title: 'Plan comptable tunisien : les bases',
    intro: 'Le plan comptable tunisien (SCE) classe tous les comptes en 7 grandes classes, chacune découpée en sections. Au total : 62 sections et 426 comptes.',
    sections: [
      { heading: 'Pourquoi ça sert', body: 'Chaque compte a un numéro unique, ce qui permet à toute entreprise tunisienne de tenir sa compta de façon standardisée.' },
      { heading: 'Comment lire un numéro', body: 'Le 1er chiffre = la classe (ex : 6 = charges). Les 2 premiers = la section (ex : 60 = achats). Plus tu ajoutes de chiffres, plus le compte est précis (607 = achats de marchandises).' },
      { heading: 'La nomenclature complète', body: 'La liste détaillée des 426 comptes (avec recherche) est disponible dans Savoir → Plan comptable (SCE).' },
    ],
    infographic: {
      type: 'table',
      headers: ['Classe', 'Contenu', 'Sections', 'Comptes'],
      rows: [
        ['1', 'Capitaux propres', '9', '76'],
        ['2', 'Immobilisations', '9', '80'],
        ['3', 'Stocks', '7', '14'],
        ['4', 'Tiers (clients, fournisseurs, TVA)', '10', '82'],
        ['5', 'Trésorerie', '8', '30'],
        ['6', 'Charges', '10', '102'],
        ['7', 'Produits', '9', '42'],
        ['Total', '7 classes', '62', '426'],
      ],
    },
  },
  'journal-grand-livre-balance': {
    type: 'guide', min: 5, level: 'Intermédiaire',
    title: 'Journal, grand livre, balance : qui fait quoi',
    intro: 'Trois documents, trois rôles différents, mais tous connectés.',
    sections: [
      { heading: 'Le journal', body: 'Toutes tes écritures, dans l’ordre où elles arrivent, jour après jour.' },
      { heading: 'Le grand livre', body: 'Les mêmes écritures, mais regroupées par compte, pour voir l’historique d’un compte précis.' },
      { heading: 'La balance', body: 'Le total (débit et crédit) de chaque compte, à une date donnée : ton tableau de contrôle.' },
    ],
    infographic: { type: 'flow', steps: ['Journal (par date)', 'Grand livre (par compte)', 'Balance (les totaux)'] },
  },
  'lire-bilan': {
    type: 'guide', min: 7, level: 'Intermédiaire',
    title: 'Lire un bilan sans paniquer',
    intro: 'Le bilan, c’est une photo de ce que ton entreprise possède et de ce qu’elle doit, à un instant donné.',
    sections: [
      { heading: 'L’actif', body: 'Ce que l’entreprise possède : trésorerie, créances clients, matériel...' },
      { heading: 'Le passif', body: 'Ce qu’elle doit : dettes fournisseurs, emprunts, et le capital des associés.' },
      { heading: 'La règle', body: 'Actif = Passif, toujours. Si ça n’est pas égal, il y a une erreur quelque part.' },
    ],
    infographic: { type: 'formula', line1: 'Total Actif = Total Passif', example: '7 050 DT = 7 050 DT ✓' },
  },
};

export function findContent(type, slug) {
  const map = type === 'law' ? LAWS : type === 'tax-guide' ? TAX_GUIDES : ACCOUNTING_GUIDES;
  return map[slug] || null;
}
