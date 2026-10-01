create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null,
  category text not null, location text not null, description text not null, services text[] not null default '{}',
  project_date date, featured boolean not null default false, status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists project_media (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id) on delete cascade,
  media_url text not null, media_type text not null check (media_type in ('image','video')), stage text not null default 'after' check (stage in ('before','during','after')),
  display_order int not null default 0, is_cover boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists likes (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id) on delete cascade, visitor_identifier text not null, created_at timestamptz not null default now(), unique(project_id, visitor_identifier));
create table if not exists ratings (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id) on delete cascade, visitor_identifier text not null, rating int not null check (rating between 1 and 5), created_at timestamptz not null default now(), unique(project_id, visitor_identifier));
create table if not exists reviews (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id) on delete cascade, name text not null, rating int not null check (rating between 1 and 5), review text not null, status text not null default 'pending' check (status in ('pending','approved','rejected')), created_at timestamptz not null default now());
create table if not exists requests (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id) on delete set null, full_name text not null, phone text not null, email text not null, location text not null, work_type text not null, contact_method text not null, description text not null, budget text, preferred_start_date date, reference_file_url text, status text not null default 'new' check (status in ('new','contacted','quotation','approved','in_progress','completed','cancelled')), created_at timestamptz not null default now());
create table if not exists contact_messages (id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, subject text not null, message text not null, status text not null default 'new' check (status in ('new','read','archived')), created_at timestamptz not null default now());
create table if not exists site_settings (
  id int primary key default 1 check (id = 1), company_name text not null default 'Impact Construction', tagline text not null default 'Considered spaces. Precise craft. Dependable delivery.', phone text not null default '+233 24 000 0000', whatsapp text not null default '233240000000', email text not null default 'hello@impactconstruction.co', address text not null default 'Accra, Ghana', opening_hours text not null default 'Mon-Sat, 8am-6pm', description text not null default 'Construction, renovation, and handy-work delivered with discipline.', logo_url text, updated_at timestamptz not null default now()
);
create index if not exists projects_category_idx on projects(category); create index if not exists projects_featured_idx on projects(featured); create index if not exists media_project_idx on project_media(project_id); create index if not exists requests_status_idx on requests(status); create index if not exists reviews_status_idx on reviews(status);

alter table projects enable row level security; alter table project_media enable row level security; alter table reviews enable row level security;
alter table site_settings enable row level security;
create policy "published projects are public" on projects for select using (status = 'published');
create policy "project media is public" on project_media for select using (true);
create policy "approved reviews are public" on reviews for select using (status = 'approved');
create policy "site settings are public" on site_settings for select using (true);
insert into site_settings (id) values (1) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('company-assets', 'company-assets', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('project-videos', 'project-videos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('reference-files', 'reference-files', false) on conflict (id) do nothing;
