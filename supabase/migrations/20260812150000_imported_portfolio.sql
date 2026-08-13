alter table public.leads
  add column if not exists external_source text,
  add column if not exists external_key text,
  add column if not exists segment text not null default 'nao_identificado',
  add column if not exists portfolio_category text not null default 'manual',
  add column if not exists priority text not null default 'normal',
  add column if not exists temperature text not null default 'morno',
  add column if not exists person_type text,
  add column if not exists document_masked text,
  add column if not exists document_hash text,
  add column if not exists last_contact_at timestamptz,
  add column if not exists needs_requalification boolean not null default false,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists leads_external_identity_uidx
  on public.leads (user_id, external_source, external_key)
  where external_source is not null and external_key is not null;

create index if not exists leads_user_portfolio_category_idx
  on public.leads (user_id, portfolio_category);

create index if not exists leads_user_segment_idx
  on public.leads (user_id, segment);

create index if not exists leads_user_priority_idx
  on public.leads (user_id, priority, last_contact_at desc);

create table if not exists public.legacy_crm_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  external_source text not null,
  external_id text not null,
  event_type text,
  status_original text,
  origin_original text,
  portfolio_category text not null default 'reativar_carteira',
  loss_reason text not null default 'nao_informado',
  included_at timestamptz,
  concluded_at timestamptz,
  last_contact_at timestamptz,
  summary text,
  next_action text,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, external_source, external_id)
);

create index if not exists legacy_crm_events_user_lead_idx
  on public.legacy_crm_events (user_id, lead_id, last_contact_at desc);

create index if not exists legacy_crm_events_lead_id_idx
  on public.legacy_crm_events (lead_id);

create index if not exists legacy_crm_events_user_category_idx
  on public.legacy_crm_events (user_id, portfolio_category);

alter table public.legacy_crm_events enable row level security;

revoke all on table public.legacy_crm_events from anon;
grant select, insert, update, delete on table public.legacy_crm_events to authenticated;

drop policy if exists legacy_crm_events_select_own on public.legacy_crm_events;
create policy legacy_crm_events_select_own
  on public.legacy_crm_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists legacy_crm_events_insert_own on public.legacy_crm_events;
create policy legacy_crm_events_insert_own
  on public.legacy_crm_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists legacy_crm_events_update_own on public.legacy_crm_events;
create policy legacy_crm_events_update_own
  on public.legacy_crm_events for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists legacy_crm_events_delete_own on public.legacy_crm_events;
create policy legacy_crm_events_delete_own
  on public.legacy_crm_events for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.profiles from anon;
revoke all on table public.customers from anon;
revoke all on table public.leads from anon;
revoke all on table public.contact_interactions from anon;
revoke all on table public.follow_up_tasks from anon;
revoke all on table public.sales_proposals from anon;
revoke all on table public.sales_documents from anon;
