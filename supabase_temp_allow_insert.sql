-- Script TEMPORÁRIO para permitir inserção de notas (APENAS PARA TESTE)
-- Este script desabilita a verificação de RLS temporariamente

-- Remover policy antiga se existir
DROP POLICY IF EXISTS "Authenticated users can create project notes" ON project_notes;

-- Criar policy temporária que permite qualquer inserção
CREATE POLICY "Authenticated users can create project notes"
  ON project_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Permite qualquer inserção para teste

-- Para verificar se funcionou:
SELECT * FROM pg_policies WHERE tablename = 'project_notes' AND policyname = 'Authenticated users can create project notes';
