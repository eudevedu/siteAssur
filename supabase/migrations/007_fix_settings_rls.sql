-- ============================================
-- CORREÇÃO: Política RLS da tabela site_settings
-- A política anterior usava apenas USING para operações de escrita,
-- o que bloqueava INSERTs e UPDATEs. Adicionamos WITH CHECK.
-- ============================================

-- Remove a política antiga que não cobria INSERT/UPDATE corretamente
drop policy if exists "Admins gerenciam configurações" on public.site_settings;

-- Recria com USING + WITH CHECK para cobrir todas as operações DML
create policy "Admins podem modificar configurações"
  on public.site_settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
