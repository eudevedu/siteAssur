-- Adicionar novas colunas à tabela leads
alter table public.leads 
add column if not exists city text,
add column if not exists neighborhood text,
add column if not exists profession text,
add column if not exists referrer text,
add column if not exists instagram text;

-- Opcional: remover coluna email se não for mais necessária, 
-- mas por segurança vamos mantê-la como opcional.
alter table public.leads alter column email drop not null;
