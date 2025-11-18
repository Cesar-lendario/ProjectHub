-- Criar tabela project_notes para armazenar anotações do estágio atual de cada projeto
-- Cada projeto pode ter múltiplas anotações ao longo do tempo

CREATE TABLE IF NOT EXISTS project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para busca rápida por projeto
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_project_notes_created_at ON project_notes(created_at DESC);

-- Índice composto para busca por projeto ordenado por data
CREATE INDEX IF NOT EXISTS idx_project_notes_project_created ON project_notes(project_id, created_at DESC);

-- RLS Policies

-- Habilitar RLS
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública para usuários autenticados
CREATE POLICY "Authenticated users can view project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Todos os usuários autenticados podem criar anotações
CREATE POLICY "Authenticated users can create project notes"
  ON project_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar suas próprias anotações (não usado, mas mantido)
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
CREATE POLICY "Users can delete their own notes"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Comentários para documentação
COMMENT ON TABLE project_notes IS 'Armazena anotações sobre o estágio atual dos projetos com histórico temporal';
COMMENT ON COLUMN project_notes.note_text IS 'Texto da anotação sobre estágio, progresso, decisões ou observações';
COMMENT ON COLUMN project_notes.created_at IS 'Data e hora de criação da anotação';
COMMENT ON COLUMN project_notes.created_by IS 'Usuário que criou a anotação';
