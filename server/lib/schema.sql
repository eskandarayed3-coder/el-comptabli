-- El Comptabli production schema. Run in the Supabase SQL editor before
-- deployment. The browser never receives a database key for business data:
-- every read/write goes through the authenticated Express server.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  regime text not null default '',
  user_type text not null default '',
  city text not null default '',
  activity text not null default '',
  trial_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_key on public.profiles (lower(email));

create table if not exists public.app_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  schema_version integer not null default 1,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Immutable audit record for invoices confirmed by a human after OCR. The
-- dashboard remains backward-compatible through app_state, updated atomically
-- by confirm_scanned_invoice below.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_id text not null,
  transaction_id text not null,
  fingerprint text not null,
  kind text not null check (kind in ('expense', 'income')),
  supplier text not null,
  supplier_tax_id text not null default '',
  invoice_number text not null,
  invoice_date date not null,
  amount_ht numeric(18, 3),
  vat_amount numeric(18, 3),
  amount_ttc numeric(18, 3) not null check (amount_ttc >= 0),
  vat_rate numeric(8, 3),
  vat_rates jsonb not null default '[]'::jsonb,
  category text not null default 'autres',
  storage_path text not null,
  mime_type text not null,
  raw_ocr jsonb,
  validated_fields jsonb not null,
  confidence jsonb not null default '{}'::jsonb,
  validated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fingerprint),
  unique (user_id, document_id),
  unique (user_id, transaction_id)
);

create index if not exists idx_invoices_user_date on public.invoices (user_id, invoice_date desc);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  premium_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.activation_codes (
  code text primary key check (code ~ '^EC-[A-Z0-9]{16,64}$'),
  plan text not null check (plan in ('jour', 'semaine', 'mois')),
  used boolean not null default false,
  used_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.activation_codes add column if not exists used_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_activation_codes_plan_used on public.activation_codes (plan, used);

create table if not exists public.activation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text,
  plan text not null,
  price numeric(10, 3) not null,
  kind text not null check (kind in ('code', 'trial')),
  created_at timestamptz not null default now()
);

create index if not exists idx_activation_events_user_created on public.activation_events (user_id, created_at desc);

-- Defense in depth: no data table is callable from the browser Data API.
alter table public.profiles enable row level security;
alter table public.app_state enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activation_codes enable row level security;
alter table public.activation_events enable row level security;

revoke all on table public.profiles, public.app_state, public.invoices, public.subscriptions, public.activation_codes, public.activation_events from anon, authenticated;

-- Remove the public activation-code RPCs used by the pre-auth prototype.
-- Keeping an overloaded function would leave an unintended callable endpoint.
drop function if exists public.redeem_activation_code(text);
drop function if exists public.activation_code_stats();
drop function if exists public.peek_unused_code(text);

-- Remove empty, unreferenced pre-production tables and the RPCs that exposed
-- them. Keeping SECURITY DEFINER functions in the public schema would leave
-- unnecessary anonymous API surface.
drop function if exists public.get_app_user_by_email(text);
drop function if exists public.list_activation_log();
drop function if exists public.list_app_users();
drop function if exists public.log_activation(text, text, numeric, text);
drop function if exists public.upsert_app_user(text, text, text, text, text, text, text, timestamptz);
drop table if exists public.activation_log;
drop table if exists public.app_users;

-- Atomically consumes a paid code and updates the purchaser's subscription.
-- Only service_role may call this function; it is never exposed to anon/authenticated clients.
create or replace function public.redeem_activation_code(p_code text, p_user_id uuid)
returns table(plan text, days integer, price numeric, premium_until timestamptz, already_used boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_days integer;
  v_price numeric;
  v_until timestamptz;
begin
  update activation_codes
     set used = true, used_at = now(), used_by = p_user_id
   where code = upper(trim(p_code)) and used = false
  returning activation_codes.plan into v_plan;

  if v_plan is null then
    if exists (select 1 from activation_codes where code = upper(trim(p_code))) then
      return query select null::text, null::integer, null::numeric, null::timestamptz, true;
    end if;
    return;
  end if;

  select case v_plan when 'jour' then 1 when 'semaine' then 7 when 'mois' then 30 end,
         case v_plan when 'jour' then 1 when 'semaine' then 5 when 'mois' then 20 end
    into v_days, v_price;
  select greatest(coalesce(s.premium_until, now()), now()) + make_interval(days => v_days)
    into v_until
    from subscriptions s where s.user_id = p_user_id;
  v_until := coalesce(v_until, now() + make_interval(days => v_days));

  insert into subscriptions (user_id, plan, premium_until, updated_at)
  values (p_user_id, 'premium', v_until, now())
  on conflict (user_id) do update set plan = excluded.plan, premium_until = excluded.premium_until, updated_at = now();
  insert into activation_events (user_id, code, plan, price, kind) values (p_user_id, upper(trim(p_code)), v_plan, v_price, 'code');
  return query select v_plan, v_days, v_price, v_until, false;
end;
$$;

create or replace function public.grant_trial_if_available(p_user_id uuid)
returns table(days integer, premium_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare v_until timestamptz;
begin
  update profiles set trial_used_at = now(), updated_at = now()
   where id = p_user_id and trial_used_at is null;
  if not found then return; end if;
  select greatest(coalesce(s.premium_until, now()), now()) + interval '1 day'
    into v_until from subscriptions s where s.user_id = p_user_id;
  v_until := coalesce(v_until, now() + interval '1 day');
  insert into subscriptions (user_id, plan, premium_until, updated_at)
  values (p_user_id, 'premium', v_until, now())
  on conflict (user_id) do update set plan = excluded.plan, premium_until = excluded.premium_until, updated_at = now();
  insert into activation_events (user_id, code, plan, price, kind) values (p_user_id, null, 'jour', 0, 'trial');
  return query select 1, v_until;
end;
$$;

revoke all on function public.redeem_activation_code(text, uuid), public.grant_trial_if_available(uuid) from public, anon, authenticated;
grant execute on function public.redeem_activation_code(text, uuid), public.grant_trial_if_available(uuid) to service_role;

-- The invoice row and its three dashboard projections commit together. Only
-- the trusted Express server (service_role) can call this RPC.
create or replace function public.confirm_scanned_invoice(
  p_user_id uuid,
  p_fingerprint text,
  p_invoice jsonb,
  p_transaction jsonb,
  p_document jsonb,
  p_activity jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice public.invoices%rowtype;
  v_state jsonb;
begin
  if p_user_id is null or length(coalesce(p_fingerprint, '')) < 5 then
    raise exception 'invalid invoice identity' using errcode = '22023';
  end if;

  insert into public.invoices (
    user_id, document_id, transaction_id, fingerprint, kind, supplier,
    supplier_tax_id, invoice_number, invoice_date, amount_ht, vat_amount,
    amount_ttc, vat_rate, vat_rates, category, storage_path, mime_type,
    raw_ocr, validated_fields, confidence, validated_at
  ) values (
    p_user_id,
    p_invoice->>'id',
    p_transaction->>'id',
    p_fingerprint,
    p_invoice->>'kind',
    p_invoice->>'vendor',
    coalesce(p_invoice->>'supplierTaxId', ''),
    p_invoice->>'invoiceNumber',
    (p_invoice->>'date')::date,
    nullif(p_invoice->>'amountHT', '')::numeric,
    nullif(p_invoice->>'tva', '')::numeric,
    (p_invoice->>'amountTTC')::numeric,
    nullif(p_invoice->>'tvaRate', '')::numeric,
    coalesce(p_invoice->'vatRates', '[]'::jsonb),
    coalesce(p_invoice->>'category', 'autres'),
    p_invoice->>'storagePath',
    p_document->>'mimeType',
    p_invoice->'rawOcr',
    p_invoice - 'rawOcr',
    coalesce(p_invoice->'confidence', '{}'::jsonb),
    (p_invoice->>'validatedAt')::timestamptz
  ) returning * into v_invoice;

  update public.app_state
     set data = jsonb_set(
       jsonb_set(
         jsonb_set(data, '{transactions}', jsonb_build_array(p_transaction) || coalesce(data->'transactions', '[]'::jsonb), true),
         '{documents}', jsonb_build_array(p_document) || coalesce(data->'documents', '[]'::jsonb), true
       ),
       '{activities}', jsonb_build_array(p_activity) || coalesce(data->'activities', '[]'::jsonb), true
     ),
     updated_at = now()
   where user_id = p_user_id
   returning data into v_state;

  if v_state is null then
    raise exception 'account state is not initialized' using errcode = '55000';
  end if;

  return jsonb_build_object('state', v_state, 'invoice', to_jsonb(v_invoice));
end;
$$;

revoke all on function public.confirm_scanned_invoice(uuid, text, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_scanned_invoice(uuid, text, jsonb, jsonb, jsonb, jsonb) to service_role;

-- Covers the activation-code foreign key and avoids a full scan when a user is
-- removed or an administrator filters redeemed codes by account.
create index if not exists idx_activation_codes_used_by on public.activation_codes (used_by);
