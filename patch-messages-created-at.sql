-- =====================================================
-- SCRIPT: Garantir coluna created_at em public.messages
-- =====================================================
-- Execute no Supabase SQL Editor (Database > SQL Editor)
-- =====================================================

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

COMMENT ON COLUMN public.messages.created_at IS
'Data de envio da mensagem. Utilizada para ordenação cronológica no frontend.';

-- Opcional: verificação rápida
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'messages'
-- ORDER BY ordinal_position;

-- =====================================================

