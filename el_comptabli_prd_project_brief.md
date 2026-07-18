# Product Requirements Document: El Comptabli

## 1. Project Overview
**Product Name:** El Comptabli  
**Tagline:** Ton assistant fiscal & comptable IA 🇹🇳  
**Target Audience:** Tunisian entrepreneurs, freelancers, and small business owners (SUARL, SARL, Individual).  
**Platform:** Mobile-first (iOS/Android), with a Desktop Web Admin console.

El Comptabli is an AI-native fiscal and accounting assistant designed to simplify complex tax obligations for the Tunisian market. It leverages LLMs to provide pedagogical support in French and Tunisian Darija, automate document processing (OCR), and provide real-time financial insights.

---

## 2. Core Value Propositions
- **Finance Without Fear:** Uses a "Soft Modern Fintech" aesthetic to reduce the anxiety associated with taxes.
- **Pedagogical Support:** Explains Tunisian fiscal law (LF 2026 ready) in simple, accessible language.
- **Automation:** Reduces manual data entry through AI-powered invoice and receipt scanning.
- **Compliance:** Built around the Tunisian Chart of Accounts (SCE) and local tax regimes (Forfaitaire, Réel).

---

## 3. Key Feature Modules

### 3.1. Onboarding & Profiling
- **Multilingual Setup:** Choice between Tunisian Darija, French, and English.
- **Fiscal Persona:** Detailed profiling to determine the user's regime (Freelance, SUARL, SARL, etc.).
- **Permissions:** Integrated setup for notifications (reminders) and camera/storage access.

### 3.2. AI Assistant (Chat & Voice)
- **Verified IA:** Chat interface adjoined to a verified fiscal knowledge base.
- **Voice Interaction:** Hands-free voice chat with live waveform visualization.
- **Proactive Insights:** AI-driven recommendations for budget adjustments and tax optimizations.

### 3.3. Document Management (Scanner & OCR)
- **Intelligent Scanner:** Premium OCR to extract data (Merchant, TTC, TVA, Date) from receipts and invoices.
- **Validation Queue:** A workflow to review and confirm AI-extracted data before entry.
- **Document Library:** Categorized storage for tax documents, invoices, and declarations.

### 3.4. Accounting & Tax Tracking
- **Suivi (Tracking):** Real-time monitoring of monthly revenue, expenses, and projected profit.
- **Mes Impôts:** Dedicated dashboard for VAT (TVA) tracking, IRPP estimation, and CNSS.
- **Échéances (Deadlines):** A smart tax calendar with automated reminders and preparation checklists.
- **Comptabilité (V2):** Generation of Journal entries, Trial Balance, and General Ledger based on transactions.

### 3.5. Expert Network
- **Directory:** A verified marketplace of Tunisian expert-comptables.
- **Consultations:** Integrated booking, secure chat, and video call interface for professional advice.

### 3.6. Admin Console (Desktop)
- **User & Subscription Management:** Tiered access control (Gratuit, Premium, Business).
- **Knowledge Base Management:** RAG (Retrieval-Augmented Generation) management for fiscal laws and guides.
- **AI Logs & Review:** Tools for admins to review AI accuracy and source verification.

---

## 4. Visual Identity & UX Principles
- **Aesthetic:** "Serene Fiscal" — Deep teal primary (#0F766E), pastel status-tinted cards, and large (24px) rounded corners.
- **Hierarchy:** Use of soft shadows and background tints instead of hard borders.
- **Clarity:** One core idea per screen. Consistent use of status pills (Success, Warning, Danger).
- **Continuity:** Floating pill-shaped bottom navigation and consistent header structures.

---

## 5. Technology Stack (Conceptual)
- **Frontend:** React Native (Mobile), React (Desktop Admin), Tailwind CSS for styling.
- **AI/ML:** Anthropic Claude (Logic/Chat), specialized OCR engine for Tunisian documents.
- **Infrastructure:** Secure, encrypted storage for sensitive financial data; RAG architecture for fiscal knowledge.

---

## 6. Roadmap & Future Enhancements
- **Bank Synchronization:** Automated transaction import from major Tunisian banks (BIAT, BNA, etc.).
- **Audit Assistant:** A premium module to assess "audit-readiness" and generate control files.
- **Payroll (Paie):** Automated CNSS and IRPP calculations for employee management.
- **Digital Signature:** Legal-grade e-signature integration for tax documents.
