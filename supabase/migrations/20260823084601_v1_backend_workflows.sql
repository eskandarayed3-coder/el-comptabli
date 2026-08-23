-- Transactional workflow transitions and tamper-evident master-data audit.

create or replace function private.audit_reference_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.audit_events(organization_id,event_type,entity_type,entity_id,safe_metadata)
  values(
    (v_row->>'organization_id')::uuid,
    lower(tg_table_name) || '.' || lower(tg_op),
    tg_table_name,
    (v_row->>'id')::uuid,
    jsonb_build_object('operation',lower(tg_op))
  );
  return coalesce(new, old);
end;
$$;
revoke all on function private.audit_reference_change() from public,anon,authenticated;

do $$
declare v_table text;
begin
  foreach v_table in array array['third_parties','accounts','journals','bank_accounts','fiscal_periods','vat_periods'] loop
    execute format('drop trigger if exists %I on public.%I',v_table || '_audit_change',v_table);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.audit_reference_change()',v_table || '_audit_change',v_table);
  end loop;
end;
$$;

create or replace function public.review_journal_entry(
  p_organization_id uuid,p_entry_id uuid,p_actor_id uuid,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_entry public.journal_entries%rowtype; v_count integer; v_debit numeric(18,3); v_credit numeric(18,3);
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_entry from public.journal_entries where id=p_entry_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_entry.status='review' then return jsonb_build_object('entry',to_jsonb(v_entry),'idempotent',true); end if;
  if v_entry.status<>'draft' then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  select count(*),coalesce(sum(debit),0),coalesce(sum(credit),0) into v_count,v_debit,v_credit
    from public.journal_lines where entry_id=p_entry_id;
  if v_count<2 or v_debit<=0 or v_credit<=0 or v_debit<>v_credit
    then raise exception 'UNBALANCED_ENTRY' using errcode='P0001'; end if;
  update public.journal_entries set status='review',reviewed_by=p_actor_id,updated_at=now() where id=p_entry_id returning * into v_entry;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'journal.reviewed','journal_entry',p_entry_id,p_request_id,jsonb_build_object('debit',v_debit,'credit',v_credit));
  return jsonb_build_object('entry',to_jsonb(v_entry),'idempotent',false);
end;
$$;

create or replace function public.reject_reconciliation(
  p_organization_id uuid,p_match_id uuid,p_actor_id uuid,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_match public.reconciliation_matches%rowtype;
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_match from public.reconciliation_matches where id=p_match_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_match.status='rejected' then return jsonb_build_object('match',to_jsonb(v_match),'idempotent',true); end if;
  if v_match.status<>'suggested' then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  update public.reconciliation_matches set status='rejected' where id=p_match_id returning * into v_match;
  update public.bank_transactions set status='unmatched' where id=v_match.bank_transaction_id and status='suggested';
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'reconciliation.rejected','reconciliation_match',p_match_id,p_request_id,'{}');
  return jsonb_build_object('match',to_jsonb(v_match),'idempotent',false);
end;
$$;

create or replace function public.reverse_payment(
  p_organization_id uuid,p_payment_id uuid,p_actor_id uuid,p_reversal_entry_number text default null,
  p_reversal_date date default null,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_payment public.payments%rowtype; v_reversal jsonb;
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_payment from public.payments where id=p_payment_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_payment.status='reversed' then return jsonb_build_object('payment',to_jsonb(v_payment),'idempotent',true); end if;
  if v_payment.status<>'posted' then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  if v_payment.journal_entry_id is not null then
    if nullif(btrim(p_reversal_entry_number),'') is null or p_reversal_date is null then
      raise exception 'REVERSAL_ENTRY_REQUIRED' using errcode='22023';
    end if;
    v_reversal:=public.reverse_journal_entry(p_organization_id,v_payment.journal_entry_id,p_actor_id,left(btrim(p_reversal_entry_number),80),p_reversal_date,p_request_id);
  end if;
  update public.payments set status='reversed',updated_at=now() where id=p_payment_id returning * into v_payment;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'payment.reversed','payment',p_payment_id,p_request_id,jsonb_build_object('journal_reversal',v_reversal));
  return jsonb_build_object('payment',to_jsonb(v_payment),'reversal',v_reversal,'idempotent',false);
end;
$$;

create or replace function public.update_invoice_review(
  p_organization_id uuid,p_invoice_id uuid,p_actor_id uuid,p_changes jsonb,p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_invoice public.invoices%rowtype;
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin','accountant'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  select * into v_invoice from public.invoices where id=p_invoice_id and organization_id=p_organization_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if v_invoice.status not in ('uploaded','processing','review_required','draft','failed') then raise exception 'INVALID_STATE' using errcode='55000'; end if;
  update public.invoices set
    supplier=case when p_changes?'supplier' then left(btrim(p_changes->>'supplier'),200) else supplier end,
    supplier_tax_id=case when p_changes?'supplierTaxId' then left(btrim(p_changes->>'supplierTaxId'),40) else supplier_tax_id end,
    invoice_number=case when p_changes?'invoiceNumber' then left(btrim(p_changes->>'invoiceNumber'),120) else invoice_number end,
    invoice_date=case when p_changes?'invoiceDate' then (p_changes->>'invoiceDate')::date else invoice_date end,
    due_date=case when p_changes?'dueDate' then nullif(p_changes->>'dueDate','')::date else due_date end,
    amount_ht=case when p_changes?'amountHt' then nullif(p_changes->>'amountHt','')::numeric else amount_ht end,
    vat_amount=case when p_changes?'vatAmount' then nullif(p_changes->>'vatAmount','')::numeric else vat_amount end,
    amount_ttc=case when p_changes?'amountTtc' then (p_changes->>'amountTtc')::numeric else amount_ttc end,
    discount=case when p_changes?'discount' then (p_changes->>'discount')::numeric else discount end,
    stamp_duty=case when p_changes?'stampDuty' then (p_changes->>'stampDuty')::numeric else stamp_duty end,
    withholding_tax=case when p_changes?'withholdingTax' then (p_changes->>'withholdingTax')::numeric else withholding_tax end,
    category=case when p_changes?'category' then left(btrim(p_changes->>'category'),80) else category end,
    status='review_required',validated_fields=validated_fields || p_changes,updated_at=now()
  where id=p_invoice_id returning * into v_invoice;
  if btrim(v_invoice.supplier)='' or btrim(v_invoice.invoice_number)='' then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'invoice.review_updated','invoice',p_invoice_id,p_request_id,jsonb_build_object('fields',coalesce((select jsonb_agg(key) from jsonb_object_keys(p_changes) as keys(key)),'[]'::jsonb)));
  return jsonb_build_object('invoice',to_jsonb(v_invoice));
end;
$$;

create or replace function public.set_organization_member(
  p_organization_id uuid,p_actor_id uuid,p_user_id uuid,p_role text,p_status text default 'active',p_request_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_members%rowtype;
begin
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id=p_actor_id and m.status='active' and m.role in ('owner','admin'))
    then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_role not in ('owner','admin','accountant','employee','viewer') or p_status not in ('invited','active','suspended','removed')
    then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  if not exists(select 1 from auth.users u where u.id=p_user_id) then raise exception 'NOT_FOUND' using errcode='P0002'; end if;
  if p_user_id=p_actor_id and p_status<>'active' and not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.user_id<>p_actor_id and m.status='active' and m.role='owner')
    then raise exception 'LAST_OWNER_REQUIRED' using errcode='55000'; end if;
  insert into public.organization_members(organization_id,user_id,role,status,invited_at,joined_at)
    values(p_organization_id,p_user_id,p_role,p_status,case when p_status='invited' then now() end,case when p_status='active' then now() end)
  on conflict(organization_id,user_id) do update set role=excluded.role,status=excluded.status,
    joined_at=case when excluded.status='active' then coalesce(public.organization_members.joined_at,now()) else public.organization_members.joined_at end,
    updated_at=now() returning * into v_member;
  if not exists(select 1 from public.organization_members m where m.organization_id=p_organization_id and m.status='active' and m.role='owner')
    then raise exception 'LAST_OWNER_REQUIRED' using errcode='55000'; end if;
  insert into public.audit_events(organization_id,actor_id,event_type,entity_type,entity_id,request_id,safe_metadata)
    values(p_organization_id,p_actor_id,'organization.member_changed','organization_member',p_user_id,p_request_id,jsonb_build_object('role',p_role,'status',p_status));
  return jsonb_build_object('member',to_jsonb(v_member));
end;
$$;

revoke all on function
  public.review_journal_entry(uuid,uuid,uuid,text),
  public.reject_reconciliation(uuid,uuid,uuid,text),
  public.reverse_payment(uuid,uuid,uuid,text,date,text),
  public.update_invoice_review(uuid,uuid,uuid,jsonb,text),
  public.set_organization_member(uuid,uuid,uuid,text,text,text)
from public,anon,authenticated;
grant execute on function
  public.review_journal_entry(uuid,uuid,uuid,text),
  public.reject_reconciliation(uuid,uuid,uuid,text),
  public.reverse_payment(uuid,uuid,uuid,text,date,text),
  public.update_invoice_review(uuid,uuid,uuid,jsonb,text),
  public.set_organization_member(uuid,uuid,uuid,text,text,text)
to service_role;
