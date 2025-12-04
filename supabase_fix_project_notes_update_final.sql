-- ============================================
-- CORREÇÃO FINAL: Política RLS de UPDATE para project_notes
-- Este script garante que a política de UPDATE funcione corretamente
-- ============================================

-- 1. Remover política de UPDATE antiga
DROP POLICY IF EXISTS "Users can update their own notes" ON project_notes;

-- 2. Verificar se há outras políticas de UPDATE conflitantes
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'project_notes'
  AND cmd = 'UPDATE';

-- 3. Recriar política de UPDATE com verificação mais robusta
-- IMPORTANTE: A política verifica se o created_by da nota corresponde ao usuário autenticado
CREATE POLICY "Users can update their own notes"
  ON project_notes
  FOR UPDATE
  TO authenticated
  USING (
    -- Verificar se o usuário autenticado é o autor da nota
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Garantir que após a atualização, o created_by ainda seja o mesmo
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 4. Verificar a política criada
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'project_notes'
  AND cmd = 'UPDATE';

-- 5. Teste: Verificar se o usuário atual pode ver suas próprias notas
-- Execute este SELECT para verificar se a política está funcionando
-- (Substitua 'SEU_USER_ID' pelo ID do usuário que está tentando editar)
/*
SELECT 
  pn.id,
  pn.project_id,
  pn.note_text,
  pn.created_by,
  u.id as user_id,
  u.auth_id,
  auth.uid() as current_auth_uid
FROM project_notes pn
JOIN users u ON u.id = pn.created_by
WHERE pn.created_by IN (
  SELECT id FROM users WHERE auth_id = auth.uid()
);
*/









