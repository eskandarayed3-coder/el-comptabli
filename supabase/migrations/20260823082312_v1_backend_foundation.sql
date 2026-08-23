-- ElComptabli V1 backend foundation.
-- Additive migration: preserves the legacy app_state and invoice identifiers
-- while introducing normalized multi-tenant accounting tables.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  legal_name text,
  tax_id text,
  country text not null default 'TN' check (country ~ '^[A-Z]{2}$'),
  currency text not null default 'TND' check (currency ~ '^[A-Z]{3}$'),
  fiscal_year_start date not null default make_date(extract(year from current_date)::integer, 1, 1),
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists organizations_tax_id_unique
  on public.organizations (upper(tax_id)) where tax_id is not null and btrim(tax_id) <> '';

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'accountant', 'employee', 'viewer')),
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'removed')),
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index if not exists organization_members_user_active_idx
  on public.organization_members (user_id, organization_id) where status = 'active';

alter table public.profiles add column if not exists first_name text not null default '';
alter table public.profiles add column if not exists last_name text not null default '';
alter table public.profiles add column if not exists language text not null default 'fr' check (language in ('fr', 'ar', 'en'));
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists timezone text not null default 'Africa/Tunis';

-- Existing accounts receive an initial organization, but the schema permits
-- any number of memberships and organizations per user.
do $$
declare
  r record;
  v_org uuid;
  v_name text;
begin
  for r in
    select p.id, p.name, p.email
    from public.profiles p
    where not exists (
      select 1 from public.organization_members m where m.user_id = p.id and m.status = 'active'
    )
  loop
    v_org := gen_random_uuid();
    v_name := coalesce(nullif(btrim(r.name), ''), nullif(split_part(r.email, '@', 1), ''), 'Mon organisation');
    insert into public.organizations(id, name, legal_name)
    values (v_org, left(v_name, 160), left(v_name, 160));
    insert into public.organization_members(organization_id, user_id, role, status, joined_at)
    values (v_org, r.id, 'owner', 'active', now());
  end loop;
end;
$$;

create or replace function private.has_org_role(p_organization_id uuid, p_roles text[])
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role = any(p_roles)
  );
$$;
revoke all on function private.has_org_role(uuid, text[]) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.has_org_role(uuid, text[]) to authenticated;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  uploader_id uuid not null references auth.users(id) on delete restrict,
  source_id text,
  storage_path text not null check (storage_path !~ '(^|/)\.\.(/|$)'),
  original_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  file_size bigint not null check (file_size > 0 and file_size <= 8388608),
  file_hash text check (file_hash is null or file_hash ~ '^[a-f0-9]{64}$'),
  document_type text not null default 'unknown' check (document_type in ('invoice','credit_note','receipt','quote','tax','bank_statement','other','unknown')),
  processing_status text not null default 'uploaded' check (processing_status in ('uploaded','processing','review_required','confirmed','failed','archived')),
  ocr_status text not null default 'pending' check (ocr_status in ('pending','processing','succeeded','failed','not_required')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, storage_path),
  unique (organization_id, source_id)
);

create table if not exists public.ocr_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  document_id uuid not null references public.documents(id) on delete restrict,
  attempt_no integer not null default 1 check (attempt_no > 0 and attempt_no <= 100),
  provider text not null,
  provider_model text,
  extracted_data jsonb not null default '{}'::jsonb,
  confidence jsonb not null default '{}'::jsonb,
  safe_raw_response jsonb,
  page_count integer not null default 1 check (page_count between 1 and 1000),
  processing_time_ms integer check (processing_time_ms is null or processing_time_ms >= 0),
  status text not null check (status in ('processing','succeeded','failed')),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (document_id, attempt_no)
);

create table if not exists public.third_parties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  type text not null check (type in ('supplier','customer','both')),
  name text not null check (char_length(name) between 1 and 200),
  normalized_name text not null,
  tax_id text,
  email text,
  phone text,
  address text,
  default_account_id uuid,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists third_parties_tax_id_unique
  on public.third_parties (organization_id, upper(tax_id)) where tax_id is not null and btrim(tax_id) <> '';
create unique index if not exists third_parties_name_without_tax_unique
  on public.third_parties (organization_id, type, normalized_name) where tax_id is null or btrim(tax_id) = '';

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  account_number text not null check (account_number ~ '^[0-9A-Za-z.-]{1,30}$'),
  label text not null check (char_length(label) between 1 and 200),
  normalized_label text not null,
  class integer not null check (class between 1 and 9),
  category text not null,
  parent_id uuid references public.accounts(id) on delete restrict,
  is_system boolean not null default false,
  is_active boolean not null default true,
  reporting_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, account_number),
  unique (id, organization_id)
);
alter table public.third_parties drop constraint if exists third_parties_default_account_id_fkey;
alter table public.third_parties add constraint third_parties_default_account_id_fkey
  foreign key (default_account_id) references public.accounts(id) on delete set null;

create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  code text not null check (code ~ '^[A-Z0-9]{1,12}$'),
  name text not null check (char_length(name) between 1 and 120),
  type text not null check (type in ('purchases','sales','bank','cash','miscellaneous')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code),
  unique (id, organization_id)
);

create table if not exists public.fiscal_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open','soft_closed','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date <= end_date),
  unique (organization_id, start_date, end_date)
);

alter table public.invoices add column if not exists organization_id uuid references public.organizations(id) on delete restrict;
alter table public.invoices add column if not exists document_record_id uuid references public.documents(id) on delete restrict;
alter table public.invoices add column if not exists third_party_id uuid references public.third_parties(id) on delete restrict;
alter table public.invoices add column if not exists due_date date;
alter table public.invoices add column if not exists currency text not null default 'TND' check (currency ~ '^[A-Z]{3}$');
alter table public.invoices add column if not exists validated_by uuid references auth.users(id) on delete restrict;
alter table public.invoices add column if not exists idempotency_key text;
update public.invoices i set organization_id = (
  select m.organization_id from public.organization_members m
  where m.user_id = i.user_id and m.status = 'active'
  order by case m.role when 'owner' then 0 else 1 end, m.created_at limit 1
) where i.organization_id is null;
alter table public.invoices alter column organization_id set not null;
alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices add constraint invoices_status_check
  check (status in ('uploaded','processing','review_required','draft','confirmed','paid','cancelled','failed','archived'));
alter table public.invoices drop constraint if exists invoices_amount_ttc_check;
alter table public.invoices add constraint invoices_amount_ttc_check check (amount_ttc >= 0 or document_type = 'avoir');
alter table public.invoices add constraint invoices_due_date_check check (due_date is null or due_date >= invoice_date);
create unique index if not exists invoices_org_fingerprint_unique on public.invoices (organization_id, fingerprint);
create unique index if not exists invoices_org_idempotency_unique on public.invoices (organization_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists invoices_org_date_idx on public.invoices (organization_id, invoice_date desc, id desc);
create index if not exists invoices_org_third_party_idx on public.invoices (organization_id, third_party_id, invoice_date desc);

create table if not exists public.invoice_tax_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  tax_rate numeric(8,3) check (tax_rate is null or tax_rate between 0 and 100),
  taxable_base numeric(18,3) not null default 0,
  tax_amount numeric(18,3) not null default 0,
  tax_type text not null check (tax_type in ('vat','exempt','stamp','withholding','other')),
  created_at timestamptz not null default now(),
  check (taxable_base >= 0),
  unique (invoice_id, tax_type, tax_rate)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  journal_id uuid not null references public.journals(id) on delete restrict,
  entry_number text not null,
  entry_date date not null,
  reference text,
  description text not null,
  source_type text,
  source_id uuid,
  status text not null default 'draft' check (status in ('draft','review','posted','reversed')),
  created_by uuid not null references auth.users(id) on delete restrict,
  reviewed_by uuid references auth.users(id) on delete restrict,
  posted_by uuid references auth.users(id) on delete restrict,
  posted_at timestamptz,
  reversed_entry_id uuid references public.journal_entries(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, journal_id, entry_number),
  unique (id, organization_id),
  check ((status in ('posted','reversed')) = (posted_at is not null))
);
create unique index if not exists journal_entries_source_unique
  on public.journal_entries (organization_id, source_type, source_id)
  where source_type is not null and source_id is not null and status <> 'reversed';

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  entry_id uuid not null references public.journal_entries(id) on delete restrict,
  account_id uuid not null references public.accounts(id) on delete restrict,
  third_party_id uuid references public.third_parties(id) on delete restrict,
  description text,
  debit numeric(18,3) not null default 0 check (debit >= 0),
  credit numeric(18,3) not null default 0 check (credit >= 0),
  tax_line_id uuid references public.invoice_tax_lines(id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0))
);

create table if not exists public.accounting_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  third_party_id uuid references public.third_parties(id) on delete restrict,
  invoice_category text,
  source_condition jsonb not null default '{}'::jsonb,
  target_account_id uuid not null references public.accounts(id) on delete restrict,
  vat_account_id uuid references public.accounts(id) on delete restrict,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  source text not null default 'human' check (source in ('human','import','ai_suggestion')),
  created_by uuid not null references auth.users(id) on delete restrict,
  last_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source <> 'ai_suggestion' or last_confirmed_at is null)
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  bank_name text not null,
  account_label text not null,
  account_number_encrypted text,
  account_number_last4 text check (account_number_last4 is null or account_number_last4 ~ '^[A-Za-z0-9]{2,8}$'),
  currency text not null default 'TND' check (currency ~ '^[A-Z]{3}$'),
  accounting_account_id uuid references public.accounts(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  third_party_id uuid references public.third_parties(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete restrict,
  amount numeric(18,3) not null check (amount > 0),
  currency text not null default 'TND' check (currency ~ '^[A-Z]{3}$'),
  payment_date date not null,
  payment_method text not null check (payment_method in ('cash','bank_transfer','card','cheque','direct_debit','other')),
  bank_account_id uuid references public.bank_accounts(id) on delete restrict,
  reference text,
  status text not null default 'draft' check (status in ('draft','posted','reversed','cancelled')),
  journal_entry_id uuid references public.journal_entries(id) on delete restrict,
  idempotency_key text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists payments_org_idempotency_unique on public.payments (organization_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  allocated_amount numeric(18,3) not null check (allocated_amount > 0),
  created_at timestamptz not null default now(),
  unique (payment_id, invoice_id)
);

create table if not exists public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  bank_account_id uuid not null references public.bank_accounts(id) on delete restrict,
  transaction_date date not null,
  value_date date,
  amount numeric(18,3) not null check (amount <> 0),
  reference text,
  description text,
  imported_hash text not null check (imported_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'unmatched' check (status in ('unmatched','suggested','reconciled','ignored')),
  created_at timestamptz not null default now(),
  unique (organization_id, bank_account_id, imported_hash)
);

create table if not exists public.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  bank_transaction_id uuid not null references public.bank_transactions(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete restrict,
  journal_entry_id uuid references public.journal_entries(id) on delete restrict,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  matching_method text not null check (matching_method in ('reference','amount_date','manual','ai_suggestion')),
  status text not null default 'suggested' check (status in ('suggested','confirmed','rejected')),
  confirmed_by uuid references auth.users(id) on delete restrict,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  check (payment_id is not null or journal_entry_id is not null),
  check ((status = 'confirmed') = (confirmed_by is not null and confirmed_at is not null))
);
create unique index if not exists reconciliation_confirmed_transaction_unique
  on public.reconciliation_matches(bank_transaction_id) where status = 'confirmed';

create table if not exists public.vat_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft','reviewed','closed')),
  vat_collected numeric(18,3) not null default 0,
  vat_deductible numeric(18,3) not null default 0,
  adjustments numeric(18,3) not null default 0,
  net_vat numeric(18,3) generated always as (vat_collected - vat_deductible + adjustments) stored,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_start <= period_end),
  unique (organization_id, period_start, period_end)
);

create table if not exists public.vat_report_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  vat_period_id uuid not null references public.vat_periods(id) on delete restrict,
  invoice_tax_line_id uuid references public.invoice_tax_lines(id) on delete restrict,
  line_type text not null check (line_type in ('collected','deductible','adjustment')),
  taxable_base numeric(18,3) not null default 0,
  tax_amount numeric(18,3) not null default 0,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  request_id text,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  event_type text not null,
  payload_reference jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'pending' check (delivery_status in ('pending','processing','delivered','failed','dead_letter')),
  idempotency_key text not null,
  attempts integer not null default 0 check (attempts between 0 and 100),
  available_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete restrict,
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  payload_hash text check (payload_hash is null or payload_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'received' check (status in ('received','processing','processed','failed','ignored')),
  attempts integer not null default 0 check (attempts between 0 and 100),
  processed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_event_id)
);

-- Query-pattern indexes.
create index if not exists documents_org_created_idx on public.documents (organization_id, created_at desc, id desc);
create index if not exists documents_org_status_idx on public.documents (organization_id, processing_status, created_at desc);
create index if not exists ocr_results_document_created_idx on public.ocr_results (document_id, created_at desc);
create index if not exists third_parties_org_name_idx on public.third_parties (organization_id, normalized_name);
create index if not exists accounts_org_active_number_idx on public.accounts (organization_id, account_number) where is_active;
create index if not exists journal_entries_org_date_idx on public.journal_entries (organization_id, entry_date desc, id desc);
create index if not exists journal_entries_org_status_idx on public.journal_entries (organization_id, status, entry_date desc);
create index if not exists journal_lines_entry_idx on public.journal_lines (entry_id, id);
create index if not exists journal_lines_org_account_idx on public.journal_lines (organization_id, account_id, created_at);
create index if not exists payments_org_date_idx on public.payments (organization_id, payment_date desc, id desc);
create index if not exists bank_transactions_org_date_idx on public.bank_transactions (organization_id, transaction_date desc, id desc);
create index if not exists bank_transactions_unmatched_idx on public.bank_transactions (organization_id, bank_account_id, transaction_date desc) where status = 'unmatched';
create index if not exists invoice_tax_lines_org_invoice_idx on public.invoice_tax_lines (organization_id, invoice_id);
create index if not exists vat_periods_org_period_idx on public.vat_periods (organization_id, period_start desc);
create index if not exists audit_events_org_created_idx on public.audit_events (organization_id, created_at desc, id desc);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index if not exists automation_events_pending_idx on public.automation_events (delivery_status, available_at) where delivery_status in ('pending','failed');

-- Keep timestamps consistent.
do $$
declare t text;
begin
  foreach t in array array[
    'organizations','organization_members','documents','third_parties','accounts','journals',
    'fiscal_periods','journal_entries','accounting_mappings','bank_accounts','payments',
    'vat_periods','automation_events','webhook_deliveries'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()', t, t);
  end loop;
end;
$$;

-- RLS is defense in depth. The browser remains unable to access these tables
-- directly because grants are revoked; server APIs additionally enforce roles.
do $$
declare t text;
begin
  foreach t in array array[
    'organizations','organization_members','documents','ocr_results','third_parties','accounts','journals',
    'fiscal_periods','invoices','invoice_tax_lines','journal_entries','journal_lines','accounting_mappings',
    'bank_accounts','payments','payment_allocations','bank_transactions','reconciliation_matches',
    'vat_periods','vat_report_lines','audit_events','notifications','automation_events','webhook_deliveries'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
  end loop;
end;
$$;

drop policy if exists organizations_member_select on public.organizations;
create policy organizations_member_select on public.organizations for select to authenticated
  using (private.has_org_role(id, array['owner','admin','accountant','employee','viewer']));
drop policy if exists organizations_admin_update on public.organizations;
create policy organizations_admin_update on public.organizations for update to authenticated
  using (private.has_org_role(id, array['owner','admin']))
  with check (private.has_org_role(id, array['owner','admin']));

drop policy if exists organization_members_member_select on public.organization_members;
create policy organization_members_member_select on public.organization_members for select to authenticated
  using (private.has_org_role(organization_id, array['owner','admin','accountant','employee','viewer']));
drop policy if exists organization_members_admin_write on public.organization_members;
create policy organization_members_admin_write on public.organization_members for all to authenticated
  using (private.has_org_role(organization_id, array['owner','admin']))
  with check (private.has_org_role(organization_id, array['owner','admin']));

do $$
declare t text;
begin
  foreach t in array array[
    'documents','ocr_results','third_parties','accounts','journals','fiscal_periods','invoices','invoice_tax_lines',
    'journal_entries','journal_lines','accounting_mappings','bank_accounts','payments','payment_allocations',
    'bank_transactions','reconciliation_matches','vat_periods','vat_report_lines','automation_events','webhook_deliveries'
  ] loop
    execute format('drop policy if exists %I_member_select on public.%I', t, t);
    execute format(
      'create policy %I_member_select on public.%I for select to authenticated using (private.has_org_role(organization_id, array[''owner'',''admin'',''accountant'',''employee'',''viewer'']))',
      t, t
    );
    execute format('drop policy if exists %I_accounting_write on public.%I', t, t);
    execute format(
      'create policy %I_accounting_write on public.%I for all to authenticated using (private.has_org_role(organization_id, array[''owner'',''admin'',''accountant''])) with check (private.has_org_role(organization_id, array[''owner'',''admin'',''accountant'']))',
      t, t
    );
  end loop;
end;
$$;

drop policy if exists documents_employee_insert on public.documents;
create policy documents_employee_insert on public.documents for insert to authenticated
  with check (uploader_id = (select auth.uid()) and private.has_org_role(organization_id, array['owner','admin','accountant','employee']));
drop policy if exists notifications_recipient_select on public.notifications;
create policy notifications_recipient_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) and private.has_org_role(organization_id, array['owner','admin','accountant','employee','viewer']));
drop policy if exists notifications_recipient_update on public.notifications;
create policy notifications_recipient_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists audit_events_member_select on public.audit_events;
create policy audit_events_member_select on public.audit_events for select to authenticated
  using (private.has_org_role(organization_id, array['owner','admin','accountant']));

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists app_state_self_select on public.app_state;
create policy app_state_self_select on public.app_state for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists app_state_self_update on public.app_state;
create policy app_state_self_update on public.app_state for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists subscriptions_self_select on public.subscriptions;
create policy subscriptions_self_select on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));

-- Explicit server-only access remains the primary Data API boundary.
grant all on table
  public.organizations, public.organization_members, public.documents, public.ocr_results,
  public.third_parties, public.accounts, public.journals, public.fiscal_periods,
  public.invoices, public.invoice_tax_lines, public.journal_entries, public.journal_lines,
  public.accounting_mappings, public.bank_accounts, public.payments, public.payment_allocations,
  public.bank_transactions, public.reconciliation_matches, public.vat_periods,
  public.vat_report_lines, public.audit_events, public.notifications,
  public.automation_events, public.webhook_deliveries
to service_role;
