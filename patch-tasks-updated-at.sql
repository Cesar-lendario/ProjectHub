-- =====================================================
-- SCRIPT: Garantir coluna updated_at na tabela tasks
-- =====================================================

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

COMMENT ON COLUMN public.tasks.updated_at IS
'Última atualização da tarefa. Necessário para o mapeamento do frontend e APIs.';

-- Opcional: verificação rápida
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'tasks'
-- ORDER BY ordinal_position;


