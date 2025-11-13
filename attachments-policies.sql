-- ============================================
-- CONFIGURAÇÃO DE POLÍTICAS RLS PARA attachments
-- Permite excluir arquivos enviados por membros autorizados
-- ============================================

-- 1. Garantir que o RLS está habilitado
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas anteriores conflitantes (opcional)
DROP POLICY IF EXISTS "Attachments delete policy" ON public.attachments;
DROP POLICY IF EXISTS "Attachments select policy" ON public.attachments;
DROP POLICY IF EXISTS "delete_attachment_if_owner" ON public.attachments;
DROP POLICY IF EXISTS "attachments_select_policy" ON public.attachments;

-- 3. Permitir que membros do projeto leiam anexos
CREATE POLICY "Attachments select policy"
ON public.attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.project_team pt
    JOIN public.users u ON u.id = pt.user_id
    WHERE pt.project_id = attachments.project_id
      AND u.auth_id::uuid = auth.uid()
  )
  OR uploaded_by = auth.uid()
);

-- 4. Permitir exclusão por quem enviou ou por admins/editores do projeto
CREATE POLICY "Attachments delete policy"
ON public.attachments
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.project_team pt
    JOIN public.users u ON u.id = pt.user_id
    WHERE pt.project_id = attachments.project_id
      AND u.auth_id::uuid = auth.uid()
      AND pt.role IN ('admin', 'editor')
  )
);

-- 5. Verificar políticas aplicadas
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'attachments';


