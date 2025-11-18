-- ============================================
-- MIGRAÇÃO: Corrigir tabela users e triggers
-- ============================================

-- 1. Verificar se a função de trigger existe
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. Criar a função que será executada quando um usuário se cadastrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, name, role, avatar, function)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'engineer'),
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar o trigger que chama a função acima
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Sincronizar usuários existentes do Auth para a tabela users
-- (Isso vai pegar os usuários que você já cadastrou e adicionar na tabela users)
INSERT INTO public.users (id, auth_id, name, role, avatar, function)
SELECT 
  gen_random_uuid() as id,
  au.id as auth_id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as name,
  COALESCE(au.raw_user_meta_data->>'role', 'engineer') as role,
  NULL as avatar,
  NULL as function
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.auth_id = au.id
);

-- 5. Verificar quantos usuários foram sincronizados
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'supervisor' THEN 1 END) as supervisors,
  COUNT(CASE WHEN role = 'engineer' THEN 1 END) as engineers
FROM public.users;

-- ============================================
-- RESULTADO ESPERADO:
-- Você deverá ver algo como:
-- total_users | admins | supervisors | engineers
-- ------------+--------+-------------+-----------
--           2 |      1 |           1 |         0
-- ============================================
