-- ============================================
-- EXTENSÕES
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- TABELA: profiles (vinculada ao auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Perfis visíveis apenas para admins"
  on public.profiles for select
  using (auth.uid() = id);

-- Trigger: criar perfil ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- TABELA: categories
-- ============================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  type text default 'post' check (type in ('post', 'project', 'page')),
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Categorias públicas para leitura" on public.categories
  for select using (true);

create policy "Apenas admins podem gerenciar categorias" on public.categories
  for all using (auth.role() = 'authenticated');

-- ============================================
-- TABELA: tags
-- ============================================
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

alter table public.tags enable row level security;

create policy "Tags públicas para leitura" on public.tags for select using (true);
create policy "Apenas admins gerenciam tags" on public.tags for all using (auth.role() = 'authenticated');

-- ============================================
-- TABELA: posts
-- ============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts publicados visíveis para todos" on public.posts
  for select using (status = 'published' or auth.role() = 'authenticated');

create policy "Admins gerenciam posts" on public.posts
  for all using (auth.role() = 'authenticated');

-- Tabela de junção posts <-> tags
create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table public.post_tags enable row level security;
create policy "Post tags públicas" on public.post_tags for select using (true);
create policy "Admins gerenciam post_tags" on public.post_tags for all using (auth.role() = 'authenticated');

-- ============================================
-- TABELA: projects (portfólio)
-- ============================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  description text,
  content text,
  cover_image_url text,
  images text[] default '{}',
  url text,
  github_url text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  category_id uuid references public.categories(id) on delete set null,
  featured boolean default false,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Projetos publicados visíveis" on public.projects
  for select using (status = 'published' or auth.role() = 'authenticated');

create policy "Admins gerenciam projetos" on public.projects
  for all using (auth.role() = 'authenticated');

-- Tabela de junção projects <-> tags
create table public.project_tags (
  project_id uuid references public.projects(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

alter table public.project_tags enable row level security;
create policy "Project tags públicas" on public.project_tags for select using (true);
create policy "Admins gerenciam project_tags" on public.project_tags for all using (auth.role() = 'authenticated');

-- ============================================
-- TABELA: pages (páginas estáticas)
-- ============================================
create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text,
  status text default 'draft' check (status in ('draft', 'published')),
  show_in_nav boolean default false,
  nav_order integer default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.pages enable row level security;

create policy "Páginas publicadas visíveis" on public.pages
  for select using (status = 'published' or auth.role() = 'authenticated');

create policy "Admins gerenciam páginas" on public.pages
  for all using (auth.role() = 'authenticated');

-- ============================================
-- STORAGE: bucket de mídia
-- ============================================
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "Imagens públicas para leitura" on storage.objects
  for select using (bucket_id = 'media');

create policy "Admins fazem upload" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admins deletam mídias" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');

-- ============================================
-- TABELA: media (registro de arquivos)
-- ============================================
create table public.media (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  original_name text,
  url text not null,
  mime_type text,
  size_bytes integer,
  alt_text text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.media enable row level security;
create policy "Mídia visível para admins" on public.media for select using (auth.role() = 'authenticated');
create policy "Admins gerenciam mídia" on public.media for all using (auth.role() = 'authenticated');

-- ============================================
-- FUNÇÃO: updated_at automático
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at before update on public.posts
  for each row execute function public.update_updated_at();

create trigger update_projects_updated_at before update on public.projects
  for each row execute function public.update_updated_at();

create trigger update_pages_updated_at before update on public.pages
  for each row execute function public.update_updated_at();
