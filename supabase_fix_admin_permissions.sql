-- ============================================
-- MIGRAÇÃO: Corrigir permissões de Admin
-- Permitir que admins editem e excluam qualquer usuário
-- ============================================

-- 1. Remover policy de UPDATE antiga
DROP POLICY IF EXISTS "Permitir atualização de próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Permitir atualização por admin" ON public.users;

-- 2. Criar nova policy de UPDATE que permite:
--    - Usuários comuns: apenas próprio perfil
--    - Admins: qualquer usuário
CREATE POLICY "Permitir atualização de perfil"
ON public.users
FOR UPDATE
TO public
USING (
  -- Pode atualizar se for o próprio usuário OU se for admin
  auth.uid() = auth_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- Mesma lógica para o CHECK
  auth.uid() = auth_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Verificar policies
SELECT 
  policyname,
  cmd,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- RESULTADO ESPERADO:
-- 4 policies:
-- - SELECT: Permitir leitura de todos os usuários
-- - INSERT: Permitir inserção de novos usuários  
-- - UPDATE: Permitir atualização de perfil (nova)
-- - DELETE: Permitir exclusão por admin
-- ============================================
