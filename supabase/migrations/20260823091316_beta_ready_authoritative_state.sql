-- Replace the legacy per-user JSON blob with normalized, organization-scoped
-- sources of truth. UI preferences remain JSON because they are not business
-- records; every business collection is stored in its own table.

alter table public.profiles add column if not exists phone text not null default '';
alter table public.profiles add column if not exists sector text not null default '';

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(preferences) = 'object')
);

create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  kind text not null check (kind in ('income','expense')),
  counterparty text not null default '',
  label text not null default '',
  category text not null default 'autres',
  transaction_date date not null,
  amount_ht numeric(18,3) not null default 0 check (amount_ht >= 0),
  vat_amount numeric(18,3) not null default 0 check (vat_amount >= 0),
  amount_ttc numeric(18,3) not null check (amount_ttc > 0),
  status text not null default 'paid' check (status in ('pending','paid','cancelled')),
  reference text,
  source text not null default 'manual' check (source in ('manual','generated_invoice')),
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create table public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  due_date date,
  status text not null default 'upcoming' check (status in ('upcoming','done','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tax_deadlines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 240),
  due_date date not null,
  status text not null default 'upcoming' check (status in ('upcoming','paid','overdue','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Conversation',
  messages jsonb not null default '[]'::jsonb,
  agent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(messages) = 'array')
);

create table public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.calculation_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  calculation_type text not null,
  inputs jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  text text not null check (char_length(text) between 1 and 500),
  icon text not null default 'Activity',
  created_at timestamptz not null default now()
);

create index financial_transactions_org_date_idx on public.financial_transactions(organization_id, transaction_date desc, id desc);
create index user_tasks_user_status_idx on public.user_tasks(user_id, status, due_date);
create index tax_deadlines_org_date_idx on public.tax_deadlines(organization_id, due_date, id);
create index chat_sessions_user_updated_idx on public.chat_sessions(user_id, updated_at desc);
create index ai_reports_user_created_idx on public.ai_reports(user_id, created_at desc);
create index calculation_history_user_created_idx on public.calculation_history(user_id, created_at desc);
create index activity_events_org_created_idx on public.activity_events(organization_id, created_at desc, id desc);

create or replace function public.ensure_user_organization(p_actor_id uuid,p_name text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_org uuid; v_name text;
begin
  if not exists(select 1 from auth.users where id=p_actor_id) then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0));
  select organization_id into v_org from public.organization_members
    where user_id=p_actor_id and status='active' order by created_at limit 1;
  if v_org is not null then return v_org; end if;
  v_name:=left(coalesce(nullif(btrim(p_name),''),'Mon organisation'),160);
  insert into public.organizations(name,legal_name) values(v_name,v_name) returning id into v_org;
  insert into public.organization_members(organization_id,user_id,role,status,joined_at) values(v_org,p_actor_id,'owner','active',now());
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,safe_metadata)
    values(v_org,p_actor_id,'organization.created','organization',v_org,'{}');
  return v_org;
end;
$$;
revoke all on function public.ensure_user_organization(uuid,text) from public,anon,authenticated;
grant execute on function public.ensure_user_organization(uuid,text) to service_role;

do $$ declare t text; begin
  foreach t in array array['user_preferences','financial_transactions','user_tasks','tax_deadlines','chat_sessions','ai_reports','calculation_history','activity_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
  foreach t in array array['financial_transactions','user_tasks','tax_deadlines','chat_sessions'] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()', t, t);
  end loop;
  create trigger user_preferences_set_updated_at before update on public.user_preferences for each row execute function private.set_updated_at();
end $$;

create policy user_preferences_self_select on public.user_preferences for select to authenticated using (user_id=(select auth.uid()));
create policy user_preferences_self_write on public.user_preferences for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

do $$ declare t text; begin
  foreach t in array array['financial_transactions','tax_deadlines','activity_events'] loop
    execute format('create policy %I_member_select on public.%I for select to authenticated using (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'',''employee'',''viewer'']))',t,t);
    execute format('create policy %I_accounting_write on public.%I for all to authenticated using (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant''])) with check (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'']))',t,t);
  end loop;
  foreach t in array array['user_tasks','chat_sessions','ai_reports','calculation_history'] loop
    execute format('create policy %I_owner_select on public.%I for select to authenticated using (user_id=(select auth.uid()) and private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'',''employee'',''viewer'']))',t,t);
    execute format('create policy %I_owner_write on public.%I for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()) and private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'',''employee'']))',t,t);
  end loop;
end $$;

-- Preserve the only legitimate legacy content: personal UI preferences and
-- profile fields. Business arrays are intentionally not copied into JSON.
insert into public.user_preferences(user_id,preferences)
select user_id, coalesce(data->'settings','{}'::jsonb)
from public.app_state
on conflict(user_id) do update set preferences=excluded.preferences;

update public.profiles p set
  name=coalesce(nullif(s.data->'profile'->>'name',''),p.name),
  regime=coalesce(nullif(s.data->'profile'->>'regime',''),p.regime),
  user_type=coalesce(nullif(s.data->'profile'->>'userType',''),p.user_type),
  city=coalesce(nullif(s.data->'profile'->>'city',''),p.city),
  activity=coalesce(nullif(s.data->'profile'->>'activity',''),p.activity)
  ,phone=coalesce(nullif(s.data->'profile'->>'phone',''),p.phone)
  ,sector=coalesce(nullif(s.data->'profile'->>'sector',''),p.sector)
from public.app_state s where s.user_id=p.id;

create or replace view public.business_transactions_v with (security_invoker=true) as
select id,organization_id,kind,counterparty vendor,label,category,transaction_date date,
  amount_ht,vat_amount tva,amount_ttc,status,reference,false scanned,null::text document_id,source,created_at,updated_at
from public.financial_transactions
union all
select i.id,i.organization_id,i.kind,i.supplier vendor,i.supplier label,i.category,i.invoice_date date,
  coalesce(i.amount_ht,0),coalesce(i.vat_amount,0),i.amount_ttc,
  case when i.status='confirmed' then 'paid' else 'pending' end,i.invoice_number,true,i.document_record_id::text,'scan',i.created_at,i.updated_at
from public.invoices i where i.status not in ('rejected','cancelled');
revoke all on public.business_transactions_v from public,anon,authenticated;
grant select on public.business_transactions_v to service_role;

drop view public.dashboard_v;
create view public.dashboard_v with (security_invoker=true) as
select o.id organization_id,
  count(distinct i.id)::bigint invoice_count,
  count(distinct e.id) filter(where e.status in ('posted','reversed'))::bigint posted_entry_count,
  coalesce((select sum(t.amount_ttc) from public.business_transactions_v t where t.organization_id=o.id and t.kind='income' and t.status<>'cancelled'),0)::numeric(18,3) income_ttc,
  coalesce((select sum(t.amount_ttc) from public.business_transactions_v t where t.organization_id=o.id and t.kind='expense' and t.status<>'cancelled'),0)::numeric(18,3) expense_ttc
from public.organizations o
left join public.invoices i on i.organization_id=o.id and i.status not in ('rejected','cancelled')
left join public.journal_entries e on e.organization_id=o.id
group by o.id;
revoke all on public.dashboard_v from public,anon,authenticated;
grant select on public.dashboard_v to service_role;

-- Invoice confirmation remains one transaction and returns normalized rows;
-- no dashboard or financial JSON snapshot is written.
create or replace function public.confirm_scanned_invoice(
  p_user_id uuid, p_fingerprint text, p_invoice jsonb, p_transaction jsonb, p_document jsonb, p_activity jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_org uuid; v_invoice public.invoices%rowtype; v_document uuid; v_third uuid;
  v_name text; v_tax text; v_kind text;
begin
  if p_user_id is null or length(coalesce(p_fingerprint,''))<5 then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  select m.organization_id into v_org from public.organization_members m
   where m.user_id=p_user_id and m.status='active' and m.role in ('owner','admin','accountant')
   order by case m.role when 'owner' then 0 else 1 end,m.created_at limit 1;
  if v_org is null then raise exception 'FORBIDDEN' using errcode='42501'; end if;

  select * into v_invoice from public.invoices
   where organization_id=v_org and (document_id=p_invoice->>'id' or transaction_id=p_transaction->>'id') limit 1;
  if found then
    select id into v_document from public.documents where id=v_invoice.document_record_id and organization_id=v_org;
    return jsonb_build_object('invoice',to_jsonb(v_invoice),'documentRecordId',v_document,'transaction',p_transaction,'idempotent',true);
  end if;

  v_name:=left(btrim(coalesce(p_invoice->>'vendor','')),200);
  v_tax:=nullif(upper(btrim(coalesce(p_invoice->>'supplierTaxId',''))),'');
  v_kind:=case when p_invoice->>'kind'='income' then 'customer' else 'supplier' end;
  if v_tax is not null then
    select id into v_third from public.third_parties where organization_id=v_org and upper(tax_id)=v_tax limit 1;
  else
    select id into v_third from public.third_parties where organization_id=v_org and type=v_kind
      and normalized_name=private.normalized_label(v_name) and (tax_id is null or btrim(tax_id)='') limit 1;
  end if;
  if v_third is null then
    insert into public.third_parties(organization_id,type,name,normalized_name,tax_id)
      values(v_org,v_kind,v_name,private.normalized_label(v_name),v_tax)
      on conflict do nothing returning id into v_third;
    if v_third is null then
      select id into v_third from public.third_parties where organization_id=v_org
       and (upper(coalesce(tax_id,''))=coalesce(v_tax,'') or (normalized_name=private.normalized_label(v_name) and type=v_kind)) limit 1;
    end if;
  end if;

  insert into public.documents(organization_id,uploader_id,source_id,storage_path,original_filename,mime_type,file_size,document_type,processing_status,ocr_status,metadata)
    values(v_org,p_user_id,p_invoice->>'id',p_invoice->>'storagePath',coalesce(p_document->>'name','document'),p_document->>'mimeType',
      greatest(1,coalesce((p_document->>'storageSizeBytes')::bigint,1)),case when coalesce(p_invoice->>'documentType','facture')='avoir' then 'credit_note' else 'invoice' end,
      'confirmed','succeeded',jsonb_build_object('legacy_transaction_id',p_transaction->>'id'))
    on conflict(organization_id,source_id) do nothing returning id into v_document;
  if v_document is null then select id into v_document from public.documents where organization_id=v_org and source_id=p_invoice->>'id'; end if;

  insert into public.ocr_results(organization_id,document_id,attempt_no,provider,provider_model,extracted_data,confidence,safe_raw_response,page_count,status,completed_at)
    values(v_org,v_document,1,'ai','configured',p_invoice-'rawOcr',coalesce(p_invoice->'confidence','{}'),p_invoice->'rawOcr',1,'succeeded',now())
    on conflict(document_id,attempt_no) do nothing;

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

  insert into public.activity_events(organization_id,actor_id,text,icon)
    values(v_org,p_user_id,left(coalesce(p_activity->>'text','Facture confirmée'),500),left(coalesce(p_activity->>'icon','ScanLine'),80));
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,safe_metadata)
    values(v_org,p_user_id,'invoice.confirmed','invoice',v_invoice.id,jsonb_build_object('document_id',v_document,'fingerprint',p_fingerprint));
  return jsonb_build_object('invoice',to_jsonb(v_invoice),'documentRecordId',v_document,'transaction',p_transaction,'idempotent',false);
end;
$$;
revoke all on function public.confirm_scanned_invoice(uuid,text,jsonb,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.confirm_scanned_invoice(uuid,text,jsonb,jsonb,jsonb,jsonb) to service_role;

-- Keep a reversible, server-inaccessible recovery copy instead of destroying
-- historical rows during the beta cutover.
alter table public.app_state set schema private;
alter table private.app_state rename to app_state_legacy_backup;
revoke all on table private.app_state_legacy_backup from public,anon,authenticated;
grant all on table private.app_state_legacy_backup to service_role;
