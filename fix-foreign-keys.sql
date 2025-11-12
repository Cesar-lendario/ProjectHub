-- =====================================================
-- CORREÇÃO URGENTE: Foreign Keys Faltantes
-- =====================================================
-- Execute IMEDIATAMENTE no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar foreign key entre project_team e users
ALTER TABLE public.project_team
DROP CONSTRAINT IF EXISTS project_team_user_id_fkey;

ALTER TABLE public.project_team
ADD CONSTRAINT project_team_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. Adicionar foreign key entre project_team e projects
ALTER TABLE public.project_team
DROP CONSTRAINT IF EXISTS project_team_project_id_fkey;

ALTER TABLE public.project_team
ADD CONSTRAINT project_team_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 3. Adicionar foreign key entre tasks e users (assignee)
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 4. Adicionar foreign key entre tasks e projects
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 3. Verificar se as foreign keys foram criadas
SELECT
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('project_team', 'tasks')
    AND tc.table_schema = 'public';

-- =====================================================
-- RESULTADO ESPERADO:
-- Deve mostrar 2 foreign keys:
-- 1. project_team_user_id_fkey -> users(id)
-- 2. project_team_project_id_fkey -> projects(id)
-- 3. tasks_assignee_id_fkey -> users(id)
-- 4. tasks_project_id_fkey -> projects(id)
-- =====================================================


