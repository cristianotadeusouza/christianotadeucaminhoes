alter table public.contact_interactions
add column metadata jsonb not null default '{}'::jsonb;

create table public.sales_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  title text not null,
  model text,
  amount numeric,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'enviada', 'revisao', 'aprovada', 'perdida', 'expirada')),
  valid_until date,
  conditions text,
  notes text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sales_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  proposal_id uuid references public.sales_proposals(id) on delete set null,
  name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  category text not null default 'outro'
    check (category in ('proposta', 'foto_visita', 'documento', 'outro')),
  created_at timestamptz not null default now()
);

create index sales_proposals_user_status_idx
  on public.sales_proposals(user_id, status);
create index sales_proposals_lead_updated_idx
  on public.sales_proposals(lead_id, updated_at desc);
create index sales_proposals_valid_until_idx
  on public.sales_proposals(valid_until)
  where valid_until is not null;
create index sales_documents_user_created_idx
  on public.sales_documents(user_id, created_at desc);
create index sales_documents_lead_idx
  on public.sales_documents(lead_id)
  where lead_id is not null;

alter table public.sales_proposals enable row level security;
alter table public.sales_documents enable row level security;

create policy sales_proposals_select_own on public.sales_proposals
for select to authenticated using ((select auth.uid()) = user_id);
create policy sales_proposals_insert_own on public.sales_proposals
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy sales_proposals_update_own on public.sales_proposals
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy sales_proposals_delete_own on public.sales_proposals
for delete to authenticated using ((select auth.uid()) = user_id);

create policy sales_documents_select_own on public.sales_documents
for select to authenticated using ((select auth.uid()) = user_id);
create policy sales_documents_insert_own on public.sales_documents
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy sales_documents_update_own on public.sales_documents
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy sales_documents_delete_own on public.sales_documents
for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.sales_proposals to authenticated;
grant select, insert, update, delete on public.sales_documents to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'sales-private',
  'sales-private',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy sales_private_select_own on storage.objects
for select to authenticated
using (
  bucket_id = 'sales-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy sales_private_insert_own on storage.objects
for insert to authenticated
with check (
  bucket_id = 'sales-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy sales_private_update_own on storage.objects
for update to authenticated
using (
  bucket_id = 'sales-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'sales-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy sales_private_delete_own on storage.objects
for delete to authenticated
using (
  bucket_id = 'sales-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
