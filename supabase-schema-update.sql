-- =====================================================
-- SCRIPT DE ATUALIZAÇÃO DO SCHEMA DO SUPABASE
-- ProjectHub - Correção da Tabela Users
-- =====================================================
-- Este script remove a coluna 'email' da tabela 'users'
-- pois o email deve vir apenas do Supabase Auth via auth_id
-- =====================================================

-- 1. Remover a coluna 'email' da tabela 'users' se existir
ALTER TABLE public.users 
DROP COLUMN IF EXISTS email;

-- 2. Adicionar auth_id se não existir
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS auth_id UUID;

-- 3. Garantir que avatar e function existam
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS function TEXT;

-- 4. Adicionar índice único em auth_id para melhor performance
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_id_unique 
ON public.users(auth_id);

-- 4. Adicionar comentário explicativo na tabela
COMMENT ON TABLE public.users IS 
'Tabela de usuários do sistema. O email vem do Supabase Auth via auth_id, não é armazenado aqui.';

COMMENT ON COLUMN public.users.auth_id IS 
'Referência ao usuário autenticado no Supabase Auth (auth.users). Use para buscar o email.';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Execute esta query para verificar a estrutura atualizada:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- ANTES: users tinha coluna 'email' (não sincronizada com Auth)
-- DEPOIS: email vem de auth.users via users.auth_id
-- 
-- Para buscar usuário com email no frontend:
-- 1. useAuth() retorna profile com email do Auth
-- 2. mapUser() em mappers.ts usa fallback se necessário
-- 3. Frontend sempre usa profile.email do Auth como fonte da verdade
-- =====================================================

