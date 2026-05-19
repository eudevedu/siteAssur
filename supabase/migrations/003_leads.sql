-- ============================================
-- TABELA: leads (captura de contatos)
-- ============================================
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text not null,
  message text,
  source text default 'landing_page',
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'archived')),
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.leads enable row level security;

-- Permitir que qualquer pessoa insira leads (público)
create policy "Qualquer pessoa pode enviar leads" 
  on public.leads for insert 
  with check (true);

-- Apenas admins podem visualizar e gerenciar leads
create policy "Admins gerenciam leads" 
  on public.leads for all 
  using (auth.role() = 'authenticated');
