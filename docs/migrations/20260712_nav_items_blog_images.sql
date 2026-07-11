-- Nav items (editable navbar) + blog-images storage bucket
-- Run in Supabase SQL editor.

-- ============ NAV ITEMS ============
create table if not exists public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nav_items_sort_idx on public.nav_items(sort_order);

grant select on public.nav_items to anon;
grant select, insert, update, delete on public.nav_items to authenticated;
grant all on public.nav_items to service_role;

alter table public.nav_items enable row level security;

drop policy if exists "nav_items_public_read" on public.nav_items;
create policy "nav_items_public_read"
  on public.nav_items for select
  to anon, authenticated
  using (is_visible = true);

drop policy if exists "nav_items_admin_all" on public.nav_items;
create policy "nav_items_admin_all"
  on public.nav_items for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Seed default items (only if table empty)
insert into public.nav_items (label, url, sort_order)
select * from (values
  ('Home', '/', 10),
  ('Bedsheets', '/bedsheets', 20),
  ('Men Shirts', '/men-shirts', 30),
  ('Nighty', '/nighty', 40),
  ('All Products', '/products', 50),
  ('About', '/about', 60),
  ('Contact', '/contact', 70)
) as v(label, url, sort_order)
where not exists (select 1 from public.nav_items);

-- ============ BLOG IMAGES BUCKET ============
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "blog_images_public_read" on storage.objects;
create policy "blog_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

drop policy if exists "blog_images_admin_write" on storage.objects;
create policy "blog_images_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "blog_images_admin_update" on storage.objects;
create policy "blog_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "blog_images_admin_delete" on storage.objects;
create policy "blog_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.has_role(auth.uid(), 'admin'));
