drop policy if exists app_state_self_select on private.app_state_legacy_backup;
drop policy if exists app_state_self_update on private.app_state_legacy_backup;

create index if not exists activity_events_actor_idx on public.activity_events(actor_id) where actor_id is not null;
create index if not exists ai_reports_org_idx on public.ai_reports(organization_id);
create index if not exists calculation_history_org_idx on public.calculation_history(organization_id);
create index if not exists chat_sessions_org_idx on public.chat_sessions(organization_id);
create index if not exists financial_transactions_created_by_idx on public.financial_transactions(created_by);
create index if not exists user_tasks_org_idx on public.user_tasks(organization_id);
