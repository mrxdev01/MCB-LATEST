-- =====================================================================
-- MEENU COLLECTION — Tags, Bestseller ordering, Realtime for tags
-- Copy-paste into Supabase → SQL Editor → Run. Safe to run once.
-- =====================================================================

-- 1) Bestseller manual ordering
alter table public.products
  add column if not exists bestseller_rank int;

create index if not exists products_bestseller_idx
  on public.products (is_bestseller, bestseller_rank)
  where is_bestseller = true;

-- 2) Custom coloured tags
create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  color      text not null default '#d5527a',
  text_color text not null default '#ffffff',
  scope      text not null default 'all' check (scope in ('product','collection','category','all')),
  sort_order int  not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;
grant all on public.tags to service_role;

alter table public.tags enable row level security;
drop policy if exists "tags read all"   on public.tags;
create policy "tags read all"   on public.tags for select using (true);
drop policy if exists "tags write admin" on public.tags;
create policy "tags write admin" on public.tags for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- 3) product_tags pivot
create table if not exists public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id     uuid not null references public.tags(id)     on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

grant select on public.product_tags to anon, authenticated;
grant insert, update, delete on public.product_tags to authenticated;
grant all on public.product_tags to service_role;

alter table public.product_tags enable row level security;
drop policy if exists "product_tags read all"   on public.product_tags;
create policy "product_tags read all"   on public.product_tags for select using (true);
drop policy if exists "product_tags write admin" on public.product_tags;
create policy "product_tags write admin" on public.product_tags for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- 4) collection_tags pivot
create table if not exists public.collection_tags (
  collection_id uuid not null references public.collections(id) on delete cascade,
  tag_id        uuid not null references public.tags(id)        on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (collection_id, tag_id)
);

grant select on public.collection_tags to anon, authenticated;
grant insert, update, delete on public.collection_tags to authenticated;
grant all on public.collection_tags to service_role;

alter table public.collection_tags enable row level security;
drop policy if exists "collection_tags read all"   on public.collection_tags;
create policy "collection_tags read all"   on public.collection_tags for select using (true);
drop policy if exists "collection_tags write admin" on public.collection_tags;
create policy "collection_tags write admin" on public.collection_tags for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- 5) Realtime — instant updates on storefront
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.tags';            exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.product_tags';    exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table public.collection_tags'; exception when duplicate_object then null; end;
end $$;
