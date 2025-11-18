-- Verificar se o ID do profile existe na tabela users
-- Execute esta query para verificar o mapeamento

-- Verificar o usuário atual
SELECT 
  id,
  name,
  email,
  auth_id,
  role
FROM users
WHERE id = 'f88ce2ec-07a3-4e4a-9c7a-604db598becd';

-- Verificar também por auth.uid() (se estiver logado)
SELECT 
  id,
  name,
  email,
  auth_id,
  role
FROM users
WHERE auth_id = auth.uid();

-- Ver todos os usuários para comparar
SELECT 
  id,
  name,
  email,
  auth_id,
  role
FROM users
ORDER BY name;
