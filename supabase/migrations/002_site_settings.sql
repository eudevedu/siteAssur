-- ============================================
-- TABELA: site_settings
-- ============================================
create table if not exists public.site_settings (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

-- Permitir leitura pública para que o site possa carregar as configurações
create policy "Configurações públicas para leitura" 
  on public.site_settings for select 
  using (true);

-- Apenas usuários autenticados (admins) podem modificar as configurações
create policy "Admins gerenciam configurações" 
  on public.site_settings for all 
  using (auth.role() = 'authenticated');

-- Trigger para updated_at
create trigger update_site_settings_updated_at before update on public.site_settings
  for each row execute function public.update_updated_at();

-- Inserir valores padrão baseados no config.js atual
insert into public.site_settings (key, value) values 
('general', '{
  "name": "Nome do Político",
  "shortName": "NP",
  "slogan": "Trabalhando pelo Futuro de Nossa Gente",
  "description": "Compromisso com a verdade, transparência e o desenvolvimento de nossa região. Juntos, estamos construindo um legado de progresso e justiça social."
}'),
('colors', '{
  "primary": "#006738",
  "secondary": "#FFD100",
  "accent": "#0038A8"
}'),
('socials', '{
  "facebook": "https://facebook.com",
  "instagram": "https://instagram.com",
  "twitter": "https://twitter.com",
  "whatsapp": "https://wa.me/5500000000000"
}'),
('contact', '{
  "email": "contato@exemplo.com.br",
  "phone": "(00) 00000-0000",
  "address": "Endereço do Gabinete, Cidade - UF"
}'),
('hero', '{
  "title": "Pelo Futuro de Todos.",
  "titleAccent": "Futuro",
  "ctaPrimary": "Conheça as Propostas",
  "ctaSecondary": "Ver Manifesto"
}'),
('stats', '[
  {"label": "Projetos Aprovados", "value": "45+", "icon": "ShieldCheck"},
  {"label": "Cidades Atendidas", "value": "12", "icon": "MapPin"},
  {"label": "Vidas Impactadas", "value": "150k", "icon": "Heart"}
]')
on conflict (key) do nothing;
