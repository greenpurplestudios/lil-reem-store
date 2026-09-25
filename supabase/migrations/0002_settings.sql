create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "public settings" on public.site_settings for select using (true);
create policy "admin settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
