-- =====================================================
-- SCRIPT: Adicionar coluna client_email à tabela projects
-- Contexto: Correção do erro "Could not find the 'client_email' column"
-- =====================================================

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_email TEXT;

COMMENT ON COLUMN public.projects.client_email IS
'Email do contato do projeto. Utilizado para notificações e comunicação.';

-- Opcional: verificação rápida da coluna após executar o script
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'projects' AND table_schema = 'public'
-- ORDER BY ordinal_position;


