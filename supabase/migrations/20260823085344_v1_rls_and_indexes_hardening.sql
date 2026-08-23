-- Advisor-driven RLS and foreign-key index hardening.

create or replace function private.has_org_role(p_organization_id uuid, p_roles text[])
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false) is false
    and exists (
      select 1 from public.organization_members m
      where m.organization_id = p_organization_id
        and m.user_id = (select auth.uid())
        and m.status = 'active'
        and m.role = any(p_roles)
    );
$$;

create or replace function private.is_non_anonymous_user()
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false) is false;
$$;
revoke all on function private.is_non_anonymous_user() from public,anon;
grant execute on function private.is_non_anonymous_user() to authenticated;

drop policy if exists organization_members_admin_write on public.organization_members;
drop policy if exists organization_members_admin_insert on public.organization_members;
drop policy if exists organization_members_admin_update on public.organization_members;
drop policy if exists organization_members_admin_delete on public.organization_members;
create policy organization_members_admin_insert on public.organization_members for insert to authenticated
  with check (private.has_org_role(organization_id,array['owner','admin']));
create policy organization_members_admin_update on public.organization_members for update to authenticated
  using (private.has_org_role(organization_id,array['owner','admin'])) with check (private.has_org_role(organization_id,array['owner','admin']));
create policy organization_members_admin_delete on public.organization_members for delete to authenticated
  using (private.has_org_role(organization_id,array['owner','admin']));

do $$
declare t text;
begin
  foreach t in array array[
    'ocr_results','third_parties','accounts','journals','fiscal_periods','invoices','invoice_tax_lines',
    'journal_entries','journal_lines','accounting_mappings','bank_accounts','payments','payment_allocations',
    'bank_transactions','reconciliation_matches','vat_periods','vat_report_lines','automation_events','webhook_deliveries'
  ] loop
    execute format('drop policy if exists %I_accounting_write on public.%I',t,t);
    execute format('drop policy if exists %I_accounting_insert on public.%I',t,t);
    execute format('drop policy if exists %I_accounting_update on public.%I',t,t);
    execute format('drop policy if exists %I_accounting_delete on public.%I',t,t);
    execute format('create policy %I_accounting_insert on public.%I for insert to authenticated with check (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'']))',t,t);
    execute format('create policy %I_accounting_update on public.%I for update to authenticated using (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant''])) with check (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'']))',t,t);
    execute format('create policy %I_accounting_delete on public.%I for delete to authenticated using (private.has_org_role(organization_id,array[''owner'',''admin'',''accountant'']))',t,t);
  end loop;
end;
$$;

drop policy if exists documents_accounting_write on public.documents;
drop policy if exists documents_employee_insert on public.documents;
drop policy if exists documents_member_insert on public.documents;
drop policy if exists documents_accounting_update on public.documents;
drop policy if exists documents_accounting_delete on public.documents;
create policy documents_member_insert on public.documents for insert to authenticated
  with check (uploader_id=(select auth.uid()) and private.has_org_role(organization_id,array['owner','admin','accountant','employee']));
create policy documents_accounting_update on public.documents for update to authenticated
  using (private.has_org_role(organization_id,array['owner','admin','accountant'])) with check (private.has_org_role(organization_id,array['owner','admin','accountant']));
create policy documents_accounting_delete on public.documents for delete to authenticated
  using (private.has_org_role(organization_id,array['owner','admin','accountant']));

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select to authenticated
  using (private.is_non_anonymous_user() and id=(select auth.uid()));
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (private.is_non_anonymous_user() and id=(select auth.uid())) with check (private.is_non_anonymous_user() and id=(select auth.uid()));
drop policy if exists app_state_self_select on public.app_state;
create policy app_state_self_select on public.app_state for select to authenticated
  using (private.is_non_anonymous_user() and user_id=(select auth.uid()));
drop policy if exists app_state_self_update on public.app_state;
create policy app_state_self_update on public.app_state for update to authenticated
  using (private.is_non_anonymous_user() and user_id=(select auth.uid())) with check (private.is_non_anonymous_user() and user_id=(select auth.uid()));
drop policy if exists subscriptions_self_select on public.subscriptions;
create policy subscriptions_self_select on public.subscriptions for select to authenticated
  using (private.is_non_anonymous_user() and user_id=(select auth.uid()));
drop policy if exists notifications_recipient_select on public.notifications;
create policy notifications_recipient_select on public.notifications for select to authenticated
  using (private.is_non_anonymous_user() and user_id=(select auth.uid()) and private.has_org_role(organization_id,array['owner','admin','accountant','employee','viewer']));
drop policy if exists notifications_recipient_update on public.notifications;
create policy notifications_recipient_update on public.notifications for update to authenticated
  using (private.is_non_anonymous_user() and user_id=(select auth.uid())) with check (private.is_non_anonymous_user() and user_id=(select auth.uid()));

create index if not exists accounting_mappings_created_by_idx on public.accounting_mappings(created_by);
create index if not exists accounting_mappings_org_idx on public.accounting_mappings(organization_id);
create index if not exists accounting_mappings_target_account_idx on public.accounting_mappings(target_account_id);
create index if not exists accounting_mappings_third_party_idx on public.accounting_mappings(third_party_id);
create index if not exists accounting_mappings_vat_account_idx on public.accounting_mappings(vat_account_id);
create index if not exists accounts_parent_idx on public.accounts(parent_id);
create index if not exists audit_events_actor_idx on public.audit_events(actor_id);
create index if not exists bank_accounts_accounting_account_idx on public.bank_accounts(accounting_account_id);
create index if not exists bank_accounts_org_idx on public.bank_accounts(organization_id);
create index if not exists bank_transactions_bank_account_idx on public.bank_transactions(bank_account_id);
create index if not exists documents_uploader_idx on public.documents(uploader_id);
create index if not exists invoices_document_record_idx on public.invoices(document_record_id);
create index if not exists invoices_third_party_idx on public.invoices(third_party_id);
create index if not exists invoices_validated_by_idx on public.invoices(validated_by);
create index if not exists journal_entries_created_by_idx on public.journal_entries(created_by);
create index if not exists journal_entries_journal_idx on public.journal_entries(journal_id);
create index if not exists journal_entries_posted_by_idx on public.journal_entries(posted_by);
create index if not exists journal_entries_reviewed_by_idx on public.journal_entries(reviewed_by);
create index if not exists journal_lines_account_idx on public.journal_lines(account_id);
create index if not exists journal_lines_tax_line_idx on public.journal_lines(tax_line_id);
create index if not exists journal_lines_third_party_idx on public.journal_lines(third_party_id);
create index if not exists notifications_org_idx on public.notifications(organization_id);
create index if not exists ocr_results_org_idx on public.ocr_results(organization_id);
create index if not exists payment_allocations_invoice_idx on public.payment_allocations(invoice_id);
create index if not exists payment_allocations_org_idx on public.payment_allocations(organization_id);
create index if not exists payments_bank_account_idx on public.payments(bank_account_id);
create index if not exists payments_created_by_idx on public.payments(created_by);
create index if not exists payments_invoice_idx on public.payments(invoice_id);
create index if not exists payments_journal_entry_idx on public.payments(journal_entry_id);
create index if not exists payments_third_party_idx on public.payments(third_party_id);
create index if not exists reconciliation_confirmed_by_idx on public.reconciliation_matches(confirmed_by);
create index if not exists reconciliation_journal_entry_idx on public.reconciliation_matches(journal_entry_id);
create index if not exists reconciliation_org_idx on public.reconciliation_matches(organization_id);
create index if not exists reconciliation_payment_idx on public.reconciliation_matches(payment_id);
create index if not exists third_parties_default_account_idx on public.third_parties(default_account_id);
create index if not exists vat_report_lines_invoice_tax_idx on public.vat_report_lines(invoice_tax_line_id);
create index if not exists vat_report_lines_org_idx on public.vat_report_lines(organization_id);
create index if not exists vat_report_lines_period_idx on public.vat_report_lines(vat_period_id);
create index if not exists webhook_deliveries_org_idx on public.webhook_deliveries(organization_id);
