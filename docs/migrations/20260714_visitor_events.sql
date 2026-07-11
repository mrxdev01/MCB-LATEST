-- Visitor analytics: last-24h rolling window.
-- Anon/auth users insert their visit; only admins can read.
-- pg_cron nightly job removes rows older than 24h automatically.

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  path text,
  user_agent text
);

create index if not exists visitor_events_created_at_idx
  on public.visitor_events (created_at desc);
create index if not exists visitor_events_session_idx
  on public.visitor_events (session_id);

grant insert on public.visitor_events to anon, authenticated;
grant select on public.visitor_events to authenticated;
grant all on public.visitor_events to service_role;

alter table public.visitor_events enable row level security;

drop policy if exists "anyone can insert visits" on public.visitor_events;
create policy "anyone can insert visits"
  on public.visitor_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins can read visits" on public.visitor_events;
create policy "admins can read visits"
  on public.visitor_events
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Realtime for admin live-updating dashboard (idempotent)
do $$
begin
  alter publication supabase_realtime add table public.visitor_events;
exception when duplicate_object then null;
end $$;

-- pg_cron: delete rows older than 24h every hour
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('visitor-events-cleanup');
exception when others then null;
end $$;

select cron.schedule(
  'visitor-events-cleanup',
  '0 * * * *',
  $$delete from public.visitor_events where created_at < now() - interval '24 hours'$$
);
