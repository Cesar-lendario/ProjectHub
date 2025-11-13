-- =====================================================
-- SCRIPT: Garantir FK messages.sender_id -> users.id
-- =====================================================
-- Execute no Supabase SQL Editor (Database > SQL Editor)
-- =====================================================

-- 1. Garantir coluna sender_id com tipo UUID
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender_id UUID;

-- Caso a coluna exista mas não seja UUID, tenta converter
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'messages'
          AND column_name = 'sender_id'
          AND data_type <> 'uuid'
    ) THEN
        EXECUTE 'ALTER TABLE public.messages
                 ALTER COLUMN sender_id TYPE uuid
                 USING sender_id::uuid';
    END IF;
END $$;

-- 2. Limpar referências órfãs (usuarios inexistentes)
UPDATE public.messages m
SET sender_id = NULL
WHERE sender_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = m.sender_id
  );

-- 3. Criar índice para consultas por remetente
CREATE INDEX IF NOT EXISTS messages_sender_id_idx
    ON public.messages(sender_id);

-- 4. Adicionar (ou recriar) a foreign key
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 5. Verificação rápida (opcional)
-- SELECT
--     tc.table_name,
--     tc.constraint_name,
--     kcu.column_name,
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON tc.constraint_name = ccu.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_schema = 'public'
--   AND tc.table_name = 'messages';

-- =====================================================

