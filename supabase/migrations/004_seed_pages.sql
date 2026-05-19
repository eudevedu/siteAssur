-- Inserir páginas iniciais padrão
insert into public.pages (title, slug, content, status, show_in_nav, nav_order)
values 
('Quem Sou', 'sobre', '<h1>Sobre o Mandato</h1><p>Esta é uma página sobre a trajetória e compromissos do nosso mandato participativo.</p>', 'published', true, 1),
('Privacidade', 'privacidade', '<h1>Política de Privacidade</h1><p>Informações sobre como tratamos seus dados.</p>', 'published', false, 99)
on conflict (slug) do nothing;
