-- =====================================================
-- CORREÇÃO FINAL: Foreign Key Apontando para Tabela Errada
-- =====================================================
-- A foreign key está apontando para 'profiles' em vez de 'users'!
-- Execute este script completo no Supabase SQL Editor
-- =====================================================

-- 1. Remover a foreign key incorreta
ALTER TABLE public.project_team
DROP CONSTRAINT IF EXISTS project_team_user_id_fkey;

-- 2. Criar a foreign key correta apontando para 'users'
ALTER TABLE public.project_team
ADD CONSTRAINT project_team_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Verificar se está correto agora
SELECT
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'project_team';

-- =====================================================
-- RESULTADO ESPERADO:
-- project_team_user_id_fkey -> users (não profiles!)
-- project_team_project_id_fkey -> projects
-- =====================================================

-- 4. Ver os usuários (sem coluna email)
SELECT id, name, avatar, function, role, auth_id FROM public.users;

-- =====================================================
-- APÓS EXECUTAR ESTE SCRIPT:
-- 1. Recarregue a página do app (Ctrl + Shift + R)
-- 2. Teste editar e salvar
-- 3. Deve funcionar perfeitamente!
-- =====================================================


