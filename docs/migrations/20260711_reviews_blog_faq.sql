-- Reviews & Blog for MEENU COLLECTION
-- Run in Supabase SQL editor once.

-- ============ PRODUCT REVIEWS ============
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  rating smallint not null check (rating between 1 and 5),
  title text,
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);
create index if not exists product_reviews_approved_idx on public.product_reviews(approved);

grant select, insert on public.product_reviews to anon;
grant select, insert, update, delete on public.product_reviews to authenticated;
grant all on public.product_reviews to service_role;

alter table public.product_reviews enable row level security;

drop policy if exists "reviews_public_read_approved" on public.product_reviews;
create policy "reviews_public_read_approved"
  on public.product_reviews for select
  to anon, authenticated
  using (approved = true);

drop policy if exists "reviews_public_insert" on public.product_reviews;
create policy "reviews_public_insert"
  on public.product_reviews for insert
  to anon, authenticated
  with check (approved = false);  -- new reviews always start unapproved

drop policy if exists "reviews_admin_all" on public.product_reviews;
create policy "reviews_admin_all"
  on public.product_reviews for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============ BLOG POSTS ============
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,           -- markdown / plain text
  cover_image text,
  author text default 'MEENU COLLECTION',
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts(published, published_at desc);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;

alter table public.blog_posts enable row level security;

drop policy if exists "blog_public_read_published" on public.blog_posts;
create policy "blog_public_read_published"
  on public.blog_posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "blog_admin_all" on public.blog_posts;
create policy "blog_admin_all"
  on public.blog_posts for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();
