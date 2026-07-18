# DESIGN.md — El Comptabli

## Product

El Comptabli is a mobile-first AI tax & accounting assistant for Tunisian entrepreneurs,
freelancers and small shop owners. It explains taxes in simple language (Tunisian darija
and French), tracks income/expenses, scans invoices, estimates taxes, and shows fiscal
deadlines. The tone is warm, trustworthy and reassuring — finance without fear.

## Look & Feel (one line)

Soft modern fintech: deep teal identity + pastel status-tinted cards, large rounded
corners, generous white space, floating pill buttons — inspired by pastel productivity
app UI kits.

## Brand personality

- Trustworthy and calm (it handles money and taxes)
- Friendly and human, never corporate or cold
- Simple and pedagogical: one idea per screen, no jargon
- Modern Tunisian: bilingual French / Arabic (darija), RTL-ready

## Colors

### Primary
- `#0F766E` — Deep Teal (primary): main buttons, active states, key accents
- `#0F5C56` — Darker Teal: headers, floating pill buttons/FAB, emphasis
- `#14B8A6` — Bright Teal (accent): highlights, links, focus rings, progress

### Status tints (pastel card backgrounds — core of the visual language)
Cards are tinted by status, not plain white:
- `#E6F5F3` — Soft teal tint: "on track / paid / done"
- `#FEF3E2` — Soft amber tint: "upcoming / attention"
- `#FDE8E6` — Soft coral tint: "urgent / overdue"
- `#EEF2FF` — Soft indigo tint: neutral info / AI cards

### Status pill colors (small pills inside cards)
- Success pill: `#16A34A` on `#DCFCE7`
- Warning pill: `#D97706` on `#FEF3C7`
- Danger pill: `#DC2626` on `#FEE2E2`
- Premium pill: `#7C3AED` on `#EDE9FE`

### Neutrals
- `#FFFFFF` — main background
- `#F5F7F7` — secondary background, input fills
- `#1A1A1A` — primary text
- `#6B7280` — secondary text, labels
- `#E5E7EB` — hairline borders (use sparingly; prefer tint + shadow over borders)

## Typography

- Font: a clean geometric sans-serif (Inter or similar). Arabic text: Noto Sans Arabic
  or Cairo, same visual weight.
- H1 32px Bold — screen titles
- H2 24px Bold — section titles
- H3 20px SemiBold — card titles
- Body 16px Regular — main text, AI answers (line-height 1.5)
- Small 14px Medium — labels, pills, badges
- Tiny 12px Regular — legal disclaimer, captions
- Numbers in stat cards: 28–32px Bold, tabular figures

## Shape & Depth

- Corner radius: 24px on cards (signature look), 16px on inner blocks, 12px on inputs,
  9999px (full pill) on buttons, chips, status pills, and the bottom nav bar
- Shadows: soft and subtle — `0 4px 16px rgba(15, 92, 86, 0.08)` on cards,
  `0 8px 24px rgba(0,0,0,0.12)` on floating elements
- No hard borders; separation comes from background tints and shadows
- Spacing: 8pt grid (4, 8, 12, 16, 24, 32). Screen padding 16–20px. Card padding 20px.

## Signature components

1. **Featured gradient card** — hero card at top of Home: teal gradient
   (#0F766E → #14B8A6), white text, a progress ring, one key status line.
2. **Compact stat cards** — row of 2–4 small cards: big number on top, tiny label
   below, pastel-tinted background per status.
3. **Status-tinted list cards** — list items (deadlines, tasks, transactions) with a
   pastel background matching urgency, a small status pill inside, title + one-line
   plain-language explanation.
4. **Day-strip calendar** — horizontal scrollable days (Mo–Su), current day in a dark
   teal pill; used on the deadlines screen.
5. **Filter pills** — horizontal row of pill chips; active = dark teal fill, white text.
6. **Floating pill button (FAB)** — dark teal, full-pill shape, white icon + label
   (e.g. "+ Ajouter", "Discuter avec l'IA"), floats above content near bottom.
7. **Floating bottom nav** — rounded pill bar, 5 icons (Accueil, Échéances, Scanner,
   Suivi, Profil), active icon dark teal with a small dot indicator.
8. **Chat bubbles** — assistant: white/indigo-tint, left-aligned; user: deep teal,
   white text, right-aligned; both radius 20px with one "tail" corner at 6px.
9. **Suggestion chips** — pill outline chips with sample questions, tap to send.
10. **Disclaimer banner** — tiny text on #F5F7F7, always visible: pedagogical tool,
    not an official tax filing service, consult a certified accountant for complex cases.

## Iconography

Lucide-style line icons, 2px stroke, rounded caps. Color inherits context (dark teal
active, gray #6B7280 inactive). Never mix icon styles.

## Motion

Fast and discreet: 150–250ms ease-out. Cards fade/slide in on load (staggered 50ms).
Streaming text for AI answers. A subtle scale (0.97) on button press. Success = small
check animation + toast.

## Voice & Language

- Default language: Tunisian darija (Arabic script), full RTL layout; French toggle.
- Sentences short and concrete, one idea each. Always give a small numeric example
  when explaining a tax concept.
- Never scary: urgent items use calm wording ("À régler avant le 28") — the coral tint
  carries the urgency, not the words.

## Accessibility

- Text contrast ≥ 4.5:1 everywhere (dark text on pastel tints passes; white on deep teal passes)
- Touch targets ≥ 44×44px
- Labels above inputs, never placeholder-only
- RTL mirroring for Arabic: layout, icons with direction, day-strip order

## Screens (for reference)

Home (greeting + hero card + stat cards + question chips), Chat IA (bubbles + chips +
input bar), Échéances (day-strip + stat cards + tinted deadline list), Estimateur
(form + step-by-step result cards + warning banner), Suivi (KPI cards + chart +
transaction list), Scanner (upload + analyzing + pre-filled form, Premium pill),
Profil (settings rows). All 390px mobile-first.

## Don'ts

- No plain gray corporate dashboards; tints and warmth are the identity
- No sharp corners, no heavy borders, no pure black (#000)
- No dense tables on mobile; use cards
- No alarming red walls; coral tint is enough for urgency
- Never hide the legal disclaimer on tax-advice screens
