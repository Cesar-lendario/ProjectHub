-- =====================================================
-- SCRIPT: Garantir coluna created_at em public.attachments
-- =====================================================

ALTER TABLE public.attachments
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

COMMENT ON COLUMN public.attachments.created_at IS
'Data de upload do anexo. Utilizada pelo frontend para ordenação e exibição.';

-- Opcional: verificação rápida
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'attachments'
-- ORDER BY ordinal_position;


