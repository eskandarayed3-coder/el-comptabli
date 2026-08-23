-- Deterministic accounting invariants and transactional RPCs.

create or replace function private.normalized_label(p_value text)
returns text language sql immutable set search_path = '' as $$
  select lower(regexp_replace(btrim(coalesce(p_value, '')), '\s+', ' ', 'g'));
$$;
revoke all on function private.normalized_label(text) from public, anon, authenticated;

create or replace function private.prevent_audit_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'audit events are immutable' using errcode = '55000';
end;
$$;
drop trigger if exists audit_events_immutable on public.audit_events;
create trigger audit_events_immutable before update or delete on public.audit_events
for each row execute function private.prevent_audit_mutation();

create or replace function private.assert_journal_entry(p_entry_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_entry public.journal_entries%rowtype;
  v_count integer;
  v_debit numeric(18,3);
  v_credit numeric(18,3);
begin
  select * into v_entry from public.journal_entries where id = p_entry_id;
  if not found or v_entry.status not in ('posted','reversed') then return; end if;

  if v_entry.status = 'posted' and exists (
    select 1 from public.fiscal_periods p
    where p.organization_id = v_entry.organization_id
      and v_entry.entry_date between p.start_date and p.end_date
      and p.status = 'closed'
  ) then
    raise exception 'PERIOD_CLOSED' using errcode = 'P0001';
  end if;

  select count(*), coalesce(sum(debit),0), coalesce(sum(credit),0)
    into v_count, v_debit, v_credit
  from public.journal_lines where entry_id = p_entry_id;
  if v_count < 2 or v_debit <= 0 or v_credit <= 0 or v_debit <> v_credit then
    raise exception 'UNBALANCED_ENTRY' using errcode = 'P0001';
  end if;
end;
$$;
revoke all on function private.assert_journal_entry(uuid) from public, anon, authenticated;

create or replace function private.check_journal_entry_trigger()
returns trigger language plpgsql set search_path = '' as $$
begin
  perform private.assert_journal_entry(coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;
create or replace function private.check_journal_line_trigger()
returns trigger language plpgsql set search_path = '' as $$
begin
  perform private.assert_journal_entry(coalesce(new.entry_id, old.entry_id));
  if tg_op = 'UPDATE' and old.entry_id <> new.entry_id then perform private.assert_journal_entry(old.entry_id); end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists journal_entry_balance_deferred on public.journal_entries;
create constraint trigger journal_entry_balance_deferred
after insert or update on public.journal_entries deferrable initially deferred
for each row execute function private.check_journal_entry_trigger();
drop trigger if exists journal_line_balance_deferred on public.journal_lines;
create constraint trigger journal_line_balance_deferred
after insert or update or delete on public.journal_lines deferrable initially deferred
for each row execute function private.check_journal_line_trigger();

create or replace function private.validate_journal_line_org()
returns trigger language plpgsql set search_path = '' as $$
declare v_entry_org uuid; v_account_org uuid; v_third_org uuid; v_tax_org uuid;
begin
  select organization_id into v_entry_org from public.journal_entries where id = new.entry_id;
  select organization_id into v_account_org from public.accounts where id = new.account_id;
  if new.third_party_id is not null then select organization_id into v_third_org from public.third_parties where id = new.third_party_id; end if;
  if new.tax_line_id is not null then select organization_id into v_tax_org from public.invoice_tax_lines where id = new.tax_line_id; end if;
  if new.organization_id <> v_entry_org or new.organization_id <> v_account_org
     or (new.third_party_id is not null and new.organization_id <> v_third_org)
     or (new.tax_line_id is not null and new.organization_id <> v_tax_org) then
    raise exception 'CROSS_TENANT_REFERENCE' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists journal_lines_validate_org on public.journal_lines;
create trigger journal_lines_validate_org before insert or update on public.journal_lines
for each row execute function private.validate_journal_line_org();

create or replace function private.guard_posted_lines()
returns trigger language plpgsql set search_path = '' as $$
declare v_status text;
begin
  select status into v_status from public.journal_entries where id = coalesce(new.entry_id, old.entry_id);
  if v_status in ('posted','reversed') then
    raise exception 'POSTED_ENTRY_IMMUTABLE' using errcode = '55000';
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists journal_lines_guard_posted on public.journal_lines;
create trigger journal_lines_guard_posted before insert or update or delete on public.journal_lines
for each row execute function private.guard_posted_lines();

create or replace function private.guard_posted_entry()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' and old.status in ('posted','reversed') then
    raise exception 'POSTED_ENTRY_IMMUTABLE' using errcode = '55000';
  end if;
  if tg_op = 'UPDATE' and old.status in ('posted','reversed') then
    if not (old.status = 'posted' and new.status = 'reversed'
      and current_setting('elcomptabli.allow_reversal', true) = 'on') then
      raise exception 'POSTED_ENTRY_IMMUTABLE' using errcode = '55000';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists journal_entries_guard_posted on public.journal_entries;
create trigger journal_entries_guard_posted before update or delete on public.journal_entries
for each row execute function private.guard_posted_entry();

create or replace function private.validate_payment_allocation()
returns trigger language plpgsql set search_path = '' as $$
declare v_payment public.payments%rowtype; v_invoice public.invoices%rowtype;
begin
  select * into v_payment from public.payments where id = new.payment_id;
  select * into v_invoice from public.invoices where id = new.invoice_id;
  if v_payment.organization_id <> new.organization_id or v_invoice.organization_id <> new.organization_id then
    raise exception 'CROSS_TENANT_REFERENCE' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists payment_allocations_validate_org on public.payment_allocations;
create trigger payment_allocations_validate_org before insert or update on public.payment_allocations
for each row execute function private.validate_payment_allocation();

create or replace function private.assert_payment_allocations(p_payment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_amount numeric(18,3); v_allocated numeric(18,3); v_invoice_id uuid;
begin
  select amount into v_amount from public.payments where id = p_payment_id;
  select coalesce(sum(allocated_amount),0) into v_allocated from public.payment_allocations where payment_id = p_payment_id;
  if v_allocated > v_amount then raise exception 'PAYMENT_OVERALLOCATED' using errcode = '23514'; end if;

  -- Serialize allocation checks per invoice so concurrent payments cannot both
  -- observe the same remaining balance and over-allocate it at commit time.
  for v_invoice_id in
    select distinct invoice_id from public.payment_allocations
    where payment_id = p_payment_id order by invoice_id
  loop
    perform pg_advisory_xact_lock(hashtextextended(v_invoice_id::text, 0));
  end loop;

  if exists (
    select 1 from public.payment_allocations current_allocation
    join public.payment_allocations a on a.invoice_id = current_allocation.invoice_id
    join public.payments p on p.id = a.payment_id and p.status not in ('reversed','cancelled')
    join public.invoices i on i.id = a.invoice_id
    where current_allocation.payment_id = p_payment_id
    group by a.invoice_id, i.amount_ttc
    having sum(a.allocated_amount) > abs(i.amount_ttc)
  ) then raise exception 'INVOICE_OVERALLOCATED' using errcode = '23514'; end if;
end;
$$;
create or replace function private.check_payment_allocation_trigger()
returns trigger language plpgsql set search_path = '' as $$
begin
  perform private.assert_payment_allocations(coalesce(new.payment_id, old.payment_id));
  return coalesce(new, old);
end;
$$;
drop trigger if exists payment_allocations_amount_deferred on public.payment_allocations;
create constraint trigger payment_allocations_amount_deferred
after insert or update or delete on public.payment_allocations deferrable initially deferred
for each row execute function private.check_payment_allocation_trigger();

create or replace function public.post_journal_entry(p_organization_id uuid, p_entry_id uuid, p_actor_id uuid, p_request_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_entry public.journal_entries%rowtype; v_debit numeric(18,3); v_credit numeric(18,3); v_count integer;
begin
  if not exists (
    select 1 from public.organization_members m where m.organization_id = p_organization_id
      and m.user_id = p_actor_id and m.status = 'active' and m.role in ('owner','admin','accountant')
  ) then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  select * into v_entry from public.journal_entries where id = p_entry_id and organization_id = p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if v_entry.status = 'posted' then return jsonb_build_object('entry',to_jsonb(v_entry),'idempotent',true); end if;
  if v_entry.status not in ('draft','review') then raise exception 'INVALID_STATE' using errcode = '55000'; end if;
  if exists (select 1 from public.fiscal_periods p where p.organization_id=p_organization_id and v_entry.entry_date between p.start_date and p.end_date and p.status='closed')
    then raise exception 'PERIOD_CLOSED' using errcode = 'P0001'; end if;
  select count(*),coalesce(sum(debit),0),coalesce(sum(credit),0) into v_count,v_debit,v_credit
    from public.journal_lines where entry_id=p_entry_id;
  if v_count < 2 or v_debit <= 0 or v_credit <= 0 or v_debit <> v_credit
    then raise exception 'UNBALANCED_ENTRY' using errcode = 'P0001'; end if;
  update public.journal_entries set status='posted',posted_by=p_actor_id,posted_at=now(),updated_at=now()
    where id=p_entry_id returning * into v_entry;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'journal.posted','journal_entry',p_entry_id,p_request_id,jsonb_build_object('debit',v_debit,'credit',v_credit));
  return jsonb_build_object('entry',to_jsonb(v_entry),'idempotent',false);
end;
$$;

create unique index if not exists journal_entries_reversal_unique on public.journal_entries(reversed_entry_id) where reversed_entry_id is not null;
create or replace function public.reverse_journal_entry(p_organization_id uuid, p_entry_id uuid, p_actor_id uuid, p_entry_number text, p_entry_date date, p_request_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_original public.journal_entries%rowtype; v_reversal public.journal_entries%rowtype;
begin
  if not exists (select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_original from public.journal_entries where id=p_entry_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  select * into v_reversal from public.journal_entries where reversed_entry_id=p_entry_id;
  if found then return jsonb_build_object('entry',to_jsonb(v_reversal),'idempotent',true); end if;
  if v_original.status <> 'posted' then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  insert into public.journal_entries(organization_id,journal_id,entry_number,entry_date,reference,description,source_type,source_id,status,created_by,reversed_entry_id)
    values(p_organization_id,v_original.journal_id,p_entry_number,p_entry_date,v_original.reference,'Annulation: '||v_original.description,'reversal',p_entry_id,'draft',p_actor_id,p_entry_id)
    returning * into v_reversal;
  insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,description,debit,credit,tax_line_id)
    select organization_id,v_reversal.id,account_id,third_party_id,description,credit,debit,tax_line_id
    from public.journal_lines where entry_id=p_entry_id;
  perform public.post_journal_entry(p_organization_id,v_reversal.id,p_actor_id,p_request_id);
  perform set_config('elcomptabli.allow_reversal','on',true);
  update public.journal_entries set status='reversed',updated_at=now() where id=p_entry_id;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'journal.reversed','journal_entry',p_entry_id,p_request_id,jsonb_build_object('reversal_id',v_reversal.id));
  select * into v_reversal from public.journal_entries where id=v_reversal.id;
  return jsonb_build_object('entry',to_jsonb(v_reversal),'idempotent',false);
end;
$$;

create or replace function public.post_payment(p_organization_id uuid, p_payment_id uuid, p_actor_id uuid, p_request_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_payment public.payments%rowtype;
begin
  if not exists (select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_payment from public.payments where id=p_payment_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_payment.status='posted' then return jsonb_build_object('payment',to_jsonb(v_payment),'idempotent',true); end if;
  if v_payment.status<>'draft' then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  perform private.assert_payment_allocations(p_payment_id);
  if v_payment.journal_entry_id is not null and not exists(select 1 from public.journal_entries e where e.id=v_payment.journal_entry_id and e.organization_id=p_organization_id and e.status='posted')
    then raise exception 'JOURNAL_NOT_POSTED' using errcode='55000'; end if;
  update public.payments set status='posted',updated_at=now() where id=p_payment_id returning * into v_payment;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'payment.posted','payment',p_payment_id,p_request_id,jsonb_build_object('amount',v_payment.amount,'currency',v_payment.currency));
  return jsonb_build_object('payment',to_jsonb(v_payment),'idempotent',false);
end;
$$;

create or replace function public.confirm_reconciliation(p_organization_id uuid, p_match_id uuid, p_actor_id uuid, p_request_id text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_match public.reconciliation_matches%rowtype;
begin
  if not exists (select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_match from public.reconciliation_matches where id=p_match_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_match.status='confirmed' then return jsonb_build_object('match',to_jsonb(v_match),'idempotent',true); end if;
  if v_match.status<>'suggested' then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  update public.reconciliation_matches set status='confirmed',confirmed_by=p_actor_id,confirmed_at=now() where id=p_match_id returning * into v_match;
  update public.bank_transactions set status='reconciled' where id=v_match.bank_transaction_id and organization_id=p_organization_id;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'reconciliation.confirmed','reconciliation_match',p_match_id,p_request_id,'{}');
  return jsonb_build_object('match',to_jsonb(v_match),'idempotent',false);
end;
$$;

-- Normalized invoice confirmation remains compatible with the existing API.
create or replace function public.confirm_scanned_invoice(
  p_user_id uuid, p_fingerprint text, p_invoice jsonb, p_transaction jsonb, p_document jsonb, p_activity jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_org uuid; v_invoice public.invoices%rowtype; v_state jsonb; v_document uuid; v_third uuid;
  v_name text; v_tax text; v_kind text;
begin
  if p_user_id is null or length(coalesce(p_fingerprint,''))<5 then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  select m.organization_id into v_org from public.organization_members m
    where m.user_id=p_user_id and m.status='active'
    order by case m.role when 'owner' then 0 else 1 end,m.created_at limit 1;
  if v_org is null then raise exception 'ORGANIZATION_REQUIRED' using errcode='55000'; end if;
  select * into v_invoice from public.invoices
    where organization_id=v_org and (document_id=p_invoice->>'id' or transaction_id=p_transaction->>'id') limit 1;
  if found then
    select data into v_state from public.app_state where user_id=p_user_id;
    return jsonb_build_object('state',v_state,'invoice',to_jsonb(v_invoice),'idempotent',true);
  end if;
  v_name:=left(btrim(coalesce(p_invoice->>'vendor','')),200);
  v_tax:=nullif(upper(btrim(coalesce(p_invoice->>'supplierTaxId',''))),'');
  v_kind:=case when p_invoice->>'kind'='income' then 'customer' else 'supplier' end;
  if v_tax is not null then select id into v_third from public.third_parties where organization_id=v_org and upper(tax_id)=v_tax limit 1;
  else select id into v_third from public.third_parties where organization_id=v_org and type=v_kind and normalized_name=private.normalized_label(v_name) and (tax_id is null or btrim(tax_id)='') limit 1; end if;
  if v_third is null then
    insert into public.third_parties(organization_id,type,name,normalized_name,tax_id)
      values(v_org,v_kind,v_name,private.normalized_label(v_name),v_tax) on conflict do nothing returning id into v_third;
    if v_third is null then
      select id into v_third from public.third_parties where organization_id=v_org and (upper(coalesce(tax_id,''))=coalesce(v_tax,'') or (normalized_name=private.normalized_label(v_name) and type=v_kind)) limit 1;
    end if;
  end if;
  insert into public.documents(organization_id,uploader_id,source_id,storage_path,original_filename,mime_type,file_size,document_type,processing_status,ocr_status,metadata)
    values(v_org,p_user_id,p_invoice->>'id',p_invoice->>'storagePath',coalesce(p_document->>'name','document'),p_document->>'mimeType',
      greatest(1,coalesce((p_document->>'storageSizeBytes')::bigint,1)),case when coalesce(p_invoice->>'documentType','facture')='avoir' then 'credit_note' else 'invoice' end,
      'confirmed','succeeded',jsonb_build_object('legacy_transaction_id',p_transaction->>'id'))
    on conflict (organization_id,source_id) do nothing returning id into v_document;
  if v_document is null then select id into v_document from public.documents where organization_id=v_org and source_id=p_invoice->>'id'; end if;
  insert into public.ocr_results(organization_id,document_id,attempt_no,provider,provider_model,extracted_data,confidence,safe_raw_response,page_count,status,completed_at)
    values(v_org,v_document,1,'ai','configured',p_invoice-'rawOcr',coalesce(p_invoice->'confidence','{}'),p_invoice->'rawOcr',1,'succeeded',now())
    on conflict (document_id,attempt_no) do nothing;
  insert into public.invoices(
    user_id,organization_id,document_id,document_record_id,transaction_id,fingerprint,third_party_id,kind,supplier,supplier_tax_id,
    invoice_number,invoice_date,due_date,currency,amount_ht,vat_amount,amount_ttc,discount,stamp_duty,withholding_tax,tax_exempt,
    document_type,status,vat_rate,vat_rates,category,storage_path,mime_type,raw_ocr,validated_fields,confidence,validated_by,validated_at,idempotency_key
  ) values(
    p_user_id,v_org,p_invoice->>'id',v_document,p_transaction->>'id',p_fingerprint,v_third,p_invoice->>'kind',v_name,coalesce(v_tax,''),
    p_invoice->>'invoiceNumber',(p_invoice->>'date')::date,null,'TND',nullif(p_invoice->>'amountHT','')::numeric,nullif(p_invoice->>'tva','')::numeric,
    (p_invoice->>'amountTTC')::numeric,coalesce(nullif(p_invoice->>'discount','')::numeric,0),coalesce(nullif(p_invoice->>'stampDuty','')::numeric,0),
    coalesce(nullif(p_invoice->>'withholdingTax','')::numeric,0),coalesce((p_invoice->>'taxExempt')::boolean,false),coalesce(p_invoice->>'documentType','facture'),
    'confirmed',nullif(p_invoice->>'tvaRate','')::numeric,coalesce(p_invoice->'vatRates','[]'),coalesce(p_invoice->>'category','autres'),
    p_invoice->>'storagePath',p_document->>'mimeType',p_invoice->'rawOcr',p_invoice-'rawOcr',coalesce(p_invoice->'confidence','{}'),p_user_id,
    (p_invoice->>'validatedAt')::timestamptz,p_invoice->>'id'
  ) returning * into v_invoice;
  if v_invoice.tax_exempt then
    insert into public.invoice_tax_lines(organization_id,invoice_id,tax_rate,taxable_base,tax_amount,tax_type)
      values(v_org,v_invoice.id,0,coalesce(abs(v_invoice.amount_ht),0),0,'exempt');
  elsif v_invoice.vat_rate is not null or v_invoice.vat_amount is not null then
    insert into public.invoice_tax_lines(organization_id,invoice_id,tax_rate,taxable_base,tax_amount,tax_type)
      values(v_org,v_invoice.id,v_invoice.vat_rate,coalesce(abs(v_invoice.amount_ht),0),coalesce(abs(v_invoice.vat_amount),0),'vat');
  end if;
  update public.app_state set data=jsonb_set(jsonb_set(jsonb_set(data,'{transactions}',jsonb_build_array(p_transaction)||coalesce(data->'transactions','[]'),true),
    '{documents}',jsonb_build_array(p_document)||coalesce(data->'documents','[]'),true),'{activities}',jsonb_build_array(p_activity)||coalesce(data->'activities','[]'),true),updated_at=now()
    where user_id=p_user_id returning data into v_state;
  if v_state is null then raise exception 'ACCOUNT_STATE_REQUIRED' using errcode='55000'; end if;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,safe_metadata)
    values(v_org,p_user_id,'invoice.confirmed','invoice',v_invoice.id,jsonb_build_object('document_id',v_document,'fingerprint',p_fingerprint));
  return jsonb_build_object('state',v_state,'invoice',to_jsonb(v_invoice),'idempotent',false);
end;
$$;

-- Authoritative reports are derived only from posted journal lines.
create or replace view public.general_ledger_v with (security_invoker = true) as
select e.organization_id,e.id entry_id,e.entry_number,e.entry_date,e.reference,e.description entry_description,
  e.journal_id,j.code journal_code,l.id line_id,l.account_id,a.account_number,a.label account_label,
  l.third_party_id,l.description line_description,l.debit,l.credit,e.posted_at
from public.journal_entries e
join public.journals j on j.id=e.journal_id
join public.journal_lines l on l.entry_id=e.id
join public.accounts a on a.id=l.account_id
where e.status in ('posted','reversed');

create or replace view public.trial_balance_v with (security_invoker = true) as
select l.organization_id,l.account_id,a.account_number,a.label,a.class,a.reporting_category,
  sum(l.debit)::numeric(18,3) total_debit,sum(l.credit)::numeric(18,3) total_credit,
  (sum(l.debit)-sum(l.credit))::numeric(18,3) balance
from public.journal_lines l join public.journal_entries e on e.id=l.entry_id
join public.accounts a on a.id=l.account_id
where e.status in ('posted','reversed') group by l.organization_id,l.account_id,a.account_number,a.label,a.class,a.reporting_category;

create or replace view public.financial_statement_v with (security_invoker = true) as
select organization_id,
  case when class between 1 and 5 then 'balance_sheet' when class=6 then 'expense' when class=7 then 'revenue' else 'other' end statement,
  coalesce(reporting_category,'unmapped') reporting_category,
  sum(total_debit)::numeric(18,3) total_debit,sum(total_credit)::numeric(18,3) total_credit,
  sum(balance)::numeric(18,3) balance
from public.trial_balance_v group by organization_id,
  case when class between 1 and 5 then 'balance_sheet' when class=6 then 'expense' when class=7 then 'revenue' else 'other' end,
  coalesce(reporting_category,'unmapped');

revoke all on public.general_ledger_v,public.trial_balance_v,public.financial_statement_v from public,anon,authenticated;
grant select on public.general_ledger_v,public.trial_balance_v,public.financial_statement_v to service_role;

revoke all on function
  public.post_journal_entry(uuid,uuid,uuid,text),
  public.reverse_journal_entry(uuid,uuid,uuid,text,date,text),
  public.post_payment(uuid,uuid,uuid,text),
  public.confirm_reconciliation(uuid,uuid,uuid,text),
  public.confirm_scanned_invoice(uuid,text,jsonb,jsonb,jsonb,jsonb)
from public,anon,authenticated;
grant execute on function
  public.post_journal_entry(uuid,uuid,uuid,text),
  public.reverse_journal_entry(uuid,uuid,uuid,text,date,text),
  public.post_payment(uuid,uuid,uuid,text),
  public.confirm_reconciliation(uuid,uuid,uuid,text),
  public.confirm_scanned_invoice(uuid,text,jsonb,jsonb,jsonb,jsonb)
to service_role;

create or replace function public.create_journal_entry(
  p_organization_id uuid, p_actor_id uuid, p_entry jsonb, p_lines jsonb, p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_entry public.journal_entries%rowtype; v_line jsonb; v_debit numeric(18,3); v_credit numeric(18,3); v_count integer;
begin
  if not exists (select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines)<2 or jsonb_array_length(p_lines)>500
    then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  select count(*),coalesce(sum((x->>'debit')::numeric),0),coalesce(sum((x->>'credit')::numeric),0)
    into v_count,v_debit,v_credit from jsonb_array_elements(p_lines) x;
  if v_count<2 or v_debit<=0 or v_credit<=0 or v_debit<>v_credit
    then raise exception 'UNBALANCED_ENTRY' using errcode='P0001'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_lines) x left join public.accounts a on a.id=(x->>'accountId')::uuid
    where a.id is null or a.organization_id<>p_organization_id or not a.is_active
      or (coalesce((x->>'debit')::numeric,0)>0 and coalesce((x->>'credit')::numeric,0)>0)
      or (coalesce((x->>'debit')::numeric,0)=0 and coalesce((x->>'credit')::numeric,0)=0)
  ) then raise exception 'INVALID_ACCOUNT' using errcode='23514'; end if;
  if not exists(select 1 from public.journals j where j.id=(p_entry->>'journalId')::uuid and j.organization_id=p_organization_id and j.active)
    then raise exception 'INVALID_JOURNAL' using errcode='23514'; end if;
  if nullif(p_entry->>'sourceId','') is not null then
    select * into v_entry from public.journal_entries where organization_id=p_organization_id and source_type=p_entry->>'sourceType' and source_id=(p_entry->>'sourceId')::uuid and status<>'reversed';
    if found then return jsonb_build_object('entry',to_jsonb(v_entry),'idempotent',true); end if;
  end if;
  insert into public.journal_entries(organization_id,journal_id,entry_number,entry_date,reference,description,source_type,source_id,status,created_by)
    values(p_organization_id,(p_entry->>'journalId')::uuid,left(p_entry->>'entryNumber',80),(p_entry->>'entryDate')::date,
      left(p_entry->>'reference',160),left(p_entry->>'description',500),nullif(left(p_entry->>'sourceType',80),''),nullif(p_entry->>'sourceId','')::uuid,'draft',p_actor_id)
    returning * into v_entry;
  for v_line in select value from jsonb_array_elements(p_lines) loop
    insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,description,debit,credit,tax_line_id)
      values(p_organization_id,v_entry.id,(v_line->>'accountId')::uuid,nullif(v_line->>'thirdPartyId','')::uuid,
        left(v_line->>'description',500),coalesce((v_line->>'debit')::numeric,0),coalesce((v_line->>'credit')::numeric,0),nullif(v_line->>'taxLineId','')::uuid);
  end loop;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'journal.created','journal_entry',v_entry.id,p_request_id,jsonb_build_object('debit',v_debit,'credit',v_credit));
  return jsonb_build_object('entry',to_jsonb(v_entry),'idempotent',false);
end;
$$;

create or replace function public.create_payment(
  p_organization_id uuid, p_actor_id uuid, p_payment jsonb, p_allocations jsonb default '[]', p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_payment public.payments%rowtype; v_allocation jsonb; v_key text;
begin
  if not exists (select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  v_key:=nullif(left(p_payment->>'idempotencyKey',160),'');
  if v_key is not null then
    select * into v_payment from public.payments where organization_id=p_organization_id and idempotency_key=v_key;
    if found then return jsonb_build_object('payment',to_jsonb(v_payment),'idempotent',true); end if;
  end if;
  if (p_payment->>'amount')::numeric<=0 or jsonb_typeof(p_allocations)<>'array' or jsonb_array_length(p_allocations)>500
    then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  insert into public.payments(organization_id,third_party_id,invoice_id,amount,currency,payment_date,payment_method,bank_account_id,reference,status,journal_entry_id,idempotency_key,created_by)
    values(p_organization_id,nullif(p_payment->>'thirdPartyId','')::uuid,nullif(p_payment->>'invoiceId','')::uuid,(p_payment->>'amount')::numeric,
      coalesce(nullif(upper(p_payment->>'currency'),''),'TND'),(p_payment->>'paymentDate')::date,p_payment->>'paymentMethod',
      nullif(p_payment->>'bankAccountId','')::uuid,left(p_payment->>'reference',160),'draft',nullif(p_payment->>'journalEntryId','')::uuid,v_key,p_actor_id)
    returning * into v_payment;
  for v_allocation in select value from jsonb_array_elements(p_allocations) loop
    insert into public.payment_allocations(organization_id,payment_id,invoice_id,allocated_amount)
      values(p_organization_id,v_payment.id,(v_allocation->>'invoiceId')::uuid,(v_allocation->>'allocatedAmount')::numeric);
  end loop;
  perform private.assert_payment_allocations(v_payment.id);
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'payment.created','payment',v_payment.id,p_request_id,jsonb_build_object('amount',v_payment.amount,'currency',v_payment.currency));
  return jsonb_build_object('payment',to_jsonb(v_payment),'idempotent',false);
end;
$$;

revoke all on function public.create_journal_entry(uuid,uuid,jsonb,jsonb,text),public.create_payment(uuid,uuid,jsonb,jsonb,text)
from public,anon,authenticated;
grant execute on function public.create_journal_entry(uuid,uuid,jsonb,jsonb,text),public.create_payment(uuid,uuid,jsonb,jsonb,text)
to service_role;

create or replace view public.vat_summary_v with (security_invoker = true) as
select i.organization_id,date_trunc('month',i.invoice_date)::date period_month,i.kind,l.tax_rate,l.tax_type,
  sum(l.taxable_base)::numeric(18,3) taxable_base,sum(l.tax_amount)::numeric(18,3) tax_amount,
  count(distinct i.id)::bigint invoice_count
from public.invoice_tax_lines l join public.invoices i on i.id=l.invoice_id
where i.status in ('confirmed','paid')
group by i.organization_id,date_trunc('month',i.invoice_date)::date,i.kind,l.tax_rate,l.tax_type;

create or replace view public.dashboard_v with (security_invoker = true) as
select o.id organization_id,
  coalesce(inv.invoice_count,0)::bigint invoice_count,
  coalesce(inv.income_ttc,0)::numeric(18,3) income_ttc,
  coalesce(inv.expense_ttc,0)::numeric(18,3) expense_ttc,
  coalesce(ent.posted_entry_count,0)::bigint posted_entry_count,
  coalesce(pay.open_payment_count,0)::bigint open_payment_count
from public.organizations o
left join (
  select organization_id,count(*) invoice_count,
    sum(case when kind='income' then amount_ttc else 0 end) income_ttc,
    sum(case when kind='expense' then amount_ttc else 0 end) expense_ttc
  from public.invoices where status in ('confirmed','paid') group by organization_id
) inv on inv.organization_id=o.id
left join (
  select organization_id,count(*) posted_entry_count from public.journal_entries where status in ('posted','reversed') group by organization_id
) ent on ent.organization_id=o.id
left join (
  select organization_id,count(*) open_payment_count from public.payments where status='draft' group by organization_id
) pay on pay.organization_id=o.id;

revoke all on public.vat_summary_v,public.dashboard_v from public,anon,authenticated;
grant select on public.vat_summary_v,public.dashboard_v to service_role;

create or replace function public.create_organization(
  p_actor_id uuid, p_name text, p_legal_name text default null, p_tax_id text default null,
  p_country text default 'TN', p_currency text default 'TND', p_fiscal_year_start date default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_org public.organizations%rowtype;
begin
  if not exists(select 1 from auth.users u where u.id=p_actor_id) then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if char_length(btrim(coalesce(p_name,''))) not between 1 and 160 then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  insert into public.organizations(name,legal_name,tax_id,country,currency,fiscal_year_start)
    values(left(btrim(p_name),160),nullif(left(btrim(p_legal_name),200),''),nullif(upper(left(btrim(p_tax_id),40)),''),upper(p_country),upper(p_currency),
      coalesce(p_fiscal_year_start,make_date(extract(year from current_date)::integer,1,1))) returning * into v_org;
  insert into public.organization_members(organization_id,user_id,role,status,joined_at) values(v_org.id,p_actor_id,'owner','active',now());
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,safe_metadata)
    values(v_org.id,p_actor_id,'organization.created','organization',v_org.id,'{}');
  return jsonb_build_object('organization',to_jsonb(v_org),'role','owner');
end;
$$;

create or replace function public.import_bank_transactions(
  p_organization_id uuid,p_actor_id uuid,p_bank_account_id uuid,p_transactions jsonb,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_item jsonb; v_inserted integer:=0; v_id uuid;
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if not exists(select 1 from public.bank_accounts b where b.id=p_bank_account_id and b.organization_id=p_organization_id and b.active)
    then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if jsonb_typeof(p_transactions)<>'array' or jsonb_array_length(p_transactions)<1 or jsonb_array_length(p_transactions)>1000
    then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  for v_item in select value from jsonb_array_elements(p_transactions) loop
    v_id:=null;
    insert into public.bank_transactions(organization_id,bank_account_id,transaction_date,value_date,amount,reference,description,imported_hash,status)
      values(p_organization_id,p_bank_account_id,(v_item->>'transactionDate')::date,nullif(v_item->>'valueDate','')::date,(v_item->>'amount')::numeric,
        left(v_item->>'reference',200),left(v_item->>'description',1000),v_item->>'importedHash','unmatched')
      on conflict (organization_id,bank_account_id,imported_hash) do nothing returning id into v_id;
    if v_id is not null then v_inserted:=v_inserted+1; end if;
  end loop;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'bank.imported','bank_account',p_request_id,jsonb_build_object('bank_account_id',p_bank_account_id,'received',jsonb_array_length(p_transactions),'inserted',v_inserted));
  return jsonb_build_object('received',jsonb_array_length(p_transactions),'inserted',v_inserted,'duplicates',jsonb_array_length(p_transactions)-v_inserted);
end;
$$;

create or replace function public.create_reconciliation_suggestion(
  p_organization_id uuid,p_actor_id uuid,p_bank_transaction_id uuid,p_payment_id uuid,p_journal_entry_id uuid,
  p_confidence numeric,p_matching_method text,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_match public.reconciliation_matches%rowtype;
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if not exists(select 1 from public.bank_transactions b where b.id=p_bank_transaction_id and b.organization_id=p_organization_id)
    or (p_payment_id is not null and not exists(select 1 from public.payments p where p.id=p_payment_id and p.organization_id=p_organization_id))
    or (p_journal_entry_id is not null and not exists(select 1 from public.journal_entries e where e.id=p_journal_entry_id and e.organization_id=p_organization_id))
    then raise exception 'CROSS_TENANT_REFERENCE' using errcode='23514'; end if;
  insert into public.reconciliation_matches(organization_id,bank_transaction_id,payment_id,journal_entry_id,confidence,matching_method,status)
    values(p_organization_id,p_bank_transaction_id,p_payment_id,p_journal_entry_id,p_confidence,p_matching_method,'suggested') returning * into v_match;
  update public.bank_transactions set status='suggested' where id=p_bank_transaction_id and status='unmatched';
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'reconciliation.suggested','reconciliation_match',v_match.id,p_request_id,jsonb_build_object('method',p_matching_method));
  return jsonb_build_object('match',to_jsonb(v_match));
end;
$$;

revoke all on function
  public.create_organization(uuid,text,text,text,text,text,date),
  public.import_bank_transactions(uuid,uuid,uuid,jsonb,text),
  public.create_reconciliation_suggestion(uuid,uuid,uuid,uuid,uuid,numeric,text,text)
from public,anon,authenticated;
grant execute on function
  public.create_organization(uuid,text,text,text,text,text,date),
  public.import_bank_transactions(uuid,uuid,uuid,jsonb,text),
  public.create_reconciliation_suggestion(uuid,uuid,uuid,uuid,uuid,numeric,text,text)
to service_role;
