-- ============================================
-- MIGRAÇÃO: Criar tabela user_invites
-- Sistema de convites para novos usuários
-- ============================================

-- 1. Criar a tabela user_invites
CREATE TABLE IF NOT EXISTS public.user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supervisor', 'engineer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_invites_email ON public.user_invites(email);
CREATE INDEX IF NOT EXISTS idx_user_invites_status ON public.user_invites(status);
CREATE INDEX IF NOT EXISTS idx_user_invites_expires_at ON public.user_invites(expires_at);

-- 3. Habilitar RLS
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- 4. Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Permitir leitura de convites" ON public.user_invites;
DROP POLICY IF EXISTS "Permitir criação de convites por admin" ON public.user_invites;
DROP POLICY IF EXISTS "Permitir atualização de convites" ON public.user_invites;

-- 5. POLICY: Qualquer pessoa pode ler convites (necessário para validar token no LoginPage)
CREATE POLICY "Permitir leitura de convites"
ON public.user_invites
FOR SELECT
TO public
USING (true);

-- 6. POLICY: Apenas admins podem criar convites
CREATE POLICY "Permitir criação de convites por admin"
ON public.user_invites
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  )
);

-- 7. POLICY: Sistema pode atualizar convites (para marcar como aceitos)
CREATE POLICY "Permitir atualização de convites"
ON public.user_invites
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 8. Criar função para expirar convites automaticamente
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
  UPDATE public.user_invites
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verificar a criação
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_invites'
ORDER BY ordinal_position;

-- 10. Verificar policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_invites';

-- ============================================
-- RESULTADO ESPERADO:
-- Tabela criada com 8 colunas:
-- - id, email, name, role, status, invited_by, expires_at, created_at
-- 
-- 3 policies criadas:
-- - Permitir leitura de convites
-- - Permitir criação de convites por admin
-- - Permitir atualização de convites
-- ============================================
