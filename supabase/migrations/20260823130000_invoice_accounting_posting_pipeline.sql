-- Authoritative invoice accounting pipeline.
-- No Tunisian account numbers are invented here: an accountant must provide
-- a human-confirmed mapping, journal and counterparty account.

alter table public.accounting_mappings
  add column if not exists journal_id uuid,
  add column if not exists counterparty_account_id uuid;

alter table public.accounting_mappings
  add constraint accounting_mappings_id_organization_unique unique (id, organization_id);

alter table public.invoices
  add column if not exists accounting_mapping_id uuid,
  add column if not exists journal_entry_id uuid,
  add column if not exists accounting_status text not null default 'pending_mapping',
  add column if not exists accounting_validated_by uuid,
  add column if not exists accounting_validated_at timestamptz;

alter table public.invoices drop constraint if exists invoices_accounting_status_check;
alter table public.invoices add constraint invoices_accounting_status_check
  check (accounting_status in ('pending_mapping','validated','posted','blocked'));

alter table public.accounting_mappings
  add constraint accounting_mappings_target_account_org_fkey
    foreign key (target_account_id, organization_id) references public.accounts(id, organization_id) on delete restrict,
  add constraint accounting_mappings_counterparty_account_org_fkey
    foreign key (counterparty_account_id, organization_id) references public.accounts(id, organization_id) on delete restrict,
  add constraint accounting_mappings_vat_account_org_fkey
    foreign key (vat_account_id, organization_id) references public.accounts(id, organization_id) on delete restrict,
  add constraint accounting_mappings_journal_org_fkey
    foreign key (journal_id, organization_id) references public.journals(id, organization_id) on delete restrict;

alter table public.invoices
  add constraint invoices_mapping_org_fkey
    foreign key (accounting_mapping_id, organization_id) references public.accounting_mappings(id, organization_id) on delete restrict,
  add constraint invoices_journal_entry_org_fkey
    foreign key (journal_entry_id, organization_id) references public.journal_entries(id, organization_id) on delete restrict,
  add constraint invoices_accounting_validator_fkey
    foreign key (accounting_validated_by) references auth.users(id) on delete restrict;

create index if not exists accounting_mappings_org_category_idx
  on public.accounting_mappings (organization_id, invoice_category, third_party_id);
create index if not exists invoices_org_accounting_status_idx
  on public.invoices (organization_id, accounting_status, invoice_date desc);

drop view if exists public.dashboard_v;
drop view if exists public.vat_summary_v;
drop view if exists public.financial_statement_v;
drop view if exists public.trial_balance_v;
drop view if exists public.general_ledger_v;

create view public.general_ledger_v with (security_invoker = true) as
select e.organization_id,e.id entry_id,e.entry_number,e.entry_date,e.reference,e.description entry_description,
  e.journal_id,j.code journal_code,l.id line_id,l.account_id,a.account_number,a.label account_label,
  a.class account_class,a.reporting_category,
  l.third_party_id,l.description line_description,l.debit,l.credit,e.posted_at
from public.journal_entries e
join public.journals j on j.id=e.journal_id
join public.journal_lines l on l.entry_id=e.id
join public.accounts a on a.id=l.account_id
where e.status = 'posted';

create view public.trial_balance_v with (security_invoker = true) as
select l.organization_id,l.account_id,a.account_number,a.label,a.class,a.reporting_category,
  sum(l.debit)::numeric(18,3) total_debit,sum(l.credit)::numeric(18,3) total_credit,
  (sum(l.debit)-sum(l.credit))::numeric(18,3) balance
from public.journal_lines l join public.journal_entries e on e.id=l.entry_id
join public.accounts a on a.id=l.account_id
where e.status = 'posted' group by l.organization_id,l.account_id,a.account_number,a.label,a.class,a.reporting_category;

create view public.financial_statement_v with (security_invoker = true) as
select organization_id,
  case when class between 1 and 5 then 'balance_sheet' when class=6 then 'expense' when class=7 then 'revenue' else 'other' end statement,
  coalesce(reporting_category,'unmapped') reporting_category,
  sum(total_debit)::numeric(18,3) total_debit,sum(total_credit)::numeric(18,3) total_credit,
  sum(balance)::numeric(18,3) balance
from public.trial_balance_v group by organization_id,
  case when class between 1 and 5 then 'balance_sheet' when class=6 then 'expense' when class=7 then 'revenue' else 'other' end,
  coalesce(reporting_category,'unmapped');

create view public.vat_summary_v with (security_invoker = true) as
select i.organization_id,date_trunc('month',i.invoice_date)::date period_month,i.kind,
  tl.tax_rate,tl.tax_type,
  sum(tl.taxable_base)::numeric(18,3) taxable_base,
  sum(tl.tax_amount)::numeric(18,3) tax_amount,
  count(distinct i.id)::bigint invoice_count
from public.invoice_tax_lines tl
join public.invoices i on i.id=tl.invoice_id and i.organization_id=tl.organization_id
join public.journal_lines jl on jl.tax_line_id=tl.id and jl.organization_id=tl.organization_id
join public.journal_entries je on je.id=jl.entry_id and je.organization_id=tl.organization_id and je.status='posted'
where i.status in ('confirmed','paid')
group by i.organization_id,date_trunc('month',i.invoice_date)::date,i.kind,tl.tax_rate,tl.tax_type;

create view public.dashboard_v with (security_invoker=true) as
with posted as (
  select e.organization_id,
    count(distinct e.id)::bigint posted_entry_count,
    coalesce(sum(case when a.class=7 then l.credit-l.debit else 0 end),0)::numeric(18,3) income_ttc,
    coalesce(sum(case when a.class=6 then l.debit-l.credit else 0 end),0)::numeric(18,3) expense_ttc
  from public.journal_entries e
  join public.journal_lines l on l.entry_id=e.id
  join public.accounts a on a.id=l.account_id
  where e.status='posted'
  group by e.organization_id
), invoices_posted as (
  select organization_id,count(*)::bigint invoice_count
  from public.invoices
  where accounting_status='posted'
  group by organization_id
), vat as (
  select i.organization_id,
    coalesce(sum(case when i.kind='income' then tl.tax_amount else 0 end),0)::numeric(18,3) vat_collected,
    coalesce(sum(case when i.kind='expense' then tl.tax_amount else 0 end),0)::numeric(18,3) vat_deductible
  from public.invoices i
  join public.invoice_tax_lines tl on tl.invoice_id=i.id and tl.organization_id=i.organization_id
  join public.journal_lines jl on jl.tax_line_id=tl.id and jl.organization_id=i.organization_id
  join public.journal_entries je on je.id=jl.entry_id and je.organization_id=i.organization_id and je.status='posted'
  group by i.organization_id
)
select o.id organization_id,
  coalesce(ip.invoice_count,0)::bigint invoice_count,
  coalesce(p.posted_entry_count,0)::bigint posted_entry_count,
  coalesce(p.income_ttc,0)::numeric(18,3) income_ttc,
  coalesce(p.expense_ttc,0)::numeric(18,3) expense_ttc,
  coalesce(v.vat_collected,0)::numeric(18,3) vat_collected,
  coalesce(v.vat_deductible,0)::numeric(18,3) vat_deductible,
  (coalesce(v.vat_collected,0)-coalesce(v.vat_deductible,0))::numeric(18,3) vat_to_pay
from public.organizations o
left join posted p on p.organization_id=o.id
left join invoices_posted ip on ip.organization_id=o.id
left join vat v on v.organization_id=o.id;

revoke all on public.dashboard_v,public.general_ledger_v,public.trial_balance_v,public.financial_statement_v,public.vat_summary_v from public,anon,authenticated;
grant select on public.dashboard_v,public.general_ledger_v,public.trial_balance_v,public.financial_statement_v,public.vat_summary_v to service_role;

create or replace function public.validate_invoice_accounting(
  p_organization_id uuid,p_invoice_id uuid,p_mapping_id uuid,p_actor_id uuid,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_invoice public.invoices%rowtype;
  v_mapping public.accounting_mappings%rowtype;
  v_journal public.journals%rowtype;
  v_entry public.journal_entries%rowtype;
  v_tax_line public.invoice_tax_lines%rowtype;
  v_tax_total numeric(18,3);
  v_base numeric(18,3);
  v_total numeric(18,3);
  v_entry_number text;
  v_expense boolean;
  v_credit_note boolean;
  v_debit_normal boolean;
begin
  if not exists (
    select 1 from public.organization_members m
    where m.organization_id=p_organization_id and m.user_id=p_actor_id
      and m.status='active' and m.role in ('owner','admin','accountant')
  ) then raise exception 'FORBIDDEN' using errcode='42501'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_invoice_id::text, 0));
  select * into v_invoice from public.invoices where id=p_invoice_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_invoice.accounting_status='posted' and v_invoice.journal_entry_id is not null then
    return jsonb_build_object('invoice',to_jsonb(v_invoice),'journalEntryId',v_invoice.journal_entry_id,'idempotent',true);
  end if;
  if v_invoice.status not in ('confirmed','paid') then raise exception 'INVOICE_NOT_CONFIRMED' using errcode='55000'; end if;

  select * into v_mapping from public.accounting_mappings
  where id=p_mapping_id and organization_id=p_organization_id for update;
  if not found then raise exception 'ACCOUNTING_MAPPING_REQUIRED' using errcode='P0001'; end if;
  if v_mapping.source<>'human' or v_mapping.last_confirmed_at is null
    then raise exception 'ACCOUNTING_MAPPING_REQUIRES_HUMAN_VALIDATION' using errcode='P0001'; end if;
  if v_mapping.third_party_id is not null and v_mapping.third_party_id<>v_invoice.third_party_id
    then raise exception 'MAPPING_MISMATCH' using errcode='P0001'; end if;
  if v_mapping.invoice_category is not null and v_mapping.invoice_category<>v_invoice.category
    then raise exception 'MAPPING_MISMATCH' using errcode='P0001'; end if;
  if v_mapping.journal_id is null or v_mapping.counterparty_account_id is null
    then raise exception 'ACCOUNTING_MAPPING_REQUIRED' using errcode='P0001'; end if;

  select * into v_journal from public.journals
  where id=v_mapping.journal_id and organization_id=p_organization_id and active for update;
  if not found then raise exception 'JOURNAL_REQUIRED' using errcode='P0001'; end if;
  if (v_invoice.kind='expense' and v_journal.type<>'purchases')
    or (v_invoice.kind='income' and v_journal.type<>'sales')
    then raise exception 'MAPPING_MISMATCH' using errcode='P0001'; end if;
  if not exists(select 1 from public.accounts a where a.id=v_mapping.target_account_id and a.organization_id=p_organization_id and a.is_active)
    or not exists(select 1 from public.accounts a where a.id=v_mapping.counterparty_account_id and a.organization_id=p_organization_id and a.is_active)
    then raise exception 'ACCOUNTING_MAPPING_REQUIRED' using errcode='P0001'; end if;

  select coalesce(sum(abs(tax_amount)),0)::numeric(18,3) into v_tax_total
  from public.invoice_tax_lines where invoice_id=v_invoice.id and organization_id=p_organization_id and tax_type='vat';
  v_base:=coalesce(abs(v_invoice.amount_ht),0)::numeric(18,3);
  v_total:=abs(v_invoice.amount_ttc)::numeric(18,3);
  if abs((v_base+v_tax_total)-v_total)>0.001
    then raise exception 'ACCOUNTING_MAPPING_REQUIRED' using errcode='P0001'; end if;
  if v_tax_total>0 and (v_mapping.vat_account_id is null or not exists(select 1 from public.accounts a where a.id=v_mapping.vat_account_id and a.organization_id=p_organization_id and a.is_active))
    then raise exception 'ACCOUNTING_MAPPING_REQUIRED' using errcode='P0001'; end if;

  select * into v_entry from public.journal_entries where organization_id=p_organization_id and source_type='invoice' and source_id=v_invoice.id and status<>'reversed' for update;
  if found then
    update public.invoices set accounting_mapping_id=v_mapping.id,journal_entry_id=v_entry.id,accounting_status='posted',accounting_validated_by=p_actor_id,accounting_validated_at=coalesce(accounting_validated_at,now()) where id=v_invoice.id;
    select * into v_invoice from public.invoices where id=v_invoice.id;
    return jsonb_build_object('invoice',to_jsonb(v_invoice),'journalEntryId',v_entry.id,'idempotent',true);
  end if;

  v_expense:=v_invoice.kind='expense';
  v_credit_note:=v_invoice.document_type='avoir';
  -- Debit-normal flow: ordinary expenses and income credit notes.
  -- Credit-normal flow: ordinary income and expense credit notes.
  v_debit_normal:=v_expense<>v_credit_note;
  v_entry_number:='INV-'||substr(replace(v_invoice.id::text,'-',''),1,20);
  insert into public.journal_entries(organization_id,journal_id,entry_number,entry_date,reference,description,source_type,source_id,status,created_by)
    values(p_organization_id,v_journal.id,v_entry_number,v_invoice.invoice_date,v_invoice.invoice_number,
      left('Facture '||v_invoice.invoice_number||' — '||v_invoice.supplier,500),'invoice',v_invoice.id,'draft',p_actor_id)
    returning * into v_entry;

  if v_debit_normal then
    insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,description,debit,credit)
      values(p_organization_id,v_entry.id,v_mapping.target_account_id,v_invoice.third_party_id,'Base facture',v_base,0);
    if v_tax_total>0 then
      for v_tax_line in select * from public.invoice_tax_lines where invoice_id=v_invoice.id and organization_id=p_organization_id and tax_type='vat' order by tax_rate nulls first loop
        insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,tax_line_id,description,debit,credit)
          values(p_organization_id,v_entry.id,v_mapping.vat_account_id,v_invoice.third_party_id,v_tax_line.id,'TVA facture',abs(v_tax_line.tax_amount),0);
      end loop;
    end if;
    insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,description,debit,credit)
      values(p_organization_id,v_entry.id,v_mapping.counterparty_account_id,v_invoice.third_party_id,'Contrepartie facture',0,v_total);
  else
    insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,description,debit,credit)
      values(p_organization_id,v_entry.id,v_mapping.counterparty_account_id,v_invoice.third_party_id,'Contrepartie avoir',v_total,0);
    if v_tax_total>0 then
      for v_tax_line in select * from public.invoice_tax_lines where invoice_id=v_invoice.id and organization_id=p_organization_id and tax_type='vat' order by tax_rate nulls first loop
        insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,tax_line_id,description,debit,credit)
          values(p_organization_id,v_entry.id,v_mapping.vat_account_id,v_invoice.third_party_id,v_tax_line.id,'TVA avoir',0,abs(v_tax_line.tax_amount));
      end loop;
    end if;
    insert into public.journal_lines(organization_id,entry_id,account_id,third_party_id,description,debit,credit)
      values(p_organization_id,v_entry.id,v_mapping.target_account_id,v_invoice.third_party_id,'Base avoir',0,v_base);
  end if;

  perform public.review_journal_entry(p_organization_id,v_entry.id,p_actor_id,p_request_id);
  perform public.post_journal_entry(p_organization_id,v_entry.id,p_actor_id,p_request_id);
  update public.invoices set accounting_mapping_id=v_mapping.id,journal_entry_id=v_entry.id,accounting_status='posted',accounting_validated_by=p_actor_id,accounting_validated_at=now() where id=v_invoice.id returning * into v_invoice;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'invoice.accounting_posted','invoice',v_invoice.id,p_request_id,jsonb_build_object('mapping_id',v_mapping.id,'journal_entry_id',v_entry.id));
  return jsonb_build_object('invoice',to_jsonb(v_invoice),'journalEntryId',v_entry.id,'idempotent',false);
end;
$$;

revoke all on function public.validate_invoice_accounting(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.validate_invoice_accounting(uuid,uuid,uuid,uuid,text) to service_role;
