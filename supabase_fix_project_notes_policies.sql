-- Script de correção das RLS Policies da tabela project_notes
-- Execute este script se você já criou a tabela com as policies antigas

-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Authenticated users can view project notes" ON project_notes;
DROP POLICY IF EXISTS "Authenticated users can create project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON project_notes;
DROP POLICY IF EXISTS "Admins can delete any note" ON project_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON project_notes;

-- Recriar policies corretas

-- Policy: Leitura pública para usuários autenticados
CREATE POLICY "Authenticated users can view project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Todos os usuários autenticados podem criar anotações
-- CORRIGIDO: Usa o mapeamento correto entre auth_id e users.id
CREATE POLICY "Authenticated users can create project notes"
  ON project_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar suas próprias anotações
-- CORRIGIDO: Usa o mapeamento correto entre auth_id e users.id
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

-- Policy: Admins podem deletar qualquer anotação
-- CORRIGIDO: Usa users.auth_id em vez de users.id
CREATE POLICY "Admins can delete any note"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Usuários podem deletar suas próprias anotações
-- CORRIGIDO: Usa o mapeamento correto entre auth_id e users.id
CREATE POLICY "Users can delete their own notes"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Verificar se as policies foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'project_notes'
ORDER BY policyname;
