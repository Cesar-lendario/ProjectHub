-- ============================================
-- CORREÇÃO CRÍTICA: Políticas RLS para DELETE de project_notes
-- Este script corrige o problema de exclusão que não funciona
-- ============================================

-- 1. Remover todas as policies de DELETE existentes
DROP POLICY IF EXISTS "Admins can delete any note" ON project_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON project_notes;

-- 2. Verificar o formato do role na tabela users
-- Execute esta query para ver como os roles estão armazenados:
SELECT DISTINCT role FROM users;

-- 3. Criar política para ADMIN deletar qualquer nota
-- IMPORTANTE: Esta política verifica se o usuário logado é admin
-- Funciona com qualquer formato de role (case-insensitive usando LOWER)
CREATE POLICY "Admins can delete any note"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND LOWER(users.role) = LOWER('admin')
    )
  );

-- 4. Criar política para usuários deletarem suas próprias notas
CREATE POLICY "Users can delete their own notes"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 5. Verificar as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_clause
FROM pg_policies
WHERE tablename = 'project_notes'
ORDER BY cmd, policyname;

-- 6. Teste de verificação: Verificar se o usuário atual pode deletar
-- Execute esta query enquanto estiver logado para verificar:
SELECT 
  auth.uid() as current_auth_id,
  u.id as user_id,
  u.name,
  u.role,
  u.auth_id,
  CASE 
    WHEN u.auth_id = auth.uid() THEN 'SIM - Usuário logado'
    ELSE 'NÃO - Usuário diferente'
  END as is_logged_user,
  CASE 
    WHEN u.role = 'admin' OR u.role = 'Administrador' THEN 'SIM - É admin'
    ELSE 'NÃO - Não é admin'
  END as is_admin
FROM users u
WHERE u.auth_id = auth.uid();

-- ============================================
-- NOTAS IMPORTANTES:
-- 1. Se o role no banco for 'Administrador' (com maiúscula), a política já está ajustada
-- 2. Se o role for 'admin' (minúsculo), a política também funciona
-- 3. Se houver outro formato, ajuste a linha 30 do script
-- ============================================

