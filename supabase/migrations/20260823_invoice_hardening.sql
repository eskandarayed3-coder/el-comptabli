-- Invoice workflow hardening: shared atomic throttling and retry-safe confirmation.
-- This migration is intentionally server-only: browser roles keep no table or RPC access.

alter table public.invoices add column if not exists discount numeric(18, 3) not null default 0;
alter table public.invoices add column if not exists stamp_duty numeric(18, 3) not null default 0;
alter table public.invoices add column if not exists withholding_tax numeric(18, 3) not null default 0;
alter table public.invoices add column if not exists tax_exempt boolean not null default false;
alter table public.invoices add column if not exists document_type text not null default 'facture';
alter table public.invoices add column if not exists status text not null default 'confirmed';
alter table public.invoices drop constraint if exists invoices_amount_ttc_check;
alter table public.invoices drop constraint if exists invoices_document_type_check;
alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices add constraint invoices_amount_ttc_check check (amount_ttc >= 0 or document_type = 'avoir');
alter table public.invoices add constraint invoices_document_type_check check (document_type in ('facture', 'avoir'));
alter table public.invoices add constraint invoices_status_check check (status in ('uploaded', 'processing', 'review_required', 'confirmed', 'failed'));

create table if not exists public.rate_limit_windows (
  scope text not null,
  key_hash text not null,
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  expires_at timestamptz not null,
  primary key (scope, key_hash, window_start)
);
alter table public.rate_limit_windows enable row level security;
revoke all on table public.rate_limit_windows from public, anon, authenticated;

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
set search_path = ''
as $$
declare
  v_invoice public.invoices%rowtype;
  v_state jsonb;
begin
  if p_user_id is null or length(coalesce(p_fingerprint, '')) < 5 then
    raise exception 'invalid invoice identity' using errcode = '22023';
  end if;

  select * into v_invoice from public.invoices
   where user_id = p_user_id
     and (document_id = p_invoice->>'id' or transaction_id = p_transaction->>'id')
   limit 1;
  if found then
    select data into v_state from public.app_state where user_id = p_user_id;
    return jsonb_build_object('state', v_state, 'invoice', to_jsonb(v_invoice), 'idempotent', true);
  end if;

  insert into public.invoices (
    user_id, document_id, transaction_id, fingerprint, kind, supplier,
    supplier_tax_id, invoice_number, invoice_date, amount_ht, vat_amount,
    amount_ttc, discount, stamp_duty, withholding_tax, tax_exempt,
    document_type, status, vat_rate, vat_rates, category, storage_path, mime_type,
    raw_ocr, validated_fields, confidence, validated_at
  ) values (
    p_user_id, p_invoice->>'id', p_transaction->>'id', p_fingerprint,
    p_invoice->>'kind', p_invoice->>'vendor', coalesce(p_invoice->>'supplierTaxId', ''),
    p_invoice->>'invoiceNumber', (p_invoice->>'date')::date,
    nullif(p_invoice->>'amountHT', '')::numeric, nullif(p_invoice->>'tva', '')::numeric,
    (p_invoice->>'amountTTC')::numeric, coalesce(nullif(p_invoice->>'discount', '')::numeric, 0),
    coalesce(nullif(p_invoice->>'stampDuty', '')::numeric, 0),
    coalesce(nullif(p_invoice->>'withholdingTax', '')::numeric, 0),
    coalesce((p_invoice->>'taxExempt')::boolean, false), coalesce(p_invoice->>'documentType', 'facture'),
    'confirmed', nullif(p_invoice->>'tvaRate', '')::numeric,
    coalesce(p_invoice->'vatRates', '[]'::jsonb), coalesce(p_invoice->>'category', 'autres'),
    p_invoice->>'storagePath', p_document->>'mimeType', p_invoice->'rawOcr',
    p_invoice - 'rawOcr', coalesce(p_invoice->'confidence', '{}'::jsonb),
    (p_invoice->>'validatedAt')::timestamptz
  ) returning * into v_invoice;

  update public.app_state
     set data = jsonb_set(
       jsonb_set(
         jsonb_set(data, '{transactions}', jsonb_build_array(p_transaction) || coalesce(data->'transactions', '[]'::jsonb), true),
         '{documents}', jsonb_build_array(p_document) || coalesce(data->'documents', '[]'::jsonb), true
       ),
       '{activities}', jsonb_build_array(p_activity) || coalesce(data->'activities', '[]'::jsonb), true
     ), updated_at = now()
   where user_id = p_user_id
   returning data into v_state;
  if v_state is null then raise exception 'account state is not initialized' using errcode = '55000'; end if;
  return jsonb_build_object('state', v_state, 'invoice', to_jsonb(v_invoice), 'idempotent', false);
end;
$$;

revoke all on function public.confirm_scanned_invoice(uuid, text, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.confirm_scanned_invoice(uuid, text, jsonb, jsonb, jsonb, jsonb) to service_role;

create or replace function public.consume_rate_limit(p_scope text, p_key_hash text, p_window_seconds integer, p_max_hits integer)
returns table(allowed boolean, retry_after integer, remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare v_start timestamptz; v_hits integer;
begin
  if length(coalesce(p_scope, '')) > 80 or p_key_hash !~ '^[a-f0-9]{64}$'
     or p_window_seconds < 1 or p_window_seconds > 86400 or p_max_hits < 1 or p_max_hits > 10000 then
    raise exception 'invalid rate limit input' using errcode = '22023';
  end if;
  v_start := to_timestamp(floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limit_windows(scope, key_hash, window_start, hits, expires_at)
  values (p_scope, p_key_hash, v_start, 1, v_start + make_interval(secs => p_window_seconds * 2))
  on conflict (scope, key_hash, window_start) do update set hits = public.rate_limit_windows.hits + 1
  returning hits into v_hits;
  delete from public.rate_limit_windows where expires_at < clock_timestamp();
  return query select v_hits <= p_max_hits,
    greatest(1, ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - clock_timestamp())))::integer),
    greatest(0, p_max_hits - v_hits);
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
