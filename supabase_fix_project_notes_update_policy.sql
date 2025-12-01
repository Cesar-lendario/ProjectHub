-- ============================================
-- CORREÇÃO: Política RLS de UPDATE para project_notes
-- Corrige a inconsistência na política de UPDATE
-- ============================================

-- Remover política de UPDATE antiga
DROP POLICY IF EXISTS "Users can update their own notes" ON project_notes;

-- Recriar política de UPDATE correta
-- IMPORTANTE: Usa o mesmo padrão das outras políticas (mapeamento auth_id -> users.id)
CREATE POLICY "Users can update their own notes"
  ON project_notes
  FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Verificar a política criada
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









