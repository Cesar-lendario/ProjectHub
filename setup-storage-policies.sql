-- ============================================
-- CONFIGURAÇÃO DE POLÍTICAS RLS PARA STORAGE
-- ProjectHub - Supabase Storage Policies
-- ============================================

-- Este script configura as políticas de Row Level Security (RLS)
-- para os buckets de storage do Supabase

-- ============================================
-- 1. BUCKET: project-files
-- ============================================

-- IMPORTANTE: Antes de executar este script, certifique-se de que:
-- 1. O bucket 'project-files' existe no Supabase Storage
-- 2. O bucket está configurado como PÚBLICO

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload em project-files" ON storage.objects;
DROP POLICY IF EXISTS "Membros de projeto podem fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Arquivos de projeto são públicos" ON storage.objects;
DROP POLICY IF EXISTS "Uploader pode excluir arquivo" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus arquivos" ON storage.objects;

-- Política 1: Permitir UPLOAD (INSERT) para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload em project-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Política 2: Permitir LEITURA (SELECT) pública
CREATE POLICY "Arquivos de projeto são públicos para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- Política 3: Permitir EXCLUSÃO (DELETE) pelo dono do arquivo
CREATE POLICY "Uploader pode excluir seus arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' 
  AND auth.uid() = owner
);

-- Política 4: Permitir ATUALIZAÇÃO (UPDATE) pelo dono do arquivo
CREATE POLICY "Uploader pode atualizar seus arquivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-files' 
  AND auth.uid() = owner
);

-- ============================================
-- 2. BUCKET: avatars (caso não esteja configurado)
-- ============================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload em avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatares são públicos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus avatares" ON storage.objects;

-- Política 1: Permitir UPLOAD (INSERT) para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload em avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Política 2: Permitir LEITURA (SELECT) pública
CREATE POLICY "Avatares são públicos para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política 3: Permitir EXCLUSÃO (DELETE) pelo dono
CREATE POLICY "Usuários podem excluir seus próprios avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- Política 4: Permitir ATUALIZAÇÃO (UPDATE) pelo dono
CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid() = owner
);

-- ============================================
-- 3. VERIFICAÇÃO DE POLÍTICAS
-- ============================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script completo
-- 4. Verifique se não há erros
-- 5. Teste o upload na aplicação
--
-- TROUBLESHOOTING:
-- Se o erro persistir, verifique:
-- 1. O bucket 'project-files' existe?
-- 2. O bucket está marcado como "público"?
-- 3. O usuário está autenticado na aplicação?
-- 4. Limpe o cache do navegador e tente novamente
-- ============================================

