# 🔧 Correção: Exclusão de Anotações Não Funciona

## ❌ Problema Identificado

A exclusão de anotações retorna `{ data: [], error: null }` mas a nota não é removida do banco de dados. Isso indica que as políticas RLS (Row Level Security) estão bloqueando silenciosamente a exclusão.

## 🔍 Causa Raiz

As políticas RLS de DELETE na tabela `project_notes` não estão funcionando corretamente. Possíveis causas:

1. **Formato do role**: O role pode estar armazenado como `'admin'` (minúsculo) ou `'Administrador'` (com maiúscula)
2. **Mapeamento auth_id**: O `auth.uid()` pode não estar correspondendo corretamente ao `users.auth_id`
3. **Políticas RLS incorretas**: As políticas podem não estar verificando corretamente as condições

## ✅ Solução

### Passo 1: Executar Script SQL de Correção

Execute o script `supabase_fix_project_notes_delete.sql` no SQL Editor do Supabase:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase_fix_project_notes_delete.sql`
4. Copie e execute todo o conteúdo
5. Verifique se as políticas foram criadas corretamente

### Passo 2: Verificar o Formato do Role

Execute esta query para verificar como os roles estão armazenados:

```sql
SELECT DISTINCT role FROM users;
```

Se o resultado mostrar `'Administrador'` (com maiúscula), o script já está ajustado para funcionar.

### Passo 3: Testar a Exclusão

1. Abra o modal "Condição Atual" na página de tarefas
2. Tente excluir uma anotação
3. Verifique o console do navegador para ver os logs detalhados

## 📋 O que foi corrigido no código

### 1. Detecção de Exclusão Bloqueada

O código agora verifica se a exclusão realmente aconteceu:

```typescript
const wasDeleted = data && data.length > 0;

if (!wasDeleted) {
  throw new Error('A exclusão foi bloqueada pelas políticas de segurança...');
}
```

### 2. Logs Melhorados

Logs detalhados foram adicionados para facilitar o debug:

- Log do usuário atual e seu role
- Log do autor da nota
- Log da resposta completa da exclusão
- Erro claro quando a exclusão é bloqueada

## 🔒 Políticas RLS Corrigidas

### Política para Admins

```sql
CREATE POLICY "Admins can delete any note"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND LOWER(users.role) = LOWER('admin')
    )
  );
```

**Características:**
- Verifica se o usuário logado (`auth.uid()`) corresponde ao `users.auth_id`
- Verifica se o role é admin (case-insensitive usando `LOWER`)
- Permite deletar qualquer anotação

### Política para Usuários

```sql
CREATE POLICY "Users can delete their own notes"
  ON project_notes
  FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );
```

**Características:**
- Verifica se o usuário logado é o autor da nota
- Permite deletar apenas suas próprias anotações

## 🧪 Como Testar

### Teste 1: Verificar Políticas

Execute no SQL Editor:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_clause
FROM pg_policies
WHERE tablename = 'project_notes'
ORDER BY cmd, policyname;
```

Você deve ver 2 políticas de DELETE:
- "Admins can delete any note"
- "Users can delete their own notes"

### Teste 2: Verificar Usuário Atual

Execute enquanto estiver logado:

```sql
SELECT 
  auth.uid() as current_auth_id,
  u.id as user_id,
  u.name,
  u.role,
  u.auth_id,
  CASE 
    WHEN u.auth_id = auth.uid() THEN 'SIM'
    ELSE 'NÃO'
  END as is_logged_user,
  CASE 
    WHEN LOWER(u.role) = LOWER('admin') THEN 'SIM'
    ELSE 'NÃO'
  END as is_admin
FROM users u
WHERE u.auth_id = auth.uid();
```

### Teste 3: Testar Exclusão

1. Abra o console do navegador (F12)
2. Abra o modal "Condição Atual"
3. Tente excluir uma anotação
4. Verifique os logs no console

**Logs esperados:**
```
[ProjectConditionModal] Excluindo nota: <id>
[ProjectConditionModal] Usuário atual: { id: "...", role: "..." }
[ProjectConditionModal] Autor da nota: <id>
[ProjectConditionModal] Resposta da exclusão: { data: [...], error: null }
[ProjectConditionModal] ✅ Nota excluída com sucesso
```

**Se a exclusão falhar:**
```
[ProjectConditionModal] ⚠️ EXCLUSÃO BLOQUEADA PELA RLS
[ProjectConditionModal] A exclusão foi bloqueada pelas políticas de segurança...
```

## 🐛 Troubleshooting

### Problema: "Exclusão bloqueada pela RLS"

**Possíveis causas:**
1. O `auth.uid()` não corresponde ao `users.auth_id`
2. O role não está como 'admin' (verificar formato)
3. As políticas RLS não foram criadas corretamente

**Solução:**
1. Execute o script SQL de correção novamente
2. Verifique o formato do role na tabela users
3. Verifique se `users.auth_id = auth.uid()` retorna true

### Problema: "Erro ao excluir: permission denied"

**Causa:** As políticas RLS estão bloqueando explicitamente

**Solução:**
1. Verifique se as políticas foram criadas
2. Verifique se o usuário tem permissão (é admin ou autor)
3. Execute o script SQL de correção

## 📝 Arquivos Modificados

- ✅ `components/tasks/ProjectConditionModal.tsx` - Detecção de exclusão bloqueada
- ✅ `supabase_fix_project_notes_delete.sql` - Script SQL de correção
- ✅ `INSTRUCOES_CORRIGIR_EXCLUSAO_ANOTACOES.md` - Este arquivo

## ✅ Checklist de Verificação

- [ ] Script SQL executado no Supabase
- [ ] Políticas RLS criadas e visíveis
- [ ] Formato do role verificado
- [ ] Teste de exclusão realizado
- [ ] Logs no console verificados
- [ ] Exclusão funcionando corretamente











