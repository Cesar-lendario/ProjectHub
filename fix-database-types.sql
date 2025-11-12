-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO COMPLETA DO SCHEMA
-- ProjectHub - Database Schema
-- =====================================================

-- 1. TABELA: users
-- Remove coluna email e garante que auth_id é obrigatório
ALTER TABLE public.users DROP COLUMN IF EXISTS email;
ALTER TABLE public.users ALTER COLUMN auth_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_unique ON public.users(auth_id);

-- 2. TABELA: projects
-- Garantir que as colunas de notificação existam
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS last_email_notification TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS last_whatsapp_notification TIMESTAMP WITH TIME ZONE;

-- 3. TABELA: tasks
-- Garantir estrutura correta
ALTER TABLE public.tasks 
ALTER COLUMN assignee_id DROP NOT NULL;

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}';

-- 4. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS project_team_project_id_idx ON public.project_team(project_id);
CREATE INDEX IF NOT EXISTS project_team_user_id_idx ON public.project_team(user_id);
CREATE INDEX IF NOT EXISTS attachments_project_id_idx ON public.attachments(project_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_channel_idx ON public.messages(channel);

-- 5. FOREIGN KEYS (se não existirem)
DO $$
BEGIN
    -- tasks -> users (assignee)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_assignee_id_fkey' AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_assignee_id_fkey 
        FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;

    -- tasks -> projects
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_project_id_fkey' AND table_name = 'tasks'
    ) THEN
        ALTER TABLE public.tasks 
        ADD CONSTRAINT tasks_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;

    -- project_team -> users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'project_team_user_id_fkey' AND table_name = 'project_team'
    ) THEN
        ALTER TABLE public.project_team 
        ADD CONSTRAINT project_team_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- project_team -> projects
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'project_team_project_id_fkey' AND table_name = 'project_team'
    ) THEN
        ALTER TABLE public.project_team 
        ADD CONSTRAINT project_team_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. ATUALIZAR auth_id dos usuários existentes (se necessário)
-- Este comando vincula usuários existentes ao primeiro admin do Auth
-- ATENÇÃO: Execute apenas se necessário!
-- UPDATE public.users 
-- SET auth_id = (SELECT id FROM auth.users LIMIT 1)
-- WHERE auth_id IS NULL;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar estrutura da tabela users
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se auth_id está preenchido para todos os usuários
SELECT 
    id, 
    name, 
    auth_id,
    CASE 
        WHEN auth_id IS NULL THEN '❌ SEM AUTH_ID' 
        ELSE '✅ OK' 
    END as status
FROM public.users;

-- Verificar foreign keys
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
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script completo
-- 4. Verifique os resultados das queries de verificação
-- 5. Se tudo estiver OK, atualize o frontend
-- =====================================================


