---
name: Serene Fiscal
colors:
  surface: '#f8fafa'
  surface-dim: '#d8dada'
  surface-bright: '#f8fafa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f4'
  surface-container: '#eceeee'
  surface-container-high: '#e6e8e8'
  surface-container-highest: '#e1e3e3'
  on-surface: '#191c1d'
  on-surface-variant: '#3e4947'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f1'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#0d5b55'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f746d'
  on-tertiary-container: '#b3f7ee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#abefe7'
  tertiary-fixed-dim: '#90d3cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f8fafa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e3'
  tint-success: '#E6F5F3'
  tint-warning: '#FEF3E2'
  tint-danger: '#FDE8E6'
  tint-info: '#EEF2FF'
  status-success: '#16A34A'
  status-warning: '#D97706'
  status-danger: '#DC2626'
  status-premium: '#7C3AED'
  text-primary: '#1A1A1A'
  text-secondary: '#6B7280'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  stat-display:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 20px
  element-gap: 16px
  stack-sm: 12px
  stack-xs: 4px
---

## Brand & Style

The design system is built on a "Soft Modern Fintech" philosophy, specifically tailored for the Tunisian entrepreneurial landscape. It moves away from the cold, intimidating nature of traditional finance apps toward a pedagogical, reassuring, and human-centric experience. The goal is to transform tax management from a source of anxiety into a manageable, guided process.

The aesthetic combines **Minimalism** with **Tactile** elements. It relies on generous whitespace and a "tint-over-border" approach where depth and categorization are achieved through soft pastel backgrounds rather than harsh lines. The interface is characterized by exceptionally large corner radii and floating pill-shaped elements, creating a friendly, "squishy" UI that feels approachable and modern.

**Key Brand Pillars:**
- **Warm & Trustworthy:** Uses deep teals and soft pastels to evoke stability without being corporate.
- **Pedagogical:** One idea per screen, avoiding jargon and using simple visual cues for urgency.
- **Mobile-First & Bilingual:** Optimized for 390px widths with native support for both French (LTR) and Tunisian Darija (RTL).

## Colors

The palette is the core of this design system's visual language. Instead of standard white cards, the UI uses **Status Tints** to communicate context subconsciously.

- **Brand Colors:** The primary Deep Teal (#0F766E) is used for high-importance interactions. The Darker Teal (#0F5C56) is reserved for floating elements and headers, while the Bright Teal (#14B8A6) serves as a vibrant accent for progress and focus.
- **Surface Tints:** Use these as background colors for cards to denote status:
    - **Success (Teal Tint):** For "on track" or "paid" items.
    - **Warning (Amber Tint):** For "upcoming" tasks requiring attention.
    - **Danger (Coral Tint):** For "urgent" or "overdue" items.
    - **Info (Indigo Tint):** For AI-generated responses and neutral insights.
- **Neutrals:** The main background is pure white (#FFFFFF), but secondary backgrounds and input fields use a soft gray-teal (#F5F7F7). Hairline borders (#E5E7EB) should be used only when essential; prefer using shadows and tints to define boundaries.

## Typography

This design system uses a clean, geometric typographic scale to ensure legibility in financial contexts. 

- **Primary Font:** **Inter** is the standard for all Latin-based text. It provides the necessary clarity for data-heavy screens.
- **Arabic Support:** For Tunisian Darija (Arabic script), use **Noto Sans Arabic** or **Cairo**, ensuring the visual weight matches the Inter counterparts.
- **Numerical Data:** For statistics and tax amounts, use `stat-display` with tabular figures to ensure numbers align perfectly in vertical lists or comparison cards.
- **Readability:** Maintain a line-height of 1.5 (24px) for body text, especially in AI chat bubbles, to facilitate easy reading of complex tax explanations.

## Layout & Spacing

The layout follows a strict 8pt grid system to maintain rhythm across mobile screens.

- **Margins:** Standard screen padding is set to 20px on mobile to allow the large corner radii of cards to feel balanced.
- **Card Padding:** All cards should utilize a consistent 20px internal padding.
- **Grid Model:** A flexible vertical stack is the primary layout model. Elements should span the full width of the safe area unless they are "Compact Stat Cards," which should be arranged in rows of 2.
- **Mobile-First Reflow:** While primary usage is mobile (390px), on larger tablets, content should be constrained to a max-width of 600px and centered to maintain the "hand-held assistant" feel.

## Elevation & Depth

Hierarchy in this design system is established through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Shadow Character:** Shadows are extremely soft and tinted to match the brand. Standard cards use a subtle teal-tinted shadow: `0 4px 16px rgba(15, 92, 86, 0.08)`.
- **Floating Elements:** Highly interactive elements like the Floating Action Button (FAB) or the Bottom Nav Bar use a more pronounced shadow for physical "lift": `0 8px 24px rgba(0,0,0,0.12)`.
- **Layering:**
  - **Level 0:** Main Background (#FFFFFF).
  - **Level 1:** Status-tinted cards (Resting state).
  - **Level 2:** Modals and Floating Action Buttons.
- **Borders:** Avoid high-contrast borders. Use the #E5E7EB hairline only when a card's pastel tint is too close to the background color or when defining input field boundaries.

## Shapes

The "signature look" of this design system is defined by its exaggerated softness. 

- **Primary Cards:** Use a **24px** radius. This is non-negotiable as it defines the brand's friendly character.
- **Inner Blocks:** Nested elements within cards use a **16px** radius.
- **Form Elements:** Inputs and text areas use a **12px** radius.
- **Interactive Pills:** Buttons, filter chips, status pills, and the bottom navigation bar must use **Full-Pill (9999px)** rounding.

## Components

- **Featured Gradient Card:** A hero component using a linear gradient (#0F766E to #14B8A6). It features white typography, a progress ring for fiscal deadlines, and high-impact messaging.
- **Status-Tinted List Cards:** These are the workhorse of the app. Background color must reflect the status (Success/Warning/Danger/Info). They include a small status pill at the top, a headline, and a plain-language explanation.
- **Floating Pill Button (FAB):** A Deep Teal (#0F5C56) pill containing a Lucide icon and a label. It stays fixed at the bottom right.
- **Chat Bubbles:**
    - **Assistant:** Indigo-tinted (#EEF2FF) background, left-aligned.
    - **User:** Deep Teal background, white text, right-aligned. 
    - **Radius Logic:** 20px radius on three corners, with the "tail" corner (bottom-left for AI, bottom-right for user) at 6px.
- **Floating Bottom Nav:** A detached, pill-shaped bar containing 5 icons. Use a 2px stroke line-style. The active state is indicated by a Deep Teal color and a small dot below the icon.
- **Suggestion Chips:** Outlined pill shapes below AI responses to prompt next steps.
- **Disclaimer Banner:** Always present on tax-related screens. Smallest typography level on #F5F7F7 background, ensuring the app is recognized as a pedagogical tool, not a certified accountant.