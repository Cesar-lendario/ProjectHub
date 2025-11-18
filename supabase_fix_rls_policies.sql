-- ============================================
-- MIGRAÇÃO: Corrigir RLS Policies da tabela users
-- ============================================

-- 1. Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Permitir leitura de todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON public.users;
DROP POLICY IF EXISTS "Permitir atualização de próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Permitir exclusão por admin" ON public.users;

-- 2. Verificar se RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. POLICY: Permitir que QUALQUER PESSOA leia a tabela users
-- (Isso é necessário para o LoginPage verificar se existe admin)
CREATE POLICY "Permitir leitura de todos os usuários"
ON public.users
FOR SELECT
TO public
USING (true);

-- 4. POLICY: Permitir inserção apenas via trigger (sistema)
CREATE POLICY "Permitir inserção de novos usuários"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- 5. POLICY: Permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Permitir atualização de próprio perfil"
ON public.users
FOR UPDATE
TO public
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- 6. POLICY: Permitir que admins excluam usuários
CREATE POLICY "Permitir exclusão por admin"
ON public.users
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- 7. Verificar as policies criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users';

-- 8. Testar leitura da tabela
SELECT 
  id,
  name,
  role,
  auth_id
FROM public.users;

-- ============================================
-- RESULTADO ESPERADO:
-- Você deverá ver:
-- 1. Lista de 4 policies criadas
-- 2. Seus 2 usuários (admin e supervisor)
-- ============================================
