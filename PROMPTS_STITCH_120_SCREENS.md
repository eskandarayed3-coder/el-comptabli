# El Comptabli — Prompts Stitch : LES 120 ÉCRANS COMPLETS

> La bibliothèque de design complète, calée sur ton architecture. Un prompt = un écran.
> Le DESIGN.md chargé dans Stitch applique le style automatiquement.
> Les écrans marqués 🎯 = MVP (à designer ET coder en premier).
> Les écrans Admin (96–105) sont des écrans WEB desktop (1440px), précisé dans leurs prompts.

---

# 🏠 MODULE 1 — ONBOARDING (10)

## 1. Splash 🎯
```
Splash screen: centered bold logo "El Comptabli" with a calculator+spark icon, tagline
"Ton assistant fiscal & comptable IA 🇹🇳", teal gradient background, loading dots bottom.
```

## 2. Welcome 🎯
```
Welcome screen: soft abstract teal hero shapes, title "Ahla bik fi El Comptabli",
subtitle "La compta et les impôts, expliqués simplement", 3 small feature rows with
icons (Pose tes questions à l'IA / Scanne tes factures / Suis tes échéances), large
dark teal pill "Commencer" + ghost "J'ai déjà un compte".
```

## 3. Choose Language 🎯
```
Language selection screen "Choisis ta langue": 3 large radio cards — العربية التونسية
(selected, teal tint + check, RTL preview text), Français, English. Pill "Continuer".
```

## 4. Select User Type 🎯
```
Onboarding "Tu es qui ?" (progress 1/4): 2x2 grid of selectable cards with icon +
example — Freelance ("graphiste, dev"), Micro-entreprise ("boutique, café, artisan"),
Société ("SARL, SUARL"), Comptable ("je gère des clients"). Freelance selected.
Pill "Continuer".
```

## 5. Business Information 🎯
```
Onboarding "Ton activité" (2/4): labeled inputs Nom de l'activité ("Studio Eskandar
Design"), Ville (dropdown "Nabeul"), Secteur (dropdown "Services numériques"),
Matricule fiscal (optional, "1234567/A/M/000"). Pill "Continuer" + ghost "Plus tard".
```

## 6. Tax Regime Selection 🎯
```
Onboarding "Ton régime fiscal" (3/4): 3 large selectable cards — Régime forfaitaire
("petites structures, impôt simplifié"), Régime réel ("TVA, comptabilité détaillée",
selected), Je ne sais pas ("l'IA t'aidera à choisir", indigo tint). Pill "Continuer".
```

## 7. AI Introduction 🎯
```
Onboarding "Ton assistant IA" (4/4): chat preview card with an assistant bubble "Pose-
moi n'importe quelle question fiscale, en darija ou français 🤖", 3 example chips below,
a small "IA adossée à une base fiscale vérifiée" teal pill, pill "Continuer".
```

## 8. Subscription Selection 🎯
```
Plan selection: 2 cards side by side — Gratuit ("questions limitées, calendrier,
guides", ghost "Commencer gratuit") and Premium 20 DT/mois with purple "Populaire" pill
("IA illimitée, scanner, exports, dashboard", dark teal pill "Essayer Premium").
Tiny "Comparer les plans" link.
```

## 9. Permissions
```
Permissions screen "Dernière étape": 3 permission cards with toggles — Notifications
("pour tes rappels d'échéances", ON), Appareil photo ("pour scanner tes factures", ON),
Stockage ("pour importer des PDF", OFF). Pill "Terminer".
```

## 10. Complete Setup
```
Setup complete screen: big animated teal check circle, title "Tout est prêt, Eskandar
🎉", summary card (Freelance · Régime réel · Nabeul · Plan gratuit), confetti accents,
dark teal pill "Aller à mon dashboard".
```

---

# 🔐 MODULE 2 — AUTHENTICATION (5)

## 11. Login 🎯
```
Login: logo top, tabs Connexion (active) | Inscription, inputs Email + Mot de passe
(eye icon), pill "Se connecter", link "Mot de passe oublié ?", divider "ou", outlined
pill "Continuer avec Google". Language toggle top right.
```

## 12. Register 🎯
```
Register: Inscription tab active, inputs Nom complet, Email, Mot de passe (strength
bar), checkbox "J'accepte les conditions & le disclaimer pédagogique", pill "Créer mon
compte", Google outlined pill.
```

## 13. Forgot Password
```
Forgot password: title "Mot de passe oublié ?", subtitle "On t'envoie un lien de
réinitialisation", Email input, pill "Envoyer le lien", ghost "Retour à la connexion".
Success state variant below: teal-tinted card "✓ Email envoyé à esk***@gmail.com".
```

## 14. OTP Verification 🎯
```
OTP screen "Vérifie ton email": 6 square OTP boxes (3 filled "4 8 2"), countdown
"Renvoyer dans 00:42", disabled ghost "Renvoyer", pill "Vérifier".
```

## 15. Two-Factor Authentication
```
2FA screen "Double sécurité": shield icon in teal tinted circle, subtitle "Entre le
code de ton app d'authentification", 6 OTP boxes, toggle row "Se souvenir de cet
appareil 30 jours" (ON), pill "Confirmer".
```

---

# 🏡 MODULE 3 — DASHBOARD (5)

## 16. Dashboard Home 🎯
```
Home dashboard: greeting "Ahla, Eskandar 👋" + avatar + bell with red dot. Teal
gradient hero card "Ta situation fiscale" (progress ring 80% à jour, "Prochaine
échéance : TVA — 28 juillet", white pill "Voir"). 3 stat cards: Échéances ce mois 2
(amber) / Solde +1 240 DT (teal) / Questions IA 8 (indigo). Section "Aujourd'hui": 2
task cards (coral "Déposer TVA juin — En retard", amber "3 factures à scanner").
Indigo AI card "💡 Tes dépenses carburant +30% ce mois". 4 question chips. Floating
pill bottom nav: Accueil (active), IA, Scanner, Finance, Savoir.
```

## 17. Financial Overview 🎯
```
Financial overview "Vue d'ensemble — Juillet 2026": month selector arrows, 2x2 KPI grid
(Revenus 3 200 DT teal +12% / Dépenses 1 960 DT coral +8% / Profit 1 240 DT indigo /
TVA à payer 312 DT amber), dual-line 6-month chart card, donut "Dépenses par catégorie"
(Loyer 35%, Achats 30%, Carburant 20%, Autres 15%) with legend, ghost "📊 Rapport
complet".
```

## 18. Today's Tasks
```
Today's tasks screen "Aujourd'hui — 16 juillet": progress header "2/5 faites" with a
thin progress bar. Task cards with checkboxes: coral "Déposer déclaration TVA juin"
(En retard pill), amber "Scanner 3 factures fournisseurs", amber "Vérifier facture
STEG", teal checked "Enregistrer recette client Wafa ✓", teal checked "Répondre à
l'IA sur le régime ✓". FAB "+ Tâche".
```

## 19. AI Recommendations
```
AI recommendations screen "L'IA te conseille 💡": stacked indigo-tinted cards, each
with an insight + action pill: "Tes dépenses carburant ont augmenté de 30% — Voir le
détail", "Tu peux économiser 96 DT de TVA déductible sur tes achats — Comment ?",
"Ton acompte provisionnel arrive le 25 sept — Estimer le montant", "3 factures scannées
attendent validation — Valider". Each card has a tiny "Basé sur tes données" caption.
```

## 20. Recent Activities
```
Activity feed screen "Activité récente": timeline list grouped by day, slim rows with
icon in tinted circle + text + time: "Facture STEG scannée (141,134 DT)" 10:24,
"Question posée à l'IA : TVA freelance" 09:12, "Recette +850 DT ajoutée" hier,
"Rapport juin exporté en Excel" hier, "Déclaration TVA mai marquée payée" 12 juil.
```

---

# 🤖 MODULE 4 — AI ASSISTANT (5)

## 21. AI Chat 🎯
```
AI chat "El Comptabli 🤖" + "IA vérifiée" pill + history icon. Disclaimer banner.
Assistant indigo bubble "Ahla ! Pose-moi ta question fiscale 👋"; user teal bubble
"Est-ce que je dois facturer la TVA ?"; assistant answer with source badges "Sources :
TVA · vérifié 2026" and an inline coral mini-card "⚠️ Cas complexe ? Consulte un
expert" + ghost "Trouver un expert". 2 suggestion chips, typing indicator, fixed input
bar + round teal send button.
```

## 22. Voice Chat
```
Voice chat screen: large centered pulsing teal circle with mic icon, live waveform
animation, transcribed text appearing below "شنوة الفرق بين الفورفيتار والريجيم الحقيقي؟",
assistant reply card streaming, bottom controls: round buttons mute, keyboard (switch
to text), stop (red). Caption "L'IA t'écoute…".
```

## 23. Chat History 🎯
```
Chat history "Mes conversations": search bar, conversation cards with auto title
("TVA freelance", "Régime forfaitaire 2026", "Calcul IRPP 24 000 DT"), date, gray
preview line, domain pill (Fiscalité teal / Compta indigo), one pinned card with pin
icon. FAB "+ Nouvelle question".
```

## 24. Suggested Questions 🎯
```
Suggested questions "Questions fréquentes": topic filter pills (Toutes active, TVA,
IRPP, Forfaitaire, Compta, CNSS), slim question cards with arrow + domain pill:
"C'est quoi le régime forfaitaire ?", "Comment calculer ma TVA ?", "Je déclare quoi
chaque mois ?", "C'est quoi un acompte provisionnel ?", "CNSS indépendant, ça marche
comment ?".
```

## 25. AI Generated Reports
```
AI reports screen "Rapports IA ✨" with purple Premium pill: prompt input card "Demande
un rapport en langage naturel…" with example chips ("Mes dépenses par catégorie ce
trimestre", "Compare juin et juillet", "Où je peux économiser ?"). Below, generated
report cards: title, date, mini chart thumbnail, pills Excel/PDF. One card in
"Génération en cours…" state with skeleton lines.
```

---

# 📷 MODULE 5 — AI SCANNER (6)

## 26. Scan Invoice 🎯
```
Scanner "Scanner" + purple Premium pill: large dashed upload zone (light teal, camera
icon, "Prends une photo ou importe un PDF"), pill "📷 Scanner une facture", ghost
"Importer un fichier". Section "Derniers scans": 2 slim cards ("Facture STEG —
141,134 DT" teal Validée pill; "Reçu Carrefour — 84,300 DT" amber À vérifier pill).
```

## 27. Scan Receipt
```
Receipt scan camera view: full-screen camera frame with rounded corner guides and a
teal scanning line animation over a receipt, caption "Cadre le reçu — la capture est
automatique", bottom: gallery thumbnail button, big white shutter, flash toggle. A
small tip pill "Assure un bon éclairage 💡".
```

## 28. Scan Tax Document
```
Tax document scan screen "Scanner un document fiscal": document type selector pills
(Avis d'imposition, Déclaration, Quittance, Autre), upload zone, info indigo card
"L'IA extrait les montants et les échéances automatiquement", pill "Scanner".
```

## 29. OCR Review 🎯
```
OCR review "Vérifie les données ✓": small invoice thumbnail with zoom icon, form card
with pre-filled fields in 2 columns (Fournisseur "STEG" highlighted amber with
"Confiance : 87%" pill, N° "F-2026-0715", Date "12/07/2026", HT "118,600", TVA
"22,534", TTC "141,134"), category pill selector (Électricité selected), ghost
"Corriger" + pill "Enregistrer la dépense".
```

## 30. Document Validation
```
Validation queue screen "À valider (3)": swipeable document cards each with thumbnail,
extracted summary (Fournisseur, TTC, Date), confidence pill (87% amber / 96% teal),
and two action buttons per card: ghost "Corriger" + teal pill "Valider ✓". Top
progress "1 sur 3".
```

## 31. Document Details 🎯
```
Document details: invoice image preview card, title "Facture STEG — Juillet", Validée
teal pill, info rows (TTC 141,134 DT, TVA 22,534 DT, Catégorie Électricité, Ajoutée le
16/07/2026, Liée à Dépense #D-0182 link), action row: ghost icons Télécharger PDF,
Partager, Supprimer (red).
```

---

# 💰 MODULE 6 — INCOME (4)

## 32. Income List 🎯
```
Income list "Revenus — Juillet": teal-tinted total card "+3 200 DT ce mois (+12%)",
filter pills (Tous, Payés, En attente), income rows grouped by date: "Facture client
Wafa — Site web" +850 DT Payé teal pill, "Acompte projet Amine" +400 DT En attente
amber pill, "Formation design" +1 950 DT Payé. FAB "+ Revenu".
```

## 33. Add Income 🎯
```
Bottom sheet "Ajouter un revenu": huge centered amount "850" + DT, fields Client
("Wafa Trading"), Catégorie pills (Ventes selected, Services, Formation, Autre), Date
("16 juillet 2026"), Statut segmented (Payé selected | En attente), Note optional,
TVA toggle "Facturé avec TVA 19%" (ON showing "TVA : 135,7 DT"). Pill "Enregistrer".
```

## 34. Income Details
```
Income details: big centered "+850 DT" in green, category icon in teal circle, Payé
pill, info rows (Client Wafa Trading, Catégorie Ventes, Date 16 juillet, TVA collectée
135,7 DT, Ajouté via Saisie manuelle), indigo AI card "💡 Wafa Trading = ton meilleur
client ce trimestre (2 400 DT)", ghost "Modifier" + ghost red "Supprimer".
```

## 35. Edit Income
```
Edit income screen: same form as Add Income but title "Modifier le revenu", fields
pre-filled (850 DT, Wafa Trading, Ventes, Payé), a small "Historique" caption "Créé le
16/07 · Modifié jamais", pill "Enregistrer les modifications" + ghost "Annuler".
```

---

# 💸 MODULE 7 — EXPENSES (4)

## 36. Expense List 🎯
```
Expense list "Dépenses — Juillet": coral-tinted total card "-1 960 DT ce mois (+8%)",
filter pills (Toutes, Déductibles, Non déductibles), expense rows: "Facture STEG" -141
DT Électricité pill, "Plein gasoil" -420 DT Carburant, "Loyer bureau" -680 DT Loyer,
"Fournitures" -95 DT Achats. Each with TVA récupérable amount in tiny gray text.
FAB "+ Dépense".
```

## 37. Add Expense 🎯
```
Bottom sheet "Ajouter une dépense": huge centered amount "420" + DT (coral accent),
Catégorie pills (Carburant selected), Fournisseur ("Station Agil"), Date, TVA toggle
"TVA récupérable 19%" (ON, "TVA : 67 DT"), Note ("Plein gasoil"), pill "Enregistrer" +
ghost "Scanner une facture à la place 📷".
```

## 38. Expense Details 🎯
```
Expense details: big "-420 DT" in red, Carburant icon in coral circle, info rows
(Fournisseur Station Agil, Date 16 juillet, TVA récupérable 67 DT, Ajouté via Saisie),
indigo AI card "💡 3e dépense carburant ce mois (total 180 DT)", ghost "Modifier" +
ghost red "Supprimer", linked document thumbnail if scanned.
```

## 39. Categories 🎯
```
Categories screen "Catégories": 2-column grid of category cards (icon in tinted circle
+ name + monthly total): Ventes +3 200 DT teal, Achats -590 DT, Loyer -680 DT,
Carburant -180 DT, Salaires —, Électricité -141 DT, Télécom -45 DT, Autre -324 DT.
Dashed "+ Nouvelle catégorie" card. Long-press hint caption "Maintiens pour modifier".
```

---

# 📒 MODULE 8 — ACCOUNTING (6)

## 40. Accounting Dashboard
```
Accounting dashboard "Comptabilité 📒" (V2 module): 3 stat cards (Écritures ce mois 42
teal / À catégoriser 6 amber / Journaux 3 indigo), quick action cards (Journal des
ventes, Journal des achats, Grand livre, Balance), slim banner "Généré automatiquement
depuis tes transactions ✨", ghost "Exporter pour mon comptable".
```

## 41. Journal Entries
```
Journal entries screen "Journal — Juillet": table-like slim rows, each entry card with
date, label ("Vente Wafa Trading"), and a two-line debit/credit layout: "411 Clients —
Débit 1 011,7" / "707 Ventes — Crédit 850 · 4367 TVA collectée — Crédit 161,7". Filter
pills (Tous, Ventes, Achats, Banque). FAB "+ Écriture manuelle".
```

## 42. Chart of Accounts
```
Chart of accounts "Plan comptable (SCE)": search bar, collapsible class sections
(Classe 1 Capitaux, Classe 2 Immobilisations, Classe 4 Tiers expanded showing rows
"401 Fournisseurs", "411 Clients", "4366 TVA déductible", "4367 TVA collectée", Classe
6 Charges, Classe 7 Produits), each row with account number in a small teal pill +
label. Caption "Conforme au Système Comptable des Entreprises".
```

## 43. Trial Balance
```
Trial balance "Balance — Juillet 2026": summary card "Débit total 12 480 = Crédit total
12 480 ✓" (teal tint), compact table rows per account (N°, Libellé, Débit, Crédit) for
411, 401, 532, 607, 707, 4367, with totals row highlighted. Export pills Excel / PDF.
```

## 44. General Ledger
```
General ledger "Grand livre — 411 Clients": account selector dropdown at top, running
list of movements with date, label, débit/crédit, and a running balance column ("Solde:
1 240 DT" teal). Period pills (Mois, Trimestre, Année). Export ghost buttons.
```

## 45. Financial Reports (compta)
```
Accounting reports screen "États financiers": 3 report cards with lock/unlock states —
Bilan simplifié (thumbnail, Excel/PDF pills), État de résultat (thumbnail, pills),
Notes annexes (purple Premium pill, dimmed). Caption "Indicatif — à faire certifier par
un expert-comptable pour usage officiel".
```

---

# 🧾 MODULE 9 — TAX (7)

## 46. Tax Dashboard 🎯
```
Tax dashboard "Mes impôts": amber hero card "TVA à payer ce mois : 312 DT" (breakdown
"Collectée 1 900 − Déductible 1 588", pill "Échéance 28 juillet"), 2 stat cards (IRPP
estimé 2026 "2 350 DT" indigo / Acomptes payés "2/3" teal), quick actions (Calculer ma
TVA, Estimer mon IRPP, Calendrier fiscal), history slim cards ("TVA juin — 288 DT —
Payée ✓", "TVA mai — 301 DT — Payée ✓").
```

## 47. VAT Calculator 🎯
```
VAT calculator "Calcul TVA": segmented HT→TTC | TTC→HT, amount input "1 000 DT", rate
pills (19% selected, 13%, 7%), instant result card (teal tint): "HT 1 000 · TVA 190 ·
TTC 1 190", a small formula line "1 000 × 1,19 = 1 190", ghost "Copier le résultat".
History of last 3 calculations below.
```

## 48. Income Tax Calculator 🎯
```
IRPP calculator "Calcul IRPP": inputs Revenu net annuel "24 000 DT", situation pills
(Célibataire selected, Chef de famille), enfants stepper (0), pill "Calculer". Result:
big card "IRPP estimé : 4 450 DT" (amber) + expandable bracket detail card with the
8-tranche progressive lines ("5 000 × 0% = 0", "5 000 × 15% = 750", "10 000 × 25% =
2 500", "4 000 × 30% = 1 200"). Warning banner "Estimation indicative".
```

## 49. Tax Calendar 🎯
```
Tax calendar "Échéances": month selector "Juillet 2026 ▾" + bell, horizontal day-strip
(today 16 in dark teal pill, deadline days with colored dots), 3 stat cards (Cette
semaine 1 amber / Ce mois 3 teal / En retard 1 coral), filter pills, urgency-tinted
deadline cards (coral "TVA juin — En retard", amber "TVA juillet — 28 juillet — Tu
déclares la TVA collectée moins la TVA payée", amber "Acompte provisionnel — 25 sept",
teal "TVA mai — Payée ✓"), each with "🔔 Me rappeler". FAB "+ Rappel".
```

## 50. Tax Deadlines (détail)
```
Deadline detail screen: amber hero "Déclaration TVA — Juillet", due date big "28
juillet 2026" with a countdown pill "Dans 12 jours", explanation card in plain language
with a small worked example, checklist card ("Factures de vente saisies ✓", "Factures
d'achat scannées — 3 manquantes", "Montant calculé ✓ 312 DT"), pill "Me rappeler" +
ghost "Demander à l'IA".
```

## 51. Tax Estimation 🎯
```
Tax estimator "Estime tes impôts": segmented TVA | IRPP (IRPP selected), form card (CA
annuel "24 000 DT", Charges "6 000 DT", régime pill Réel selected), pill "Estimer",
3 result stat cards (TVA 1 140 indigo / IRPP 2 350 amber / Net 14 510 teal),
expandable "Détail du calcul" with formula lines, big warning banner "⚠️ Estimation
indicative — consulte un expert-comptable".
```

## 52. Tax History
```
Tax history "Historique fiscal": year selector pills (2026 active, 2025), timeline of
paid/declared items as tinted cards: teal "TVA juin 2026 — 288 DT — Payée le 26/07",
teal "TVA mai — 301 DT — Payée", indigo "Acompte 1 IRPP — 780 DT — Payé le 25/03",
coral "TVA avril — 295 DT — Payée en retard (+14 DT pénalité)". Yearly total card
"Total payé 2026 : 1 664 DT". Export pills.
```

---

# 📊 MODULE 10 — REPORTS (6)

## 53. Monthly Report 🎯
```
Monthly report "Juillet 2026": summary hero card (Revenus 3 200 / Dépenses 1 960 /
Profit 1 240 in 3 columns), bar chart card "Par semaine" (4 teal bars), "Top
catégories" rows with progress bars (Loyer 680 DT 35%, Achats 590 DT 30%, Carburant
180 DT 9%), amber TVA card "Collectée 1 900 − Déductible 1 588 = 312 DT", pills
"📥 Export Excel" + ghost "PDF", caption "Généré par El Comptabli — indicatif".
```

## 54. Annual Report
```
Annual report "Année 2026": hero card with yearly totals (Revenus 38 400 / Dépenses
23 500 / Profit 14 900), 12-month bar chart, quarter comparison cards (T1 → T3 with
trend arrows), "Impôts payés" slim card (1 664 DT), purple Premium pill on "Rapport
annuel complet PDF" button.
```

## 55. Profit & Loss
```
P&L screen "Profit & Perte — Juillet": clean statement-style card with grouped rows:
Produits d'exploitation 3 200, Charges d'exploitation (détail lines Achats 590, Loyer
680, Carburant 180, Autres 510) total -1 960, Résultat d'exploitation 1 240 (teal
highlight row), Impôts estimés -312, Résultat net 928 bold final row. Period pills +
export ghost buttons.
```

## 56. Cash Flow
```
Cash flow screen "Trésorerie": area chart card showing balance curve over 3 months
with a projected dotted section, stat cards (Entrées 3 200 teal / Sorties 1 960 coral /
Solde fin de mois 1 240 indigo), slim alert amber card "⚠️ Le 28 juillet, après ta TVA
(312 DT), ton solde projeté = 928 DT", list of upcoming movements.
```

## 57. Balance Sheet
```
Balance sheet "Bilan simplifié — 30 juin 2026": two stacked cards Actif (Immobilisations
2 400, Créances clients 1 250, Banque 3 180, Caisse 220 — Total 7 050) and Passif
(Capital 3 000, Résultat 2 738, Dettes fournisseurs 890, TVA à payer 312, Emprunts 110
— Total 7 050), matching totals highlighted teal "✓ Équilibré". Caption "Indicatif —
certification par expert-comptable requise pour usage officiel".
```

## 58. Expense Analysis
```
Expense analysis "Analyse des dépenses": donut chart by category with center total
"1 960 DT", legend rows with % and trend arrows (Loyer 35% =, Achats 30% ↑, Carburant
9% ↑30%, Autres 26%), indigo AI insight card "💡 Carburant en hausse : 3 pleins ce mois
vs 2 en juin", month comparison mini bars, ghost "Exporter l'analyse".
```

---

# 📈 MODULE 11 — ANALYTICS (5)

## 59. KPI Dashboard
```
KPI dashboard "Performance 📈" with purple Premium pill: 2x3 grid of KPI cards each
with big number, label, sparkline and trend pill: CA mensuel 3 200 DT +12%, Marge 39%
+2pts, Panier moyen 640 DT, Délai paiement clients 12j -3j, TVA récupérée 245 DT,
Clients actifs 5. Period pills (Mois, Trimestre, Année).
```

## 60. Revenue Charts
```
Revenue analytics "Revenus": large smooth line chart (6 months, teal) with a dotted
AI-projected next month, breakdown pills (Par client, Par catégorie, Par mois), top
clients horizontal bar list (Wafa Trading 2 400, Amine SARL 1 100, Formation 950),
teal insight card "Meilleur mois : mai (4 100 DT)".
```

## 61. Expense Charts
```
Expense analytics "Dépenses": stacked bar chart by category over 6 months, category
filter chips, coral insight card "Carburant a doublé depuis mai", table-like slim rows
with month-over-month deltas.
```

## 62. Business Performance
```
Business performance screen: hero score card "Santé financière : 78/100" with a
circular gauge (teal), 4 sub-score rows with mini bars (Rentabilité 82, Trésorerie 74,
Régularité fiscale 90, Croissance 65), indigo AI summary card "Ton business est sain.
Point d'attention : la trésorerie de fin de mois après la TVA."
```

## 63. AI Insights
```
AI insights feed "Insights ✨" with purple Premium pill: stacked insight cards each
with icon, finding, and action pill: "💰 Tu peux récupérer 67 DT de TVA sur tes 3
factures non scannées — Scanner", "📉 Marge en baisse de 3pts vs juin — Voir pourquoi",
"📅 Prévois 928 DT de solde après la TVA du 28 — Voir la tréso", "🎯 Objectif CA
mensuel atteint à 91% — Détail". Refresh caption "Mis à jour il y a 2h".
```

---

# 📚 MODULE 12 — KNOWLEDGE CENTER (6)

## 64. Accounting Guides
```
Accounting guides "Guides compta 📒": search bar, level pills (Débutant active,
Intermédiaire), guide cards with icon + title + reading time + level pill: "La partie
double expliquée avec un café" 4 min, "Plan comptable tunisien : les bases" 6 min,
"Journal, grand livre, balance : qui fait quoi" 5 min, "Lire un bilan sans paniquer"
7 min.
```

## 65. Tax Guides 🎯
```
Tax guides "Guides fiscalité 🧾": same layout, cards: "Le régime forfaitaire expliqué
simplement" 5 min, "TVA : collectée vs déductible" 3 min, "IRPP : comment marchent les
tranches" 4 min, "Acomptes provisionnels, c'est quoi ?" 3 min, "CNSS pour indépendants"
5 min. Each with "vérifié 2026" teal pill or "à jour LF 2026" amber pill.
```

## 66. Tunisian Laws
```
Laws library "Lois tunisiennes 🇹🇳": search bar, category pills (Code TVA, Code IRPP/IS,
SCE, Loi de finances), law cards with official-style header: number + date + one-line
plain-language summary ("Loi 96-112 — Système comptable des entreprises — La loi qui
définit comment tenir ta compta"), chevron to read. Caption "Résumés pédagogiques —
textes officiels sur jort.gov.tn".
```

## 67. Finance Law Updates 🎯
```
Finance law updates "Loi de finances 2026 🆕": hero indigo card "Ce qui change pour toi
en 2026" with 3 bullet rows (Nouveau régime forfaitaire optionnel BIC, Facturation
électronique obligatoire pour les services, Barème IRPP 8 tranches maintenu), each with
an "Expliqué par l'IA" ghost pill. Timeline of updates below with date pills.
```

## 68. FAQ
```
FAQ screen: search bar, accordion cards grouped by topic (Compte & abonnement, IA &
fiabilité expanded showing "L'IA peut-elle se tromper ? — Oui, c'est un outil
pédagogique adossé à une base vérifiée ; en cas de doute consulte un expert", Scanner,
Données & sécurité). Contact card at bottom "Pas trouvé ? Écris-nous" with pill.
```

## 69. Search Knowledge
```
Knowledge search screen: large search bar with query "forfaitaire" typed, results
grouped in sections: Guides (2 cards), Lois (1 card), Questions fréquentes (2 rows),
each result with highlighted keyword, and a bottom indigo card "🤖 Demander directement
à l'IA : C'est quoi le forfaitaire ?" with pill "Poser la question".
```

---

# 👨‍💼 MODULE 13 — EXPERT ACCOUNTANTS (6)

## 70. Find Accountant
```
Expert directory "Trouver un expert-comptable 👨‍💼": search + city dropdown (Nabeul),
specialty pills (TVA, Création société, Forfaitaire, Audit), expert cards: avatar, name
"Mounir B.", "Expert-comptable certifié · Nabeul", rating 4,8 ★ (127 avis), specialty
pills, price line "Consultation dès 60 DT", pill "Voir profil". 3 cards + "Vérifiés par
El Comptabli ✓" caption.
```

## 71. Accountant Profile
```
Expert profile: header with avatar, name Mounir B., certified badge teal pill, rating
4,8 ★, city, years "15 ans d'expérience", bio paragraph, specialty pills, services
price list card (Consultation 30 min — 60 DT, Déclaration TVA — 90 DT, Création SUARL
— 350 DT), reviews section (2 review cards), sticky bottom bar with pill "Prendre RDV"
+ ghost chat icon button.
```

## 72. Appointment Booking
```
Booking screen "Réserver avec Mounir B.": service selector cards (Consultation 30 min
60 DT selected), week day-strip, time slot pills grid (10:00, 11:30 selected teal,
14:00, 16:30), mode segmented (Visio | Au cabinet), summary card "Jeudi 23 juillet ·
11:30 · Visio · 60 DT", pill "Confirmer et payer".
```

## 73. Chat with Accountant
```
Expert chat screen: header with Mounir B. avatar + "En ligne" green dot, system teal
banner "Consultation liée à ton dossier TVA juillet", mixed bubbles (user teal, expert
white with avatar), a shared document card in the thread (Facture STEG.pdf), input bar
with attachment clip + send. Caption "Réponse sous 24h en moyenne".
```

## 74. Video Consultation
```
Video call screen: full-screen expert video placeholder with name overlay "Mounir B. —
Expert-comptable", small self-view pip top right, call timer "12:34", bottom control
bar (mute, camera, share document, end call red), a slim overlay card "Document partagé :
Déclaration TVA juillet.pdf".
```

## 75. Consultation History
```
Consultation history "Mes consultations": cards per session: expert avatar + name, date,
type pill (Visio / Chat), status pill (Terminée teal / À venir amber), price, and for
finished ones a ghost "Voir le résumé" + star rating row. One upcoming card with pill
"Rejoindre" (23 juillet 11:30).
```

---

# 📁 MODULE 14 — DOCUMENTS (5)

## 76. All Documents 🎯
```
Documents screen "Mes documents 📁": search bar, type filter pills (Tous, Factures,
Reçus, Déclarations, Exports), grid of document cards (2 columns) with thumbnail, name
("Facture STEG juil"), date, size, status pill. Storage caption "34 documents · 128 Mo".
FAB "+ Ajouter".
```

## 77. Upload Document
```
Upload sheet "Ajouter un document": 3 big option cards (📷 Scanner avec l'appareil,
🖼️ Depuis la galerie, 📄 Importer un PDF), then type selector pills (Facture, Reçu,
Déclaration, Autre), toggle "Analyser avec l'IA (extraction auto)" ON, pill "Ajouter".
```

## 78. Document Categories
```
Document categories screen: folder-style cards with icon + count: Factures fournisseurs
(18), Reçus (9), Déclarations fiscales (4), Exports comptables (3), Non classés (2,
amber tint with "À classer" pill). Dashed "+ Nouveau dossier" card.
```

## 79. PDF Viewer
```
PDF viewer screen: document page preview centered (invoice), top bar with name +
page "1/2", bottom toolbar: zoom, annotate, share, download icons, and a teal action
pill "Extraire les données ✨". A small extracted-data preview card sliding from bottom.
```

## 80. Excel Export 🎯
```
Export screen "Exporter mes données 📤": period pills (Mois active, Trimestre, Année,
Personnalisé), content checkboxes as cards (Transactions ✓, Factures scannées ✓,
Journal comptable ✓, Rapport TVA), format segmented (Excel selected | PDF | CSV),
recipient input optional "Email de ton comptable", pill "Générer l'export". Success
state card "✓ Export prêt — envoyé à naji@cabinet.tn" (teal tint).
```

---

# 🔔 MODULE 15 — NOTIFICATIONS (3)

## 81. Notifications 🎯
```
Notifications "Notifications": filter pills (Toutes active, Échéances, IA, Système),
Today: coral card "⏰ Déclaration TVA juin en retard" 2h + unread dot, amber card
"📅 TVA juillet avant le 28" 5h. Hier: indigo card "💡 Hausse dépenses carburant
détectée", teal card "✓ Facture STEG enregistrée". Ghost "Tout marquer lu" top right.
```

## 82. Tax Reminders
```
Tax reminder settings "Rappels fiscaux 🔔": master toggle ON, reminder timing cards
with toggles (7 jours avant ON, 3 jours avant ON, Le jour même ON, En cas de retard —
quotidien ON coral tint), channel section toggles (Push ON, Email ON, SMS OFF with
Premium pill), quiet hours row "22:00 — 08:00".
```

## 83. AI Alerts
```
AI alerts settings "Alertes intelligentes ✨" with Premium pill: toggle cards with
descriptions: Anomalies de dépenses ("préviens-moi si une catégorie explose", ON),
Trésorerie basse ("si mon solde projeté < 500 DT", ON, editable threshold), TVA
récupérable oubliée (ON), Opportunités d'économie (OFF). Caption "L'IA n'envoie jamais
tes données à des tiers".
```

---

# 👥 MODULE 16 — TEAM (2)

## 84. Team Members
```
Team screen "Mon équipe 👥" (Business plan): member cards with avatar, name, role pill
(Propriétaire teal "Eskandar", Comptable indigo "Naji B.", Assistant gray "Sana M."),
last active caption, chevron. Dashed "+ Inviter un membre" card with email input hint.
Plan limit caption "3/5 membres — plan Business".
```

## 85. Roles & Permissions
```
Roles screen "Rôles & permissions": role selector pills (Propriétaire, Comptable
selected, Assistant), permission toggle rows grouped (Finance: voir ✓ / modifier ✓ /
supprimer ✗ ; Documents: voir ✓ / ajouter ✓ ; Fiscalité: déclarer ✓ ; Abonnement: gérer
✗), pill "Enregistrer". Info banner "Le comptable ne voit jamais tes identifiants".
```

---

# 💳 MODULE 17 — SUBSCRIPTION (4)

## 86. Pricing 🎯
```
Pricing "Choisis ton plan": toggle Mensuel | Annuel (-20%), 3 stacked plan cards:
Gratuit 0 DT (ghost "Plan actuel"), Premium 20 DT/mois purple border + "Populaire" pill
(IA illimitée, scanner, exports, dashboard, rappels — pill "Passer Premium"), Comptable
Pro "Sur devis" dimmed with "Bientôt" pill. Caption "Annulable à tout moment".
```

## 87. Upgrade to Premium
```
Upgrade screen: purple gradient hero "Passe à Premium ✨", feature comparison rows
(Gratuit vs Premium columns with check/cross icons: Questions IA 10/mois vs Illimitées,
Scanner ✗ vs ✓, Exports ✗ vs ✓, Rapports avancés ✗ vs ✓), price card 20 DT/mois or
192 DT/an (-20%), pill "Continuer", tiny "Essai 7 jours gratuit" pill.
```

## 88. Payment 🎯
```
Payment screen "Finalise ton abonnement": order summary card (Premium mensuel — 20 DT,
"Facturé aujourd'hui : 20 DT"), payment method radio cards (Carte bancaire selected
with inputs Numéro, MM/AA, CVV ; e-Dinar ; Virement), pill "Payer 20 DT", lock caption
"Paiement sécurisé SSL".
```

## 89. Billing History
```
Billing history "Factures & paiements": current plan card (Premium — prochaine échéance
16 août — ghost "Gérer"), invoice rows: "Juillet 2026 — 20 DT — Payée ✓" with PDF icon,
"Juin 2026 — 20 DT — Payée ✓", "Mai 2026 — 20 DT — Payée ✓". Ghost red "Annuler mon
abonnement" at bottom.
```

---

# 👤 MODULE 18 — PROFILE (6)

## 90. My Profile 🎯
```
Profile: avatar, name Eskandar, email, teal pill "Régime réel · Freelance", "Mon plan"
card (Gratuit — 8 questions restantes + purple "Passer Premium" pill), settings rows
(Langue FR/عربي inline, Mon activité et régime, Notifications, Exporter mes données,
Sécurité, Disclaimer & mentions, Contacter un expert "Bientôt" pill), ghost red "Se
déconnecter", version caption.
```

## 91. Company Profile
```
Company profile "Mon activité 🏢": editable field cards: Nom (Studio Eskandar Design),
Type (Freelance pill), Régime fiscal (Réel pill with "Modifier" ghost — warning caption
"Changer de régime modifie tes échéances"), Matricule fiscal (1234567/A/M/000), Ville
(Nabeul), Secteur (Services numériques), Logo upload circle. Pill "Enregistrer".
```

## 92. Settings
```
Settings screen "Réglages ⚙️": grouped rows — Général (Langue, Devise DT, Thème
Clair/Sombre/Auto segmented), Notifications (chevron), Données (Sauvegarde cloud toggle
ON, Exporter, Supprimer mes données red), IA (Langue des réponses Darija/FR segmented,
Longueur des réponses Courtes/Détaillées), À propos (version, licences).
```

## 93. Security
```
Security "Sécurité 🔒": rows — Changer le mot de passe (chevron), Double authentification
(toggle ON teal), Biométrie Face ID (toggle ON), Sessions actives ("iPhone 13 — Nabeul —
Actuelle" teal pill; "Chrome Windows — il y a 3j" + ghost "Déconnecter"), Supprimer mon
compte (red row with warning caption).
```

## 94. Language
```
Language settings "Langue 🌍": 3 radio cards with native previews — العربية التونسية
(RTL preview "أهلا بيك"), Français (selected, "Ahla bik"), English. Section "Langue des
réponses IA" with segmented Darija | Français | Mixte (Mixte selected). Caption "Le
changement est instantané". Pill "Appliquer".
```

## 95. About
```
About screen "À propos": centered logo + version 1.0.0, mission card "Rendre la compta
et la fiscalité simples pour chaque entrepreneur tunisien 🇹🇳", rows: Conditions
d'utilisation, Politique de confidentialité, Disclaimer pédagogique (highlighted amber
tint), Nous contacter, Noter l'app. Made in Tunisia caption with heart.
```

---

# 🛠️ MODULE 19 — ADMIN PANEL (10) — ÉCRANS WEB DESKTOP 1440px

## 96. Admin Dashboard
```
DESKTOP web admin dashboard (1440px, sidebar layout): left sidebar with logo + nav
(Dashboard active, Utilisateurs, Abonnements, Base de connaissance, Logs IA, Experts,
Contenu, Notifications, Analytics, Réglages), main area: 4 KPI cards (Utilisateurs
2 847 +12%, Abonnés Premium 312, MRR 6 240 DT, Questions IA/jour 1 205), line chart
(croissance 6 mois), recent signups table, system health card (API ✓, OCR ✓, RAG ✓).
```

## 97. Users Management
```
DESKTOP admin users page: search + filter dropdowns (Plan, Régime, Ville), data table
(avatar, nom, email, plan pill, régime, inscrit le, dernière activité, actions ⋯ menu),
pagination, bulk action bar, right-side user detail drawer open showing one user's
profile + activity + "Suspendre" ghost red.
```

## 98. Subscriptions Management
```
DESKTOP admin subscriptions: MRR hero cards row, plan distribution donut, subscriptions
table (user, plan, statut pill Actif/Annulé/Impayé coral, début, prochaine facture,
montant), churn line chart, export button.
```

## 99. Knowledge Base Management
```
DESKTOP admin knowledge base: file tree left panel (kb/ fiscalite/ comptabilite/),
main markdown editor with frontmatter fields (statut_verification dropdown
verifie_2026/a_verifier amber highlight), preview pane right, top bar: "Réingérer dans
le RAG" teal button + last ingestion caption, version history sidebar.
```

## 100. AI Logs
```
DESKTOP admin AI logs: filter bar (date range, statut, source utilisée), conversation
log table (horodatage, question tronquée, sources RAG utilisées pills, confiance %,
flag "sans source" coral pill, user anonymisé), detail drawer showing full Q/A with
retrieved chunks, "Marquer pour révision" button. KPI row: taux de réponses sourcées
94%, escalades expert 3%.
```

## 101. Accountant Management
```
DESKTOP admin experts page: pending applications cards row (photo, nom, n° ordre des
experts-comptables, documents pills, boutons Vérifier ✓ / Refuser), active experts
table (nom, ville, note ★, consultations, revenus générés, statut pill), commission
settings card.
```

## 102. Content Management
```
DESKTOP admin content page: tabs (Guides, FAQ, Lois, Annonces), article table (titre,
domaine pill, statut Publié/Brouillon, vues, maj le), rich text editor panel with
"vérifié 2026" badge toggle, schedule publish datetime, preview mobile frame on the
right.
```

## 103. Notifications Management
```
DESKTOP admin notifications: compose panel (audience segments checkboxes: Tous, Gratuit,
Premium, Régime réel, En retard TVA), message inputs FR + AR side by side, channel
toggles (Push/Email), schedule picker, send test button, history table with open rates.
```

## 104. Admin Analytics
```
DESKTOP admin analytics: date range picker, funnel chart (Inscription → Onboarding
complet → 1ère question IA → 1er scan → Premium), retention cohort heatmap, top
questions IA table, feature usage bar chart, export CSV button.
```

## 105. System Settings
```
DESKTOP admin system settings: cards grid — API keys (Anthropic, OCR — masked values +
rotate buttons), RAG config (chunk size, top-K, seuil de confiance sliders), taux
fiscaux globaux table (TVA 19/13/7, année fiscale 2026) with "à valider" amber flags,
maintenance mode toggle, backup schedule, audit log link.
```

---

# 🎯 MODULE 20 — FUTURE FEATURES (15)

## 106. Bank Account Connection
```
Bank connection screen "Connecte ta banque 🏦" with "Bientôt" pill: bank logo grid
(BIAT, BNA, Attijari, STB, Amen, Zitouna) as selectable cards, security reassurance
card (lock icon, "Connexion en lecture seule — on ne peut jamais toucher ton argent"),
pill "Connecter" disabled state + waitlist input "Préviens-moi".
```

## 107. Bank Transaction Import
```
Bank import review screen: bank header (BIAT ····4521, solde 3 180 DT), imported
transactions list with AI-suggested category pills on each row and a confidence dot,
bulk bar "12 catégorisées auto · 3 à vérifier" (amber), buttons Tout valider / Réviser.
```

## 108. E-Invoice
```
E-invoice screen "Facture électronique 🧾" (LF 2026): form card (client, montant HT,
TVA auto, mentions obligatoires auto-filled), compliance checklist card (Format conforme
✓, Signature ✓, Archivage ✓), preview thumbnail, pill "Générer & envoyer", caption
"Conforme à l'obligation e-facture services 2026".
```

## 109. Digital Signature
```
Digital signature screen: document preview with signature placement rectangle, signature
pad card (draw area with a sample signature stroke), identity verification row (CIN +
selfie pills ✓), pill "Signer le document", legal caption.
```

## 110. Payroll
```
Payroll screen "Paie 👥" (future): employee cards (nom, poste, brut 1 200 DT, net
calculé 942 DT with breakdown chevron), month selector, summary card (Masse salariale
3 600 DT, CNSS patronale 614 DT, Retenues IRPP 187 DT), pill "Générer les fiches de
paie", caption "Calculs CNSS/IRPP automatiques".
```

## 111. Employee Management
```
Employees screen: employee list cards (avatar, nom, poste, contrat pill CDI/CDD/SIVP,
salaire brut, ancienneté), detail drawer (infos, contrat, documents, historique paie),
dashed "+ Ajouter un employé" card.
```

## 112. Inventory
```
Inventory screen "Stock 📦": search + category pills, product rows (photo, nom, SKU,
stock level with colored dot vert/ambre/rouge, prix achat/vente), low-stock coral
banner "3 produits sous le seuil", FAB "+ Produit", valuation card "Valeur du stock :
8 420 DT".
```

## 113. Sales Management
```
Sales screen "Ventes 🛒": pipeline stat cards (Devis 4, Commandes 2, Facturé 3 200 DT),
document list (Devis #D-024 Wafa — 1 200 DT — amber En attente, Facture #F-018 — 850 DT
— teal Payée), FAB "+ Devis", convert action pills on each row (Devis → Facture).
```

## 114. Purchase Management
```
Purchases screen "Achats 🛍️": supplier order cards (Fournisseur, montant, statut pill
Commandé/Reçu/Payé, date), pending payments amber summary card "890 DT à payer sous
15j", FAB "+ Commande", link row "Voir mes fournisseurs".
```

## 115. Client CRM
```
CRM screen "Mes clients 🤝": search, client cards (avatar initials, nom Wafa Trading,
CA total 2 400 DT, dernière facture date, paiement moyen 12j, santé dot verte),
segments pills (Actifs, Inactifs 30j+, Top), detail drawer with timeline (factures,
paiements, notes), FAB "+ Client".
```

## 116. Supplier Management
```
Suppliers screen "Fournisseurs 🚚": supplier cards (STEG, Station Agil, Orange —
each with total dépensé, nb factures, TVA récupérée), amber card "890 DT d'impayés
fournisseurs", detail view with document history, FAB "+ Fournisseur".
```

## 117. Multi-Company
```
Multi-company switcher screen "Mes entreprises 🏢" (Comptable Pro): company cards
(Studio Eskandar — Freelance — badge 2 alertes, Café Sonia SUARL — Forfaitaire, Wafa
Trading SARL — Réel — teal all-good dot), each with mini KPIs (CA, échéances), dashed
"+ Ajouter une entreprise", role caption "Connecté en tant que comptable".
```

## 118. AI Forecasting
```
Forecasting screen "Prévisions ✨" (Premium): line chart with 6 months history (solid
teal) + 3 months AI forecast (dotted) with confidence band, scenario pills (Réaliste
selected, Optimiste, Prudent), forecast stat cards (CA août prévu 3 450 DT ±12%, Tréso
fin sept 2 100 DT), indigo caption card "Basé sur 14 mois de données".
```

## 119. Budget Planning
```
Budget screen "Budget 🎯": month budget hero (Dépensé 1 960 / Budget 2 500 DT with
progress bar 78%), per-category budget rows with mini progress bars (Loyer 680/680 ✓,
Carburant 180/150 dépassé coral, Achats 590/800), pill "+ Définir un budget", AI tip
card "Ajuste ton budget carburant à 200 DT".
```

## 120. Audit Assistant
```
Audit assistant screen "Assistant audit 🔍" (future, Premium): readiness score card
"Prêt pour un contrôle : 84%" with gauge, checklist cards grouped (Pièces
justificatives: 3 factures sans scan coral, Déclarations: toutes déposées teal,
Cohérence TVA: 1 écart détecté amber with "Voir" pill), pill "Générer le dossier de
contrôle", caption "Prépare-toi sereinement, avec ton expert-comptable".
```

---

# ✅ RÉCAP FINAL — 120 écrans

| # | Module | Écrans | Priorité |
|---|---|---|---|
| 1 | Onboarding | 10 | 🎯 8 MVP |
| 2 | Authentication | 5 | 🎯 3 MVP |
| 3 | Dashboard | 5 | 🎯 2 MVP |
| 4 | AI Assistant | 5 | 🎯 3 MVP |
| 5 | AI Scanner | 6 | 🎯 3 MVP |
| 6 | Income | 4 | 🎯 2 MVP |
| 7 | Expenses | 4 | 🎯 3 MVP |
| 8 | Accounting | 6 | V2 |
| 9 | Tax | 7 | 🎯 5 MVP |
| 10 | Reports | 6 | 🎯 1 MVP |
| 11 | Analytics | 5 | Premium/V2 |
| 12 | Knowledge | 6 | 🎯 2 MVP |
| 13 | Experts | 6 | V3 |
| 14 | Documents | 5 | 🎯 2 MVP |
| 15 | Notifications | 3 | 🎯 1 MVP |
| 16 | Team | 2 | Business/V3 |
| 17 | Subscription | 4 | 🎯 2 MVP |
| 18 | Profile | 6 | 🎯 1 MVP |
| 19 | Admin Panel (desktop) | 10 | Interne/V2 |
| 20 | Future Features | 15 | Backlog |
| | **TOTAL** | **120** | **~38 🎯 MVP** |

## Comment utiliser cette bibliothèque

1. **Designe d'abord les 🎯** (~38 écrans) — c'est ton MVP réel, à coder avec Claude Code.
2. **Les autres** : designe-les par module quand le module entre en développement —
   pas avant, sinon les maquettes seront périmées quand tu les coderas.
3. **Admin Panel** : génère-les en 1440px desktop (précisé dans chaque prompt).
4. Ordre de génération conseillé pour caler le style : 16 (Dashboard Home) → 49
   (Calendrier fiscal) → 21 (Chat IA) → puis module par module.
