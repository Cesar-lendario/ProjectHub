-- =====================================================
-- ADICIONAR TIMESTAMPS NA TABELA PROJECTS
-- =====================================================
-- Execute no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar coluna created_at se não existir
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Adicionar coluna updated_at se não existir
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Preencher created_at para projetos existentes (se estiver NULL)
UPDATE public.projects 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- 4. Preencher updated_at para projetos existentes (se estiver NULL)
UPDATE public.projects 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 5. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Adicionar trigger na tabela projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
  AND table_schema = 'public'
  AND column_name IN ('created_at', 'updated_at');

-- =====================================================
-- RESULTADO ESPERADO:
-- created_at  | timestamp with time zone | now()
-- updated_at  | timestamp with time zone | now()
-- =====================================================


