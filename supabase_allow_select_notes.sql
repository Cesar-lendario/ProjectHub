-- Garantir que a policy de SELECT existe e funciona
DROP POLICY IF EXISTS "Authenticated users can view project notes" ON project_notes;

CREATE POLICY "Authenticated users can view project notes"
  ON project_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Verificar
SELECT * FROM pg_policies WHERE tablename = 'project_notes';
