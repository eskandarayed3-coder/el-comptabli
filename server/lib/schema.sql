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

-- Security-definer RPCs: let the server redeem codes and read stats using
-- only the PUBLIC anon key — the service_role secret never needs to leave
-- the Supabase dashboard. Each function is narrow and single-purpose.
create or replace function public.redeem_activation_code(p_code text)
returns table(plan text, already_used boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
begin
  update activation_codes
     set used = true, used_at = now()
   where code = upper(trim(p_code))
     and used = false
  returning activation_codes.plan into v_plan;

  if v_plan is not null then
    return query select v_plan, false;
    return;
  end if;

  select activation_codes.plan into v_plan
    from activation_codes
   where code = upper(trim(p_code));

  if v_plan is not null then
    return query select v_plan, true;
  end if;

  return;
end;
$$;

revoke all on function public.redeem_activation_code(text) from public;
grant execute on function public.redeem_activation_code(text) to anon, authenticated;

create or replace function public.activation_code_stats()
returns table(plan text, total bigint, used bigint)
language sql
security definer
set search_path = public
as $$
  select plan, count(*) as total, count(*) filter (where used) as used
  from activation_codes
  group by plan;
$$;

revoke all on function public.activation_code_stats() from public;
grant execute on function public.activation_code_stats() to anon, authenticated;

-- Lets the owner fetch one still-unused code for a plan (to hand out via
-- WhatsApp) without exposing the table or marking anything used.
create or replace function public.peek_unused_code(p_plan text)
returns text
language sql
security definer
set search_path = public
as $$
  select code from activation_codes
  where plan = p_plan and used = false
  order by code
  limit 1;
$$;

revoke all on function public.peek_unused_code(text) from public;
grant execute on function public.peek_unused_code(text) to anon, authenticated;
