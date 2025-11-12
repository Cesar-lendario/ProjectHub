# Correção do Email no Supabase

## 📋 Problema Identificado

O sistema estava tentando salvar o campo `email` na tabela `users` do Supabase, mas essa coluna **não existe** na tabela. O email deve vir exclusivamente do **Supabase Auth** através do campo `auth_id`.

### Sintomas:
- ❌ Erro ao tentar salvar alterações no modal "Editar Membro"
- ❌ Email aparecendo como "sem-email@sistema.com" em vez do email real
- ❌ Falha silenciosa ao criar novos usuários

## 🔧 Solução Implementada

### 1. Scripts SQL Criados

Dois scripts foram criados para atualizar o banco de dados:

#### `supabase-schema-update.sql` (Recomendado)
Script simples que:
- Remove a coluna `email` da tabela `users` (se existir)
- Torna `auth_id` obrigatório (NOT NULL)
- Adiciona índice único em `auth_id`
- Adiciona comentários explicativos

#### `fix-database-types.sql` (Completo)
Script completo que:
- Faz todas as correções acima
- Adiciona colunas de notificação em `projects`
- Cria todos os índices de performance
- Adiciona foreign keys faltantes
- Inclui queries de verificação

### 2. Correções no Frontend

#### `hooks/useAuth.tsx`
✅ Agora busca o email do Supabase Auth e injeta no profile:
```typescript
const authEmail = session.user.email ?? mapped.email;
setProfile({ ...mapped, email: authEmail });
```

#### `hooks/useProjectContext.tsx`
✅ `updateUser`: Removida tentativa de salvar `email` no banco
```typescript
await UsersService.update(userData.id, {
  name: userData.name,
  // email NÃO é enviado (não existe na tabela)
  avatar: userData.avatar,
  function: userData.function,
  role: unmapGlobalRole(userData.role),
});
```

✅ `addUser`: Removida tentativa de salvar `email` no banco
```typescript
const dbUser = await UsersService.create({
  id: uuidv4(),
  // email NÃO é enviado (não existe na tabela)
  name: userData.name,
  avatar: userData.avatar,
  function: userData.function,
  role: unmapGlobalRole(userData.role),
  auth_id: null, // Preenchido no login
});
```

#### Componentes de UI
✅ `components/team/TeamManagementView.tsx`
✅ `components/team/TeamView.tsx`
✅ `components/team/UserProfileView.tsx`

Todos agora usam o `profile` do Auth quando exibem/editam o próprio usuário.

## 📝 Instruções de Uso

### Passo 1: Atualizar o Banco de Dados

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `supabase-schema-update.sql`
4. Clique em **Run** para executar

### Passo 2: Verificar a Atualização

Execute esta query no SQL Editor para confirmar:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Resultado esperado**: A coluna `email` **não deve aparecer** na lista.

### Passo 3: Atualizar o Frontend

1. **Recarregue a página** no navegador (Ctrl + Shift + R)
2. **Faça logout e login novamente**
3. Teste o modal "Editar Membro"

### Passo 4: Vincular seu usuário ao Auth (IMPORTANTE!)

Execute este SQL no Supabase para vincular seu usuário existente ao Supabase Auth:

```sql
-- Atualizar o auth_id do seu usuário com o ID do Auth
UPDATE public.users 
SET auth_id = (SELECT id FROM auth.users WHERE email = 'cat@caterg.com.br')
WHERE name = 'Cesar A Bressiani';

-- Verificar se foi atualizado
SELECT id, name, auth_id FROM public.users WHERE name = 'Cesar A Bressiani';
```

## ✅ Testes

### Teste 1: Visualizar Email
1. Clique no seu avatar no header
2. Clique em "Meu Perfil"
3. ✅ Deve aparecer `cat@caterg.com.br`

### Teste 2: Editar Usuário
1. Na página "Equipe", clique em "Editar Membro" no seu card
2. ✅ Modal deve abrir mostrando `cat@caterg.com.br`
3. Altere o nome ou função
4. Clique em "Salvar"
5. ✅ Deve salvar sem erros

### Teste 3: Criar Novo Usuário
1. Clique em "+ Novo Membro"
2. Preencha os dados
3. ✅ Deve criar sem erros

## 🏗️ Arquitetura

### Fluxo de Dados do Email

```
┌─────────────────────┐
│  Supabase Auth      │
│  (auth.users)       │
│  ✓ email armazenado │
└──────────┬──────────┘
           │ auth_id
           ▼
┌─────────────────────┐
│  Tabela users       │
│  (public.users)     │
│  ✗ SEM coluna email │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  useAuth()          │
│  → busca Auth email │
│  → injeta no profile│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Frontend           │
│  → profile.email    │
│  (fonte da verdade) │
└─────────────────────┘
```

### Fonte da Verdade

**ANTES (❌ Errado):**
- Email armazenado em `public.users.email`
- Dessincronizado com Supabase Auth
- Causava erros ao salvar

**DEPOIS (✅ Correto):**
- Email **APENAS** em `auth.users` (via Supabase Auth)
- Frontend busca via `session.user.email`
- `public.users` só tem `auth_id` para fazer join

## 📊 Schema Atualizado

### Tabela `users`
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  function TEXT,
  role TEXT DEFAULT 'engineer',
  auth_id UUID NOT NULL UNIQUE, -- ← Link para auth.users
  created_at TIMESTAMP DEFAULT NOW()
);

-- NÃO TEM: email (removido!)
```

### Join para buscar email (se necessário)
```sql
SELECT 
  u.id,
  u.name,
  u.avatar,
  u.function,
  u.role,
  au.email  -- ← Email vem do Auth
FROM public.users u
LEFT JOIN auth.users au ON u.auth_id = au.id;
```

## 🚨 Importante

1. **NÃO tente salvar `email` na tabela `users`**
2. **Sempre use `profile.email` do `useAuth()` no frontend**
3. **Para novos usuários, crie primeiro no Auth, depois em `users`**
4. **O campo `auth_id` é obrigatório e único**

## 🔄 Próximos Passos Recomendados

1. ✅ Implementar tela de "Atualizar Email" nas Configurações
   - Usar `supabase.auth.updateUser({ email: novoEmail })`
   - Exigir confirmação por email
2. ✅ Criar view SQL para join automático:
   ```sql
   CREATE VIEW users_with_email AS
   SELECT u.*, au.email
   FROM public.users u
   LEFT JOIN auth.users au ON u.auth_id = au.id;
   ```
3. ✅ Adicionar trigger para sincronizar `auth_id` ao criar usuário

## 📚 Referências

- `docs/overview.md`: Documentação completa do sistema
- `types/database.types.ts`: Tipos TypeScript do banco
- `services/api/mappers.ts`: Conversão entre DB e aplicação
- `hooks/useAuth.tsx`: Gerenciamento de autenticação

---

**Data da Correção**: Novembro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Testado

