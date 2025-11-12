-- =====================================================
-- CORREÇÃO: Limpar Registros Órfãos e Criar Foreign Keys
-- =====================================================
-- Execute PASSO A PASSO no Supabase SQL Editor
-- =====================================================

-- PASSO 1: Verificar registros órfãos (usuários que não existem)
SELECT pt.user_id, pt.project_id, pt.role
FROM public.project_team pt
LEFT JOIN public.users u ON pt.user_id = u.id
WHERE u.id IS NULL;

-- PASSO 2: DELETAR registros órfãos
-- ATENÇÃO: Isso vai remover membros de projetos cujos usuários não existem mais
DELETE FROM public.project_team
WHERE user_id NOT IN (SELECT id FROM public.users);

-- PASSO 3: Verificar quantos registros foram deletados
SELECT COUNT(*) as registros_restantes FROM public.project_team;

-- PASSO 4: Agora sim, criar as foreign keys
ALTER TABLE public.project_team
DROP CONSTRAINT IF EXISTS project_team_user_id_fkey;

ALTER TABLE public.project_team
ADD CONSTRAINT project_team_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- PASSO 5: Criar foreign key com projects também
ALTER TABLE public.project_team
DROP CONSTRAINT IF EXISTS project_team_project_id_fkey;

ALTER TABLE public.project_team
ADD CONSTRAINT project_team_project_id_fkey
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- PASSO 6: Verificar se tudo está OK
SELECT
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'project_team';

-- =====================================================
-- RESULTADO ESPERADO:
-- - Registros órfãos deletados
-- - 2 foreign keys criadas com sucesso
-- - Sistema funcionando normalmente
-- =====================================================

