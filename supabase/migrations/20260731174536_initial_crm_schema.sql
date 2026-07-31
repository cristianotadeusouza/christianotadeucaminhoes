create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  company_name text,
  phone text,
  email text,
  source text,
  status text not null default 'new',
  truck_interest text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  company_name text,
  phone text,
  email text,
  city text,
  state text,
  status text not null default 'prospect',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  model text,
  model_year integer,
  price numeric,
  status text not null default 'available',
  is_public boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'pending',
  priority text not null default 'normal',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  channel text not null default 'whatsapp',
  interaction_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  constraint interaction_target check (customer_id is not null or lead_id is not null)
);

create index leads_user_id_idx on public.leads(user_id);
create index customers_user_id_idx on public.customers(user_id);
create index inventory_items_user_id_idx on public.inventory_items(user_id);
create index follow_up_tasks_user_id_idx on public.follow_up_tasks(user_id);
create index follow_up_tasks_due_at_idx on public.follow_up_tasks(due_at);
create index contact_interactions_user_id_idx on public.contact_interactions(user_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

create trigger follow_up_tasks_set_updated_at
before update on public.follow_up_tasks
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.contact_interactions enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy leads_select_own on public.leads
for select to authenticated using ((select auth.uid()) = user_id);
create policy leads_insert_own on public.leads
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy leads_update_own on public.leads
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy leads_delete_own on public.leads
for delete to authenticated using ((select auth.uid()) = user_id);

create policy customers_select_own on public.customers
for select to authenticated using ((select auth.uid()) = user_id);
create policy customers_insert_own on public.customers
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy customers_update_own on public.customers
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy customers_delete_own on public.customers
for delete to authenticated using ((select auth.uid()) = user_id);

create policy inventory_public_read on public.inventory_items
for select to anon using (is_public = true);
create policy inventory_select_own_or_public on public.inventory_items
for select to authenticated using ((select auth.uid()) = user_id or is_public = true);
create policy inventory_insert_own on public.inventory_items
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy inventory_update_own on public.inventory_items
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy inventory_delete_own on public.inventory_items
for delete to authenticated using ((select auth.uid()) = user_id);

create policy tasks_select_own on public.follow_up_tasks
for select to authenticated using ((select auth.uid()) = user_id);
create policy tasks_insert_own on public.follow_up_tasks
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy tasks_update_own on public.follow_up_tasks
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy tasks_delete_own on public.follow_up_tasks
for delete to authenticated using ((select auth.uid()) = user_id);

create policy interactions_select_own on public.contact_interactions
for select to authenticated using ((select auth.uid()) = user_id);
create policy interactions_insert_own on public.contact_interactions
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy interactions_update_own on public.contact_interactions
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy interactions_delete_own on public.contact_interactions
for delete to authenticated using ((select auth.uid()) = user_id);
