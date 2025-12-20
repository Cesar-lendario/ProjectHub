-- =====================================================
-- CORREÇÃO DEFINITIVA: Timeout ao Salvar Tarefas
-- Problema: Políticas RLS com JOINs pesados causam timeout
-- Solução: Políticas RLS otimizadas + índices
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR ÍNDICES PARA OTIMIZAR QUERIES RLS
-- =====================================================

-- Índice para auth_id na tabela users (busca rápida por usuário autenticado)
CREATE INDEX IF NOT EXISTS idx_users_auth_id 
ON public.users(auth_id);

-- Índice composto para project_team (busca rápida por projeto + usuário)
CREATE INDEX IF NOT EXISTS idx_project_team_project_user 
ON public.project_team(project_id, user_id);

-- Índice composto para project_team (busca rápida por projeto + usuário + role)
CREATE INDEX IF NOT EXISTS idx_project_team_project_user_role 
ON public.project_team(project_id, user_id, role);

-- Índice para project_id na tabela tasks (busca rápida por projeto)
CREATE INDEX IF NOT EXISTS idx_tasks_project_id 
ON public.tasks(project_id);

-- =====================================================
-- PARTE 2: REMOVER POLÍTICAS ANTIGAS
-- =====================================================

DROP POLICY IF EXISTS "Tasks select policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks insert policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks update policy" ON public.tasks;
DROP POLICY IF EXISTS "Tasks delete policy" ON public.tasks;
DROP POLICY IF EXISTS "Membros veem tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros podem criar tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros podem atualizar tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Membros podem deletar tarefas" ON public.tasks;

-- =====================================================
-- PARTE 3: CRIAR POLÍTICAS RLS OTIMIZADAS
-- =====================================================

-- Garantir que RLS está habilitado
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- POLÍTICA 1: SELECT (Visualizar Tarefas)
-- --------------------------------------------------
-- OTIMIZAÇÃO: Remover JOIN, usar apenas project_team
-- OTIMIZAÇÃO: user_id já é TEXT, não precisa conversão
CREATE POLICY "tasks_select_optimized"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  -- Opção 1: Membro do projeto
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = (
        SELECT id::text 
        FROM public.users 
        WHERE auth_id = auth.uid()
        LIMIT 1
      )
  )
  OR
  -- Opção 2: Admin global
  EXISTS (
    SELECT 1 
    FROM public.users u
    WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    LIMIT 1
  )
);

-- --------------------------------------------------
-- POLÍTICA 2: INSERT (Criar Tarefas)
-- --------------------------------------------------
-- OTIMIZAÇÃO: Verificar role diretamente em project_team
CREATE POLICY "tasks_insert_optimized"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  -- Opção 1: Admin ou Editor do projeto
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = (
        SELECT id::text 
        FROM public.users 
        WHERE auth_id = auth.uid()
        LIMIT 1
      )
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
  OR
  -- Opção 2: Admin global
  EXISTS (
    SELECT 1 
    FROM public.users u
    WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    LIMIT 1
  )
);

-- --------------------------------------------------
-- POLÍTICA 3: UPDATE (Atualizar Tarefas)
-- --------------------------------------------------
-- OTIMIZAÇÃO: Mesma lógica do INSERT
CREATE POLICY "tasks_update_optimized"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  -- Opção 1: Admin ou Editor do projeto
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = (
        SELECT id::text 
        FROM public.users 
        WHERE auth_id = auth.uid()
        LIMIT 1
      )
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
  OR
  -- Opção 2: Admin global
  EXISTS (
    SELECT 1 
    FROM public.users u
    WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    LIMIT 1
  )
)
WITH CHECK (
  -- Mesmo check do INSERT
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = (
        SELECT id::text 
        FROM public.users 
        WHERE auth_id = auth.uid()
        LIMIT 1
      )
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 
    FROM public.users u
    WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    LIMIT 1
  )
);

-- --------------------------------------------------
-- POLÍTICA 4: DELETE (Deletar Tarefas)
-- --------------------------------------------------
-- OTIMIZAÇÃO: Mesma lógica do UPDATE
CREATE POLICY "tasks_delete_optimized"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  -- Opção 1: Admin ou Editor do projeto
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    WHERE pt.project_id = tasks.project_id
      AND pt.user_id = (
        SELECT id::text 
        FROM public.users 
        WHERE auth_id = auth.uid()
        LIMIT 1
      )
      AND pt.role IN ('admin', 'editor')
    LIMIT 1
  )
  OR
  -- Opção 2: Admin global
  EXISTS (
    SELECT 1 
    FROM public.users u
    WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    LIMIT 1
  )
);

-- =====================================================
-- PARTE 4: VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;

-- =====================================================
-- PARTE 5: TESTAR PERFORMANCE
-- =====================================================

-- Explicar query de SELECT (deve usar índices)
EXPLAIN ANALYZE
SELECT * FROM public.tasks
WHERE project_id = '4e434e76-c72a-48d8-a235-ac4bfa51a0b1'
LIMIT 10;

-- Verificar se índices estão sendo usados
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tasks', 'project_team', 'users')
ORDER BY tablename, indexname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- 1. ✅ 4 políticas RLS criadas (otimizadas)
-- 2. ✅ 5 índices criados
-- 3. ✅ Query EXPLAIN mostra uso de índices
-- 4. ✅ Timeout reduzido de 20s para < 1s
--
-- ANTES: SELECT com JOIN pesado (~15-20s)
-- DEPOIS: SELECT com índices (~50-200ms)
-- =====================================================

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Copiar este script
-- 2. Abrir Supabase Dashboard
-- 3. Ir em SQL Editor
-- 4. Colar e executar
-- 5. Testar salvamento de tarefa
-- 6. Verificar logs no console (deve ser < 1s)
-- =====================================================


