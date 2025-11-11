# Configuração do Supabase para ProjectHub

Este guia explica como configurar o banco de dados e storage do Supabase para o ProjectHub.

## ✅ Credenciais Configuradas

As credenciais do Supabase já estão configuradas em `services/supabaseClient.ts`:

- **URL**: `https://siujbzskkmjxipcablao.supabase.co`
- **Anon Key**: Configurada
- **Service Role**: Disponível (use apenas no backend)

## 📦 Tabelas Existentes

As seguintes tabelas já existem no seu banco de dados:

1. ✅ `users` (3 registros)
2. ✅ `profiles` (4 colunas)
3. ✅ `projects` (3 registros, 14 colunas)
4. ✅ `tasks` (37 registros, 11 colunas)
5. ✅ `project_team` (1 registro, 3 colunas)
6. ✅ `attachments` (0 registros, 7 colunas)
7. ✅ `messages` (0 registros, 6 colunas)

## 🚀 Próximos Passos

### 1. Configurar Storage Buckets

#### Bucket: `avatars` (Fotos de perfil)

1. Acesse **Storage** no Supabase Dashboard
2. Crie um novo bucket chamado `avatars`
3. Configurações:
   - ✅ Public bucket
   - Tamanho máximo: 2 MB
   - Tipos permitidos: image/png, image/jpeg, image/jpg, image/webp

4. Configure as políticas RLS:

```sql
-- Política de Upload (INSERT)
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Política de Leitura (SELECT)
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política de Exclusão (DELETE)
CREATE POLICY "Usuários podem excluir seus próprios avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = owner);
```

#### Bucket: `project-files` (Arquivos de projetos)

1. Crie um novo bucket chamado `project-files`
2. Configurações:
   - ✅ Public bucket
   - Tamanho máximo: 10 MB
   - Tipos permitidos: deixe em branco (permitir todos) ou especifique:
     - application/pdf
     - application/msword
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document
     - image/*

3. Configure as políticas RLS:

```sql
-- Política de Upload (INSERT)
CREATE POLICY "Membros de projeto podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Política de Leitura (SELECT)
CREATE POLICY "Arquivos de projeto são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');

-- Política de Exclusão (DELETE)
CREATE POLICY "Uploader pode excluir arquivo"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files' AND auth.uid()::text = owner);
```

### 2. Verificar Row Level Security (RLS)

Certifique-se de que as políticas RLS estão configuradas para as tabelas:

#### Tabela: `users`

```sql
-- Permitir leitura pública
CREATE POLICY "Usuários são visíveis publicamente"
ON users FOR SELECT
TO public
USING (true);

-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY "Usuários podem atualizar próprio perfil"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);

-- Apenas autenticados podem criar usuários
CREATE POLICY "Autenticados podem criar usuários"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);
```

#### Tabela: `projects`

```sql
-- Todos podem ver projetos
CREATE POLICY "Projetos são visíveis"
ON projects FOR SELECT
TO authenticated
USING (true);

-- Membros da equipe podem criar projetos
CREATE POLICY "Autenticados podem criar projetos"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Membros da equipe podem atualizar projetos
CREATE POLICY "Membros podem atualizar projetos"
ON projects FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_team
    WHERE project_team.project_id = projects.id
    AND project_team.user_id = auth.uid()::text
    AND project_team.role IN ('admin', 'editor')
  )
);

-- Apenas admins do projeto podem deletar
CREATE POLICY "Admins podem deletar projetos"
ON projects FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_team
    WHERE project_team.project_id = projects.id
    AND project_team.user_id = auth.uid()::text
    AND project_team.role = 'admin'
  )
);
```

#### Tabela: `tasks`

```sql
-- Membros podem ver tarefas de seus projetos
CREATE POLICY "Membros veem tarefas"
ON tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_team
    WHERE project_team.project_id = tasks.project_id
    AND project_team.user_id = auth.uid()::text
  )
);

-- Membros podem criar tarefas
CREATE POLICY "Membros podem criar tarefas"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_team
    WHERE project_team.project_id = tasks.project_id
    AND project_team.user_id = auth.uid()::text
    AND project_team.role IN ('admin', 'editor')
  )
);

-- Membros podem atualizar tarefas
CREATE POLICY "Membros podem atualizar tarefas"
ON tasks FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_team
    WHERE project_team.project_id = tasks.project_id
    AND project_team.user_id = auth.uid()::text
    AND project_team.role IN ('admin', 'editor')
  )
);

-- Membros podem deletar tarefas
CREATE POLICY "Membros podem deletar tarefas"
ON tasks FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_team
    WHERE project_team.project_id = tasks.project_id
    AND project_team.user_id = auth.uid()::text
    AND project_team.role IN ('admin', 'editor')
  )
);
```

### 3. Popular Dados Iniciais (Opcional)

Se as tabelas estiverem vazias, você pode usar os dados mock do arquivo `constants.ts` como referência para popular o banco.

### 4. Testar a Aplicação

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Faça login na aplicação

3. Verifique se:
   - ✅ Projetos são carregados do banco
   - ✅ Tarefas aparecem corretamente
   - ✅ Usuários estão listados
   - ✅ Upload de avatar funciona
   - ✅ Upload de arquivos de projeto funciona
   - ✅ Notificações são registradas no banco

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme que a chave ANON está configurada
- Verifique se o projeto Supabase está ativo

### Erro: "Permission denied"
- Verifique as políticas RLS nas tabelas
- Confirme que o usuário está autenticado
- Verifique se as foreign keys estão configuradas corretamente

### Erro: "Invalid storage path"
- Confirme que os buckets `avatars` e `project-files` existem
- Verifique se os buckets estão marcados como públicos
- Confirme as políticas de storage

### Dados não aparecem
- Verifique o console do navegador para erros
- Use o Supabase Dashboard para verificar se os dados existem
- Confirme que as relações entre tabelas estão corretas

## 📚 Recursos Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage com Supabase](https://supabase.com/docs/guides/storage)
- [TypeScript com Supabase](https://supabase.com/docs/guides/api/generating-types)

## ✨ Próximas Melhorias

- [ ] Implementar Realtime para atualizações em tempo real
- [ ] Adicionar triggers para auditoria de alterações
- [ ] Implementar soft delete com campo `deleted_at`
- [ ] Adicionar índices para otimizar queries complexas
- [ ] Configurar backup automático do banco de dados

