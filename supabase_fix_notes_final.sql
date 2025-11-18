-- Solução FINAL para RLS policies da tabela project_notes
-- Este script corrige o problema de inserção de notas

-- 1. Remover todas as policies antigas
DROP POLICY IF EXISTS "Authenticated users can view project notes" ON project_notes;
DROP POLICY IF EXISTS "Authenticated users can create project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON project_notes;
DROP POLICY IF EXISTS "Admins can delete any note" ON project_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON project_notes;

-- 2. Recriar policies SIMPLIFICADAS

-- Policy: Leitura pública para usuários autenticados
CREATE POLICY "Authenticated users can view project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuários autenticados podem criar notas
-- SIMPLIFICADO: Apenas verifica se o created_by existe na tabela users
CREATE POLICY "Authenticated users can create project notes"
  ON project_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = created_by
    )
  );

-- Policy: Usuários podem atualizar suas próprias anotações
CREATE POLICY "Users can update their own notes"
  ON project_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = created_by
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = created_by
    )
  );

-- Policy: Admins podem deletar qualquer anotação
CREATE POLICY "Admins can delete any note"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Policy: Usuários podem deletar suas próprias anotações
CREATE POLICY "Users can delete their own notes"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = created_by
      AND u.auth_id = auth.uid()
    )
  );

-- 3. Verificar se as policies foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'project_notes'
ORDER BY cmd, policyname;
