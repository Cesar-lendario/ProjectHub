-- =====================================================
-- SCRIPT: Adicionar coluna uploaded_by na tabela attachments
-- =====================================================
-- Este script adiciona a coluna uploaded_by que está faltando
-- na tabela attachments do banco de dados

-- 1. Adicionar coluna uploaded_by (se não existir)
ALTER TABLE public.attachments 
ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN public.attachments.uploaded_by IS 
'ID do usuário que fez o upload do arquivo';

-- 3. Criar foreign key para users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'attachments_uploaded_by_fkey'
    ) THEN
        ALTER TABLE public.attachments
        ADD CONSTRAINT attachments_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) 
        REFERENCES public.users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS attachments_uploaded_by_idx 
ON public.attachments(uploaded_by);

-- 5. Atualizar registros existentes (opcional)
-- Se houver attachments sem uploaded_by, você pode:
-- a) Deixar como NULL
-- b) Atribuir a um usuário admin padrão
-- c) Deletar os registros antigos

-- Exemplo: Atribuir ao primeiro usuário admin encontrado
-- UPDATE public.attachments 
-- SET uploaded_by = (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
-- WHERE uploaded_by IS NULL;

-- 6. Verificar a estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'attachments'
ORDER BY ordinal_position;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se não há erros
-- 3. Teste o upload novamente na aplicação
-- =====================================================

