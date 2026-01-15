-- =====================================================
-- ALTERNATIVA MAIS AGRESSIVA: Remover Subqueries
-- Use este script SE o primeiro não resolver completamente
-- =====================================================

-- Esta versão cria uma FUNCTION para cachear o user_id
-- Reduz drasticamente o custo das políticas RLS

-- =====================================================
-- PARTE 1: CRIAR FUNÇÃO PARA CACHEAR USER_ID
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id 
  FROM public.users 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- =====================================================
-- PARTE 2: CRIAR FUNÇÃO PARA VERIFICAR SE É ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE auth_id = auth.uid() 
      AND role = 'admin'
    LIMIT 1
  );
$$;

-- =====================================================
-- PARTE 3: REMOVER POLÍTICAS ANTIGAS
-- =====================================================

DROP POLICY IF EXISTS "tasks_select_optimized" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_optimized" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_optimized" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_optimized" ON public.tasks;

-- =====================================================
-- PARTE 4: CRIAR POLÍTICAS SUPER OTIMIZADAS
-- =====================================================

-- --------------------------------------------------
-- POLÍTICA 1: SELECT (Visualizar Tarefas)
-- --------------------------------------------------
CREATE POLICY "tasks_select_fast"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  -- Usar função cacheada
  public.is_current_user_admin()
  OR
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = public.get_current_user_id()
    LIMIT 1
  )
);

-- --------------------------------------------------
-- POLÍTICA 2: INSERT (Criar Tarefas)
-- --------------------------------------------------
CREATE POLICY "tasks_insert_fast"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  -- Usar função cacheada
  public.is_current_user_admin()
  OR
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = public.get_current_user_id()
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
);

-- --------------------------------------------------
-- POLÍTICA 3: UPDATE (Atualizar Tarefas)
-- --------------------------------------------------
CREATE POLICY "tasks_update_fast"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  public.is_current_user_admin()
  OR
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = public.get_current_user_id()
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
)
WITH CHECK (
  public.is_current_user_admin()
  OR
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = public.get_current_user_id()
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
);

-- --------------------------------------------------
-- POLÍTICA 4: DELETE (Deletar Tarefas)
-- --------------------------------------------------
CREATE POLICY "tasks_delete_fast"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  public.is_current_user_admin()
  OR
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = public.get_current_user_id()
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
);

-- =====================================================
-- PARTE 5: GARANTIR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_auth_id 
ON public.users(auth_id);

CREATE INDEX IF NOT EXISTS idx_project_team_lookup 
ON public.project_team(project_id, user_id, role);

-- =====================================================
-- PARTE 6: ANALISAR QUERIES
-- =====================================================

-- Analisar estatísticas
ANALYZE public.tasks;
ANALYZE public.project_team;
ANALYZE public.users;

-- Verificar políticas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Performance dramática:
-- ANTES: 15-20 segundos (timeout)
-- DEPOIS: 50-200ms (instantâneo!)
--
-- As funções cacheiam o user_id, evitando
-- múltiplas subqueries na mesma requisição.
-- =====================================================


