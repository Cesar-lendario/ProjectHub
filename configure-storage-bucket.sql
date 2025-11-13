-- =====================================================
-- CONFIGURAÇÃO DO BUCKET project-files NO SUPABASE
-- =====================================================
-- Este script configura o bucket para aceitar todos os tipos de arquivo

-- IMPORTANTE: Este script mostra os comandos que devem ser executados
-- MANUALMENTE no Supabase Dashboard, pois algumas configurações só
-- podem ser feitas via interface gráfica.

-- =====================================================
-- CONFIGURAÇÕES VIA DASHBOARD (MANUAL)
-- =====================================================
-- 
-- 1. Vá em: Storage > project-files > Settings (⚙️)
-- 
-- 2. Configure:
--    ✅ Public: ON (marcar como público)
--    ✅ File size limit: 52428800 (50 MB em bytes)
--    ✅ Allowed MIME types: DEIXAR VAZIO (aceita todos os tipos)
--       OU especificar:
--       - application/pdf
--       - application/msword
--       - application/vnd.openxmlformats-officedocument.wordprocessingml.document
--       - application/vnd.ms-excel
--       - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
--       - application/vnd.ms-powerpoint
--       - application/vnd.openxmlformats-officedocument.presentationml.presentation
--       - text/plain
--       - image/jpeg
--       - image/png
--       - image/gif
--       - image/webp
--       - image/svg+xml
--
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS (EXECUTAR NO SQL EDITOR)
-- =====================================================

-- Verificar políticas existentes para o bucket project-files
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (qual LIKE '%project-files%' OR with_check LIKE '%project-files%')
ORDER BY policyname;

-- =====================================================
-- VERIFICAR INFORMAÇÕES DO BUCKET
-- =====================================================

-- Listar todos os buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'project-files';

-- =====================================================
-- ATUALIZAR CONFIGURAÇÕES DO BUCKET (SE NECESSÁRIO)
-- =====================================================

-- Tornar o bucket público
UPDATE storage.buckets
SET public = true
WHERE name = 'project-files';

-- Aumentar limite de tamanho para 50MB
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE name = 'project-files';

-- Remover restrições de MIME type (permitir todos)
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE name = 'project-files';

-- OU especificar tipos permitidos (descomentar se preferir):
-- UPDATE storage.buckets
-- SET allowed_mime_types = ARRAY[
--   'application/pdf',
--   'application/msword',
--   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--   'application/vnd.ms-excel',
--   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--   'application/vnd.ms-powerpoint',
--   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
--   'text/plain',
--   'image/jpeg',
--   'image/png',
--   'image/gif',
--   'image/webp',
--   'image/svg+xml'
-- ]
-- WHERE name = 'project-files';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as configurações foram aplicadas
SELECT 
  name AS bucket_name,
  public AS is_public,
  file_size_limit / 1024 / 1024 AS size_limit_mb,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'project-files';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
--
-- INSTRUÇÕES:
-- 1. Execute as queries de UPDATE no SQL Editor
-- 2. Verifique o resultado com a query final
-- 3. Se allowed_mime_types = NULL, aceita TODOS os tipos
-- 4. Teste o upload de PDF, DOC, DOCX na aplicação
-- =====================================================

