-- ============================================
-- SCRIPT COMPLETO PARA CONFIGURAR PROJECT_NOTES
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Remover tabela existente se houver (CUIDADO: isso apaga todos os dados)
-- Descomente a linha abaixo apenas se quiser recomeçar do zero
-- DROP TABLE IF EXISTS project_notes CASCADE;

-- 2. Criar tabela project_notes
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_created_at ON project_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_created ON project_notes(project_id, created_at DESC);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can view project notes" ON project_notes;
DROP POLICY IF EXISTS "Authenticated users can create project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON project_notes;
DROP POLICY IF EXISTS "Admins can delete any note" ON project_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON project_notes;

-- 6. Criar políticas RLS

-- Policy: SELECT - Todos os usuários autenticados podem ver todas as notas
CREATE POLICY "Authenticated users can view project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: INSERT - Todos os usuários autenticados podem criar anotações
CREATE POLICY "Authenticated users can create project notes"
  ON project_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Policy: UPDATE - Usuários podem atualizar suas próprias anotações
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

-- Policy: DELETE - Admins podem deletar qualquer anotação
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

-- Policy: DELETE - Usuários podem deletar suas próprias anotações
CREATE POLICY "Users can delete their own notes"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- 7. Adicionar comentários para documentação
COMMENT ON TABLE project_notes IS 'Armazena anotações sobre o estágio atual dos projetos com histórico temporal';
COMMENT ON COLUMN project_notes.id IS 'Identificador único da anotação';
COMMENT ON COLUMN project_notes.project_id IS 'Referência ao projeto';
COMMENT ON COLUMN project_notes.note_text IS 'Texto da anotação sobre estágio, progresso, decisões ou observações';
COMMENT ON COLUMN project_notes.created_at IS 'Data e hora de criação da anotação';
COMMENT ON COLUMN project_notes.created_by IS 'Usuário que criou a anotação';

-- 8. Verificar configuração
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'project_notes';

-- 9. Verificar se a tabela foi criada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'project_notes'
ORDER BY ordinal_position;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
