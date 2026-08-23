-- Prevent multiple and concurrent payments from over-allocating one invoice.
create or replace function private.assert_payment_allocations(p_payment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_amount numeric(18,3); v_allocated numeric(18,3); v_invoice_id uuid;
begin
  select amount into v_amount from public.payments where id = p_payment_id;
  select coalesce(sum(allocated_amount),0) into v_allocated
    from public.payment_allocations where payment_id = p_payment_id;
  if v_allocated > v_amount then
    raise exception 'PAYMENT_OVERALLOCATED' using errcode = '23514';
  end if;

  for v_invoice_id in
    select distinct invoice_id from public.payment_allocations
    where payment_id = p_payment_id order by invoice_id
  loop
    perform pg_advisory_xact_lock(hashtextextended(v_invoice_id::text, 0));
  end loop;

  if exists (
    select 1
    from public.payment_allocations current_allocation
    join public.payment_allocations a on a.invoice_id = current_allocation.invoice_id
    join public.payments p on p.id = a.payment_id and p.status not in ('reversed','cancelled')
    join public.invoices i on i.id = a.invoice_id
    where current_allocation.payment_id = p_payment_id
    group by a.invoice_id, i.amount_ttc
    having sum(a.allocated_amount) > abs(i.amount_ttc)
  ) then
    raise exception 'INVOICE_OVERALLOCATED' using errcode = '23514';
  end if;
end;
$$;

revoke all on function private.assert_payment_allocations(uuid) from public, anon, authenticated;
