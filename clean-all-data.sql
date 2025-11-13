-- =====================================================
-- SCRIPT: Limpar todos os dados do ProjectHub
-- ATENÇÃO: Este script apaga TODOS os dados!
-- Use apenas em ambiente de desenvolvimento/testes
-- =====================================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Os dados serão permanentemente removidos!

-- 1. Desabilitar temporariamente as foreign keys para evitar erros
SET session_replication_role = 'replica';

-- 2. Limpar dados das tabelas (ordem importa devido às foreign keys)
DELETE FROM public.attachments;
DELETE FROM public.messages;
DELETE FROM public.project_team;
DELETE FROM public.tasks;
DELETE FROM public.projects;
-- NÃO deletamos users para manter os usuários autenticados

-- 3. Reabilitar as foreign keys
SET session_replication_role = 'origin';

-- 4. Resetar sequências (se houver)
-- Como usamos UUIDs, não há sequências para resetar

-- =====================================================
-- VERIFICAÇÃO: Execute estas queries para confirmar
-- =====================================================

-- Contar registros restantes (deve retornar 0 para todas)
SELECT 'attachments' as tabela, COUNT(*) as total FROM public.attachments
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages
UNION ALL
SELECT 'project_team', COUNT(*) FROM public.project_team
UNION ALL
SELECT 'tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'users', COUNT(*) FROM public.users;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. A tabela 'users' NÃO foi limpa para manter o acesso ao sistema
-- 2. Se quiser limpar também os usuários, adicione:
--    DELETE FROM public.users;
-- 3. Após limpar, você pode começar a criar projetos novamente
-- 4. Todos os arquivos no Storage permanecem - limpe manualmente se necessário
-- =====================================================

