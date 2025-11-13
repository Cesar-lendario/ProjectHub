-- =====================================================
-- ATUALIZAÇÕES DE POLÍTICAS RLS PARA TABELA tasks
-- Permite que administradores globais editem tarefas
-- =====================================================

-- 1. Garantir que RLS está habilitado
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Membros veem tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros podem criar tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros podem atualizar tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros podem deletar tarefas" ON public.tasks;

-- 3. Policy SELECT: membros do projeto ou administradores globais
CREATE POLICY "Tasks select policy"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    JOIN public.users u ON u.id = pt.user_id
    WHERE pt.project_id = tasks.project_id
      AND (u.auth_id::uuid) = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_id::uuid = auth.uid()
      AND u.role = 'admin'
  )
);

-- 4. Policy INSERT: admins/editores do projeto ou administradores globais
CREATE POLICY "Tasks insert policy"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    JOIN public.users u ON u.id = pt.user_id
    WHERE pt.project_id = tasks.project_id
      AND (u.auth_id::uuid) = auth.uid()
      AND pt.role IN ('admin', 'editor')
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_id::uuid = auth.uid()
      AND u.role = 'admin'
  )
);

-- 5. Policy UPDATE: admins/editores do projeto ou administradores globais
CREATE POLICY "Tasks update policy"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    JOIN public.users u ON u.id = pt.user_id
    WHERE pt.project_id = tasks.project_id
      AND (u.auth_id::uuid) = auth.uid()
      AND pt.role IN ('admin', 'editor')
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_id::uuid = auth.uid()
      AND u.role = 'admin'
  )
);

-- 6. Policy DELETE: admins/editores do projeto ou administradores globais
CREATE POLICY "Tasks delete policy"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    JOIN public.users u ON u.id = pt.user_id
    WHERE pt.project_id = tasks.project_id
      AND (u.auth_id::uuid) = auth.uid()
      AND pt.role IN ('admin', 'editor')
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_id::uuid = auth.uid()
      AND u.role = 'admin'
  )
);

-- 7. Verificação
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;


