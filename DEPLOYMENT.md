# El Comptabli — Production launch checklist

## 1. Create and secure Supabase

1. Create a Supabase project in the EU region if possible.
2. In Authentication → URL Configuration, set **Site URL** to the production
   origin (for example `https://YOUR_DOMAIN`) and add the exact callback URL
   `https://YOUR_DOMAIN/auth/callback` to **Redirect URLs**. Local development
   may additionally allow `http://localhost:5173/auth/callback`.
3. Configure a production SMTP provider in Authentication → SMTP so
   passwordless email links are reliably delivered.
4. For a new empty database only, apply `server/lib/schema.sql` as the checked-in
   legacy baseline, then apply every file in `supabase/migrations/` in lexical
   order. Never apply the baseline to an existing project and never reset
   production. `npm test` replays this exact sequence in an isolated PGlite
   database.
5. For an existing environment, compare its migration ledger with
   `docs/database-migration-recovery.md`, then apply only unapplied migrations
   through the Supabase migration workflow. The final authoritative schema has
   no public `app_state`; the baseline alone is not a deployable current schema.
6. Verify that anonymous and authenticated Data API roles have no direct table
   grants, the `documents` bucket is private, and public workflow RPCs are
   executable only by `service_role`.

## 2. Configure Vercel

Create the `el-comptabli` Vercel project from the GitHub repository, then add
every required value from .env.example to the **Production** and **Preview**
environments. Values starting with `VITE_` must be present before the build
starts. Never expose SUPABASE_SERVICE_ROLE_KEY or RESEND_API_KEY to the
browser.

The included `vercel.json` sends `/api/*` to the Node.js Express function and
uses the Vite build output for the single-page application. Redeploy after
changing an environment variable so `VITE_` values enter the client bundle.

Set ADMIN_EMAILS to the verified login email(s) of the app owner, separated
by commas. An empty value safely disables the admin panel.

The serverless function refuses to start when the required Supabase values are
missing. This is intentional: users must never fall back to local-only,
email-only account recovery in production.

## 3. Create first activation codes

After the database and environment are live, log in with an email in
ADMIN_EMAILS. Create codes with:

    CODE_PLAN=mois CODE_COUNT=50 node server/lib/seed-supabase.js

or use the protected POST /api/activate/gen endpoint from an internal admin
tool. Codes are random, stored only in Supabase, and atomically consumed.

## 4. Configure email exports

To enable “email my accountant”, create a verified Resend sender and set:

    RESEND_API_KEY=...
    RESEND_FROM_EMAIL=El Comptabli <exports@your-domain.tn>

Without these values, the app truthfully shows that email delivery is not
configured; it never falsely claims an email was sent.

## 5. Validate before launch

Use Node.js 22, matching `package.json` and Vercel:

    node --version

    npm ci
    npm test
    npm run build

Manually verify:

- New user: email link → onboarding → one-day trial → reload → same data.
- Second device: email link → original transactions and subscription restore.
- Code: redeem once; attempt again; verify the second attempt fails.
- Wrong account: cannot access another account, admin routes, state, AI, or
  activation endpoint.
- Accounting: confirm a synthetic invoice, choose a human-validated mapping,
  post it, and verify the same totals in Journal, Grand Livre, Balance, TVA and
  Dashboard. Repeating the posting request must return the same journal entry.
- Export: Excel opens; PDF print dialog opens; Resend email arrives when
  configured.

## 6. Content and legal review

Do not market the tax calculator or AI as official advice until a Tunisian
expert validates every rate, deadline and plan-account number. Track the source
URL, law/year, reviewer and next review date for every factual rule. Keep the
current disclaimer visible and update the Privacy Policy with the selected
hosting, email and AI providers.
