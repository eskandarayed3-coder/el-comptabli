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
    type: 'guide', min: 5, badge: 'à vérifier · JIBAYA 2026',
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
    type: 'guide', min: 3, badge: 'à vérifier · JIBAYA 2026',
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
    type: 'guide', min: 4, badge: 'à vérifier · JIBAYA 2026',
    title: 'IRPP : comment marchent les tranches',
    intro: 'L’IRPP ne s’applique pas d’un seul coup sur tout ton revenu : chaque tranche a son propre taux, comme un escalier.',
    sections: [
      { heading: 'Le principe', body: 'Les premiers 5 000 DT ne sont pas taxés. Au-delà, chaque tranche suivante est taxée à un taux plus élevé, seulement sur la partie qui dépasse.' },
      { heading: 'Déductions', body: 'Des déductions existent pour charges de famille : chef de famille, enfants à charge (davantage pour un enfant en situation de handicap), parents à charge.' },
    ],
    infographic: { type: 'bracket', brackets: IRPP_BRACKETS },
  },
  'acomptes-provisionnels': {
    type: 'guide', min: 3, badge: 'à vérifier · JIBAYA 2026',
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
    type: 'guide', min: 5, badge: 'à vérifier · CNSS',
    title: 'CNSS pour indépendants',
    intro: 'Les travailleurs indépendants cotisent à la CNSS via le régime des travailleurs non-salariés (RSI), pour la retraite et la santé.',
    sections: [
      { heading: 'Comment ça marche', body: 'Tu choisis une catégorie de revenu (classe de cotisation), et tu cotises trimestriellement.' },
      { heading: 'Pourquoi c’est important', body: 'Ça te donne droit à la couverture maladie (CNAM) et à une pension de retraite plus tard.' },
    ],
    infographic: null,
  },
  'sources-fiscales': {
    type: 'guide', min: 4, badge: 'source officielle',
    title: 'Comment vérifier une règle fiscale tunisienne',
    intro: 'Une règle fiscale doit toujours être lue avec son année, son régime et son texte officiel. Ce guide t’aide à vérifier avant de déclarer ou de payer.',
    sources: [
      { label: 'JIBAYA — documentation fiscale 2026', url: 'https://jibaya.tn/docs/' },
      { label: 'Code IRPP et IS 2026', url: 'https://jibaya.tn/docs/code-de-lirpp-et-is-2026/' },
    ],
    sections: [
      { heading: 'Ordre des sources', body: 'Commence par le code fiscal ou la loi de finances de l’exercice. Utilise ensuite les notes communes et les instructions publiées par l’administration. Une page de blog ou une réponse IA ne remplace jamais ce contrôle.' },
      { heading: 'Les trois questions à poser', body: 'Quelle année ? Quel régime ? Quelle activité ? Une réponse peut changer selon ces trois éléments, même si le nom de la taxe est le même.' },
      { heading: 'Dans El Comptabli', body: 'Les formules servent à comprendre et préparer. Avant une déclaration, ouvre la source officielle indiquée dans le guide ou demande confirmation à ton expert-comptable.' },
    ],
    infographic: { type: 'flow', steps: ['Identifier l’année et le régime', 'Lire le texte officiel', 'Vérifier les conditions', 'Préparer le calcul', 'Faire valider le cas complexe'] },
  },
  'facturation-electronique': {
    type: 'guide', min: 5, badge: 'mise à jour 2026',
    title: 'Facturation électronique : les points à contrôler',
    intro: 'La facturation électronique est un dispositif réglementé. Une facture PDF imprimée ne doit pas être présumée conforme sans vérifier le régime applicable.',
    sources: [
      { label: 'Note commune n°02 — loi de finances 2026', url: 'https://jibaya.tn/ar/docs/note-commune-n02-2026/' },
      { label: 'Idaraty — adhésion à la facturation électronique', url: 'https://idaraty.tn/fr/public/index.php/fr/procedures/adhesion-au-systeme-de-facturation-electronique' },
    ],
    sections: [
      { heading: 'Qui est concerné', body: 'Le champ évolue par la loi de finances et les textes d’application. Vérifie toujours ton secteur, ton client et ton statut avant de conclure que l’obligation s’applique ou non.' },
      { heading: 'Ce que le logiciel doit conserver', body: 'La facture, son numéro, les données vendeur et client, les lignes, taxes, avoirs, statut d’envoi, référence technique et preuve d’archivage. Les corrections doivent être traçables.' },
      { heading: 'Réflexe pratique', body: 'Si tu travailles avec l’État, une grande entreprise ou un organisme public, vérifie immédiatement le dispositif TTN et la procédure d’adhésion officielle.' },
    ],
    infographic: { type: 'flow', steps: ['Vérifier l’obligation', 'Adhérer au dispositif applicable', 'Émettre et contrôler', 'Archiver la preuve', 'Gérer les avoirs et rejets'] },
  },
  'retenue-source': {
    type: 'guide', min: 5, badge: 'à vérifier · JIBAYA 2026',
    title: 'Retenue à la source : comprendre le mécanisme',
    intro: 'La retenue à la source est un impôt prélevé par le payeur dans certains cas. Elle ne doit jamais être calculée avec un taux par défaut.',
    sections: [
      { heading: 'Le principe', body: 'Le payeur retient une partie du montant et la reverse selon la procédure applicable. Le bénéficiaire reçoit le net et conserve la preuve de la retenue.' },
      { heading: 'Les contrôles nécessaires', body: 'Il faut identifier précisément la nature de la prestation, le statut des parties, l’éventuelle convention fiscale, le taux de l’exercice et le document justificatif.' },
      { heading: 'Écriture de contrôle', body: 'Montant brut = montant net payé + retenue. Avant de valider, la facture, le paiement et l’attestation de retenue doivent raconter la même histoire.' },
    ],
    infographic: { type: 'formula', line1: 'Montant brut = net payé + retenue à la source', example: 'Exemple pédagogique : 1 000 DT = 900 DT + 100 DT' },
  },
  'declarations-sociales': {
    type: 'guide', min: 5, badge: 'à vérifier · CNSS / TEJ',
    title: 'Déclarations employeur, CNSS et dossier de paie',
    intro: 'Dès que tu emploies du personnel, ta comptabilité doit relier contrat, paie, retenues, cotisations, paiement et déclaration.',
    sources: [
      { label: 'Idaraty — affiliation employeur CNSS', url: 'https://www.idaraty.tn/procedures/affiliation-demployeur-cnss-activite-non-agricole' },
      { label: 'JIBAYA — informations TEJ', url: 'https://jibaya.tn/' },
    ],
    sections: [
      { heading: 'Dossier minimum', body: 'Conserve les informations contractuelles, les bulletins, la base de calcul, les retenues, les cotisations employeur et salarié, les preuves de paiement et les déclarations.' },
      { heading: 'Contrôle mensuel ou trimestriel', body: 'Le total des bulletins doit être rapproché du journal de paie, de la banque et de la dette sociale. Toute différence doit être expliquée avant la déclaration.' },
      { heading: 'Ne pas automatiser aveuglément', body: 'Les taux et plafonds sociaux changent. Configure-les par période d’effet et fais vérifier la première paie par un professionnel.' },
    ],
    infographic: { type: 'flow', steps: ['Contrat et salarié', 'Bulletin de paie', 'Écritures comptables', 'Paiement', 'Déclaration et archivage'] },
  },
  'dossier-fiscal-entreprise': {
    type: 'guide', min: 6, badge: 'à vérifier · source officielle',
    title: 'Dossier fiscal : les documents à préparer toute l’année',
    intro: 'Un dossier fiscal propre ne se construit pas la veille d’une déclaration. Il relie chaque chiffre à une preuve et garde les documents faciles à retrouver.',
    sources: [
      { label: 'JIBAYA — documentation fiscale', url: 'https://jibaya.tn/docs/' },
      { label: 'Idaraty — démarches administratives', url: 'https://idaraty.tn/' },
    ],
    sections: [
      { heading: 'Le dossier des ventes', body: 'Classe les factures émises, avoirs, bons de livraison, contrats, règlements et relances. Le numéro de facture doit pouvoir être retrouvé rapidement.' },
      { heading: 'Le dossier des achats', body: 'Conserve les factures fournisseurs, contrats, bons de réception, preuves de paiement et documents liés à la TVA ou à une éventuelle retenue.' },
      { heading: 'Le dossier des déclarations', body: 'Archive les déclarations déposées, accusés de réception, quittances, échanges avec l’administration et une feuille de calcul expliquant les montants.' },
      { heading: 'La règle pratique', body: 'Pour chaque montant important : une pièce, une date, un libellé clair, un lien vers l’opération et un statut de vérification.' },
    ],
    infographic: { type: 'flow', steps: ['Recevoir la pièce', 'Classer par période', 'Vérifier les données', 'Rapprocher au paiement', 'Préparer la déclaration', 'Archiver preuve et accusé'] },
  },
  'controle-fiscal-preparation': {
    type: 'guide', min: 6, badge: 'à vérifier · source officielle',
    title: 'Préparer un contrôle fiscal sans stress',
    intro: 'Le bon réflexe est de répondre avec des documents cohérents et une piste d’audit claire, jamais de reconstruire les chiffres dans l’urgence.',
    sources: [{ label: 'JIBAYA — procédures et textes fiscaux', url: 'https://jibaya.tn/docs/' }],
    sections: [
      { heading: 'Centraliser la demande', body: 'Lis la période, les pièces demandées et le délai. Désigne une personne responsable de la réponse et conserve une copie de chaque échange.' },
      { heading: 'Rassembler les preuves', body: 'Prépare journaux, factures, relevés, contrats, déclarations, paiements et rapprochements. Chaque total doit pouvoir être détaillé.' },
      { heading: 'Documenter les écarts', body: 'Un écart expliqué est préférable à un chiffre modifié sans trace. Note la cause, la pièce et la correction proposée, puis fais valider le traitement.' },
      { heading: 'Se faire accompagner', body: 'Un contrôle ou une demande complexe nécessite l’appui d’un expert-comptable ou conseil compétent. Ne transmet pas une réponse juridique improvisée.' },
    ],
    infographic: { type: 'flow', steps: ['Lire la demande', 'Geler les pièces', 'Rassembler et rapprocher', 'Expliquer les écarts', 'Faire valider', 'Répondre et archiver'] },
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
  'cycle-comptable': {
    type: 'guide', min: 6, level: 'Débutant',
    title: 'Le cycle comptable : de la facture au bilan',
    intro: 'La comptabilité n’est pas seulement saisir une facture. C’est une chaîne de preuves et de contrôles qui se termine par des états financiers.',
    sections: [
      { heading: '1. La pièce justificative', body: 'Facture, reçu, contrat, relevé bancaire ou fiche de paie : sans pièce, une écriture est fragile. Classe-la, date-la et relie-la à l’opération.' },
      { heading: '2. L’écriture', body: 'Traduis la pièce en comptes débit/crédit. Le même événement ne doit pas être saisi deux fois, même s’il apparaît sur la facture et plus tard sur la banque.' },
      { heading: '3. Le contrôle', body: 'Rapproche clients, fournisseurs, banque, caisse et TVA. Corrige par une nouvelle écriture, jamais en effaçant une piste déjà validée.' },
      { heading: '4. La clôture', body: 'À la fin de période, prépare les régularisations, la balance, le résultat, le bilan et les déclarations. Les chiffres doivent être expliqués et archivés.' },
    ],
    infographic: { type: 'flow', steps: ['Pièce justificative', 'Contrôle du document', 'Écriture comptable', 'Rapprochement', 'Balance et déclarations', 'Clôture'] },
  },
  'clients-fournisseurs-reglements': {
    type: 'guide', min: 6, level: 'Débutant',
    title: 'Clients, fournisseurs et règlements',
    intro: 'Une facture n’est pas automatiquement un paiement. Suivre cette différence évite les erreurs de trésorerie et les soldes faux.',
    sections: [
      { heading: 'Vente à crédit', body: 'Quand tu factures un client, tu constates une créance. Quand il paie, tu diminues la créance et tu augmentes la banque ou la caisse.' },
      { heading: 'Achat à crédit', body: 'Quand tu reçois une facture fournisseur, tu constates une dette. Le paiement vient plus tard et doit être rapproché de la bonne facture.' },
      { heading: 'Lettrage', body: 'Lettrer, c’est relier les factures et paiements qui se compensent. Ce qui reste non lettré constitue ton vrai impayé ou ta vraie dette.' },
    ],
    infographic: { type: 'flow', steps: ['Facture client', 'Créance client', 'Paiement banque', 'Lettrage', 'Solde à zéro ou impayé'] },
  },
  'banque-rapprochement': {
    type: 'guide', min: 5, level: 'Intermédiaire',
    title: 'Rapprochement bancaire : la méthode simple',
    intro: 'Le solde comptable et le relevé bancaire doivent expliquer la même trésorerie. Le rapprochement sert à trouver ce qui manque ou ce qui est saisi deux fois.',
    sections: [
      { heading: 'Comparer', body: 'Importe ou lis le relevé, puis compare date, montant, libellé et référence avec les écritures de banque.' },
      { heading: 'Expliquer les écarts', body: 'Les écarts fréquents sont les frais bancaires, chèques non débités, virements en cours, encaissements non comptabilisés ou doublons.' },
      { heading: 'Valider', body: 'Une ligne bancaire doit être liée à une écriture, à une facture ou à une explication documentée. Ne force jamais un rapprochement pour faire disparaître un écart.' },
    ],
    infographic: { type: 'formula', line1: 'Solde comptable ± opérations en attente = solde relevé', example: 'Chaque différence doit avoir une pièce ou une écriture' },
  },
  'immobilisations-amortissements': {
    type: 'guide', min: 6, level: 'Intermédiaire',
    title: 'Immobilisations et amortissements',
    intro: 'Un ordinateur, une machine ou un véhicule utilisé durablement ne se traite pas toujours comme une charge immédiate. Il faut analyser l’usage et la règle applicable.',
    sections: [
      { heading: 'Identifier l’actif', body: 'Une immobilisation est un bien contrôlé par l’entreprise et utilisé sur plusieurs périodes. Garde facture, date de mise en service, coût et emplacement.' },
      { heading: 'Amortir', body: 'L’amortissement répartit le coût sur la durée d’utilisation estimée. La formule pédagogique linéaire est : base amortissable ÷ durée.' },
      { heading: 'Contrôler', body: 'Chaque actif doit avoir une fiche, une valeur d’origine, un cumul d’amortissements, une valeur nette et une preuve de sortie lorsqu’il est cédé ou mis au rebut.' },
    ],
    infographic: { type: 'formula', line1: 'Dotation annuelle = base amortissable ÷ durée d’utilisation', example: '12 000 DT ÷ 4 ans = 3 000 DT/an (exemple pédagogique)' },
  },
  'cloture-controles': {
    type: 'guide', min: 7, level: 'Intermédiaire',
    title: 'Clôture mensuelle : la checklist du comptable',
    intro: 'Une bonne clôture transforme des documents en chiffres fiables. Elle se fait avec une liste de contrôles, pas seulement avec un bouton “exporter”.',
    sections: [
      { heading: 'Pièces et saisie', body: 'Vérifie que chaque vente, achat, banque, caisse et paie possède une pièce et une date dans la bonne période.' },
      { heading: 'Rapprochements', body: 'Rapproche la banque, les clients, les fournisseurs, la TVA et les comptes d’attente. Documente les écarts restants.' },
      { heading: 'Régularisations', body: 'Examine charges à payer, produits à recevoir, charges constatées d’avance, amortissements, stocks et provisions selon les besoins de l’entreprise.' },
      { heading: 'Gel de la période', body: 'Après validation, verrouille la période. Toute correction doit laisser une trace et être approuvée selon les règles du cabinet.' },
    ],
    infographic: { type: 'flow', steps: ['Collecter les pièces', 'Saisir et contrôler', 'Rapprocher', 'Régulariser', 'Valider la balance', 'Verrouiller'] },
  },
  'controle-interne': {
    type: 'guide', min: 5, level: 'Intermédiaire',
    title: 'Contrôle interne et piste d’audit',
    intro: 'Une comptabilité fiable doit pouvoir répondre à une question simple : qui a fait quoi, quand, avec quel document et pourquoi ?',
    sections: [
      { heading: 'Séparer les rôles', body: 'La personne qui crée un fournisseur, valide une facture et paie ne devrait pas forcément être la même. Les petites entreprises peuvent compenser par une revue régulière du dirigeant.' },
      { heading: 'Ne pas effacer', body: 'Après validation, une correction doit créer une trace : commentaire, pièce jointe, approbation et écriture de correction si nécessaire.' },
      { heading: 'Revue périodique', body: 'Analyse les comptes inhabituels, les montants ronds, les doublons, les écritures hors période et les fournisseurs sans document.' },
    ],
    infographic: { type: 'flow', steps: ['Saisir', 'Joindre la preuve', 'Faire valider', 'Payer ou comptabiliser', 'Conserver la trace'] },
  },
  'stocks-inventaire': {
    type: 'guide', min: 6, level: 'Intermédiaire',
    title: 'Stocks et inventaire : compter, valoriser, expliquer',
    intro: 'Le stock est un actif réel : il faut pouvoir le compter, l’identifier et relier son montant comptable à un inventaire physique.',
    sections: [
      { heading: 'Avant le comptage', body: 'Bloque ou note les mouvements pendant l’inventaire. Prépare une liste par emplacement, référence, unité et personne qui compte.' },
      { heading: 'Pendant le comptage', body: 'Compte réellement, note les écarts, les produits abîmés, périmés ou non vendables. Une quantité théorique n’est pas une preuve de stock.' },
      { heading: 'Après le comptage', body: 'Rapproche le physique et le système, explique les différences puis fais valider les ajustements. Conserve les feuilles de comptage datées.' },
      { heading: 'Valorisation', body: 'La méthode de valorisation et les éventuelles dépréciations doivent être cohérentes, documentées et adaptées au référentiel applicable.' },
    ],
    infographic: { type: 'flow', steps: ['Préparer les références', 'Compter le physique', 'Comparer au système', 'Expliquer les écarts', 'Valider les ajustements', 'Archiver les feuilles'] },
  },
  'paie-comptabilisation': {
    type: 'guide', min: 6, level: 'Intermédiaire',
    title: 'Paie : du bulletin aux écritures comptables',
    intro: 'La paie mélange données RH, obligations sociales, banque et comptabilité. Un bon processus contrôle ces éléments avant et après le paiement.',
    sections: [
      { heading: 'Données d’entrée', body: 'Contrat, salaire, absences, primes, avances et changements doivent être validés avant le calcul. Garde la date d’effet de chaque modification.' },
      { heading: 'Contrôles du bulletin', body: 'Compare le brut, les retenues, le net à payer et les charges employeur à la période précédente. Toute variation inhabituelle doit être expliquée.' },
      { heading: 'Banque et écritures', body: 'Le total payé en banque doit correspondre au total net des bulletins. Les dettes sociales et fiscales doivent rester suivies jusqu’au paiement et à la déclaration.' },
      { heading: 'Confidentialité', body: 'Les données de paie sont sensibles. Limite les accès, conserve les justificatifs de manière sécurisée et évite l’envoi par messagerie non protégée.' },
    ],
    infographic: { type: 'flow', steps: ['Valider les données RH', 'Calculer les bulletins', 'Contrôler les variations', 'Comptabiliser', 'Payer', 'Déclarer et archiver'] },
  },
};

export const FINANCE_GUIDES = {
  'marge-rentabilite': {
    type: 'guide', min: 4, level: 'Débutant',
    title: 'Marge, bénéfice et rentabilité',
    intro: 'Le chiffre d’affaires est ce que tu vends. Le bénéfice dépend de ce qu’il reste après les coûts et charges. Les trois mots ne veulent pas dire la même chose.',
    sections: [
      { heading: 'Marge brute', body: 'Marge brute = ventes − coût direct des ventes. Elle répond à la question : est-ce que mon produit ou service couvre ce qu’il consomme directement ?' },
      { heading: 'Résultat', body: 'Résultat = produits − charges. Il tient aussi compte du loyer, des salaires, des frais bancaires, des impôts et des autres charges.' },
      { heading: 'Lire le pourcentage', body: 'Taux de marge = marge ÷ chiffre d’affaires × 100. Compare-le dans le temps et entre activités similaires, pas seulement sur un mois isolé.' },
    ],
    infographic: { type: 'formula', line1: 'Taux de marge = marge ÷ chiffre d’affaires × 100', example: '300 DT ÷ 1 000 DT × 100 = 30 %' },
  },
  'tresorerie-cashflow': {
    type: 'guide', min: 5, level: 'Débutant',
    title: 'Trésorerie : pourquoi un bénéfice ne suffit pas',
    intro: 'Tu peux être rentable et manquer d’argent aujourd’hui. La trésorerie regarde les encaissements et décaissements réels, pas seulement les factures.',
    sections: [
      { heading: 'Encaisser', body: 'Une vente à crédit améliore le résultat, mais n’améliore la banque que lorsque le client paie.' },
      { heading: 'Décaisser', body: 'Un achat peut être enregistré maintenant et payé plus tard. Suis les dates de paiement réelles pour anticiper les besoins.' },
      { heading: 'Prévision simple', body: 'Prévision de trésorerie = solde initial + encaissements prévus − décaissements prévus. Mets à jour chaque semaine pour les activités tendues.' },
    ],
    infographic: { type: 'formula', line1: 'Trésorerie finale = début + encaissements − décaissements', example: '2 000 + 5 000 − 4 200 = 2 800 DT' },
  },
  'seuil-rentabilite': {
    type: 'guide', min: 5, level: 'Intermédiaire',
    title: 'Seuil de rentabilité : combien vendre pour couvrir tes charges',
    intro: 'Le seuil de rentabilité indique le niveau d’activité auquel ton entreprise ne perd plus d’argent, avant de commencer à dégager un résultat positif.',
    sections: [
      { heading: 'Séparer fixe et variable', body: 'Les charges fixes ne changent pas beaucoup avec les ventes à court terme. Les charges variables augmentent avec chaque produit ou service vendu.' },
      { heading: 'Taux de marge sur coût variable', body: 'TMCV = (chiffre d’affaires − charges variables) ÷ chiffre d’affaires. Ce taux mesure la part disponible pour couvrir les charges fixes.' },
      { heading: 'Lire le résultat', body: 'Seuil de rentabilité = charges fixes ÷ TMCV. C’est un outil de pilotage, pas un taux fiscal.' },
    ],
    infographic: { type: 'formula', line1: 'Seuil de rentabilité = charges fixes ÷ taux de marge sur coût variable', example: '10 000 DT ÷ 40 % = 25 000 DT de CA' },
  },
  budget: {
    type: 'guide', min: 5, level: 'Débutant',
    title: 'Construire un budget simple et utile',
    intro: 'Un budget n’est pas une promesse. C’est une hypothèse chiffrée que tu compares chaque mois à la réalité.',
    sections: [
      { heading: 'Partir de l’activité', body: 'Construis les ventes à partir du nombre de clients, du prix moyen et de la saisonnalité. Évite de commencer avec un chiffre d’affaires “souhaité”.' },
      { heading: 'Lister les coûts', body: 'Sépare coûts variables, charges fixes, impôts estimés, remboursements et investissements. Prévois une marge pour les imprévus.' },
      { heading: 'Comparer', body: 'Écart = réel − budget. Analyse les écarts les plus importants, décide une action et mets à jour la prévision du reste de l’année.' },
    ],
    infographic: { type: 'formula', line1: 'Écart = réel − budget', example: 'Réel 8 500 DT − budget 10 000 DT = −1 500 DT' },
  },
  'indicateurs-essentiels': {
    type: 'guide', min: 5, level: 'Intermédiaire',
    title: 'Les 6 indicateurs financiers à suivre',
    intro: 'Un petit tableau de bord régulier vaut mieux qu’un rapport très long lu une fois par an.',
    sections: [
      { heading: 'Ventes et marge', body: 'Suis le chiffre d’affaires, la marge et leur évolution. Une hausse des ventes peut cacher une baisse de marge.' },
      { heading: 'Trésorerie et impayés', body: 'Regarde le solde bancaire, les encaissements attendus et le retard moyen de paiement des clients.' },
      { heading: 'Dépenses et concentration', body: 'Analyse les principaux fournisseurs et les catégories de dépenses qui évoluent fortement.' },
      { heading: 'Obligations', body: 'Garde une vue des taxes, cotisations et échéances à venir ; une charge connue mais non provisionnée est un risque de trésorerie.' },
    ],
    infographic: { type: 'table', headers: ['Indicateur', 'Question'], rows: [['CA', 'Est-ce que je vends plus ou moins ?'], ['Marge', 'Est-ce que je gagne assez par vente ?'], ['Trésorerie', 'Puis-je payer cette semaine ?'], ['Impayés', 'Qui doit encore payer ?'], ['Charges', 'Qu’est-ce qui augmente ?'], ['Échéances', 'Qu’est-ce qui arrive ?']] },
  },
  'prix-de-vente': {
    type: 'guide', min: 5, level: 'Débutant',
    title: 'Fixer un prix de vente sans oublier tes coûts',
    intro: 'Un prix trop bas peut augmenter les ventes tout en détruisant la marge. Il faut regarder les coûts directs, les charges fixes et la valeur proposée au client.',
    sections: [
      { heading: 'Coût direct', body: 'Calcule matière, achat, livraison, commission et temps directement nécessaires à une vente. Ce sont les coûts qui bougent avec le volume.' },
      { heading: 'Charges fixes', body: 'Loyer, outils, salaires fixes et frais administratifs doivent aussi être couverts par la marge globale, même s’ils ne sont pas sur une seule facture.' },
      { heading: 'Test de marge', body: 'Marge unitaire = prix de vente hors taxes − coût variable unitaire. Compare cette marge à tes charges fixes et à ton volume réaliste.' },
      { heading: 'Réviser', body: 'Révise le prix lors d’un changement de fournisseur, de coût, de délai de paiement ou de positionnement. Documente la décision pour comprendre son effet.' },
    ],
    infographic: { type: 'formula', line1: 'Marge unitaire = prix HT − coût variable unitaire', example: '50 DT − 30 DT = 20 DT de marge unitaire' },
  },
  'recouvrement-clients': {
    type: 'guide', min: 5, level: 'Débutant',
    title: 'Recouvrement clients : protéger ta trésorerie',
    intro: 'Chaque facture impayée immobilise de la trésorerie. Une relance claire, régulière et respectueuse améliore les encaissements sans attendre le dernier moment.',
    sections: [
      { heading: 'Avant la facture', body: 'Valide le client, le prix, la date d’échéance, le moyen de paiement et les coordonnées. Plus l’accord est clair, moins la relance est difficile.' },
      { heading: 'Suivi hebdomadaire', body: 'Classe les factures : à échoir, échues, contestées, promise de paiement. Commence la relance dès l’échéance avec le numéro et le montant exacts.' },
      { heading: 'Mesurer', body: 'Suis le montant échoué, le délai moyen d’encaissement et les principaux retards. Ces chiffres alimentent directement ta prévision de trésorerie.' },
      { heading: 'Escalader proprement', body: 'Pour une contestation ou un retard persistant, conserve les échanges et applique le processus contractuel. Demande conseil avant toute action juridique.' },
    ],
    infographic: { type: 'flow', steps: ['Facturer clairement', 'Rappeler avant échéance', 'Relancer à l’échéance', 'Noter la promesse', 'Vérifier l’encaissement', 'Escalader si nécessaire'] },
  },
};

export function findContent(type, slug) {
  const map = type === 'law' ? LAWS : type === 'tax-guide' ? TAX_GUIDES : type === 'finance-guide' ? FINANCE_GUIDES : ACCOUNTING_GUIDES;
  return map[slug] || null;
}

export function allKnowledgeItems() {
  return [
    ...Object.entries(ACCOUNTING_GUIDES).map(([slug, item]) => ({ slug, routeType: 'accounting-guide', category: 'Comptabilité', ...item })),
    ...Object.entries(TAX_GUIDES).map(([slug, item]) => ({ slug, routeType: 'tax-guide', category: 'Fiscalité', ...item })),
    ...Object.entries(FINANCE_GUIDES).map(([slug, item]) => ({ slug, routeType: 'finance-guide', category: 'Finance', ...item })),
    ...Object.entries(LAWS).map(([slug, item]) => ({ slug, routeType: 'law', category: 'Lois', ...item })),
  ];
}
