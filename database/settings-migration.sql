create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Impact Construction',
  tagline text not null default 'Considered spaces. Precise craft. Dependable delivery.',
  phone text not null default '+233 24 000 0000',
  whatsapp text not null default '233240000000',
  email text not null default 'hello@impactconstruction.co',
  address text not null default 'Accra, Ghana',
  opening_hours text not null default 'Mon-Sat, 8am-6pm',
  description text not null default 'Construction, renovation, and handy-work delivered with discipline.',
  logo_url text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'site_settings'
      and policyname = 'site settings are public'
  ) then
    create policy "site settings are public"
      on public.site_settings
      for select
      using (true);
  end if;
end
$$;

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', true)
on conflict (id) do nothing;