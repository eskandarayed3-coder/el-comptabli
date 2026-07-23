-- El Comptabli — Supabase schema. Run this once in the Supabase SQL editor
-- (Project → SQL Editor → New query → paste → Run). Safe to re-run; every
-- statement is idempotent.

-- Single-use activation codes. Redemption is atomic (single UPDATE ... WHERE
-- used = false), so two customers racing to redeem the same code can never
-- both succeed — the thing the file-based version can't fully guarantee.
create table if not exists activation_codes (
  code       text primary key,
  plan       text not null check (plan in ('jour', 'semaine', 'mois')),
  used       boolean not null default false,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_activation_codes_plan_used
  on activation_codes (plan, used);

-- Row Level Security: the server talks to Supabase with the service_role
-- key (bypasses RLS entirely), so this just makes sure the anon/public key
-- — if it were ever exposed to the browser by mistake — can't read or
-- redeem codes directly.
alter table activation_codes enable row level security;

-- (No policies defined = no access at all for anon/authenticated roles.
-- Only the service_role key, used server-side only, can touch this table.)
