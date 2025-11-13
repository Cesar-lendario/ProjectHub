# 🔧 Guia: Resolver Erro de Upload de Arquivos

## ❌ Erro Atual

```
StorageApiError: new row violates row-level security policy
```

Este erro acontece porque o **Supabase Storage** precisa de políticas RLS (Row Level Security) configuradas para permitir upload de arquivos.

---

## ✅ Solução Completa (Passo a Passo)

### **Passo 1: Verificar se o Bucket Existe**

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Verifique se existe um bucket chamado **`project-files`**

**Se NÃO existir:**
- Clique em **"New bucket"**
- Nome: `project-files`
- Marque: ✅ **"Public bucket"** (importante!)
- Clique em **"Create bucket"**

### **Passo 2: Configurar Políticas RLS**

1. No Supabase Dashboard, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `setup-storage-policies.sql` que criei
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no SQL Editor do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Aguarde a mensagem de sucesso

### **Passo 3: Verificar as Políticas**

Após executar o script, você deve ver na parte inferior do SQL Editor uma tabela com as políticas criadas:

```
✅ Usuários autenticados podem fazer upload em project-files
✅ Arquivos de projeto são públicos para leitura
✅ Uploader pode excluir seus arquivos
✅ Uploader pode atualizar seus arquivos
```

### **Passo 4: Testar o Upload**

1. Volte para a aplicação ProjectHub
2. Vá para a página de **Projetos**
3. Clique no botão **⬆️ Upload** de qualquer projeto
4. Selecione um arquivo
5. Clique em **"Enviar Arquivo"**
6. ✅ **O upload deve funcionar agora!**

---

## 🔍 Verificação Adicional

### Verificar se o usuário está autenticado

No console do navegador (F12), execute:

```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log('Usuário:', user)
```

Se retornar `null`, você precisa fazer login novamente.

### Verificar políticas do Storage

Execute esta query no SQL Editor do Supabase:

```sql
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
```

Deve retornar pelo menos 4 políticas para o bucket `project-files`.

---

## 🐛 Troubleshooting

### Erro: "Could not find the 'uploaded_by' column"

❌ **A coluna `uploaded_by` está faltando na tabela `attachments`!**

**Solução:**
1. Execute o script **`add-uploaded-by-column.sql`** no SQL Editor do Supabase
2. Execute também o script **`attachments-policies.sql`** para liberar SELECT/DELETE
3. Tente o upload novamente

### Erro: "operator does not exist: text = uuid"

✅ **RESOLVIDO!** O script foi atualizado para corrigir esse erro de conversão de tipos. Execute o script novamente.

O problema era a comparação `auth.uid()::text = owner` - o correto é `auth.uid() = owner` (ambos são UUID).

### Erro persiste após executar o script?

**1. Verifique se o bucket é PÚBLICO:**
- Vá em Storage > project-files
- Clique em ⚙️ (Settings)
- Certifique-se que está marcado: ✅ **"Public bucket"**

**2. Limpe o cache do navegador:**
- Pressione `Ctrl + Shift + Delete`
- Marque "Cache" e "Cookies"
- Clique em "Limpar dados"
- Recarregue a página (F5)

**3. Faça logout e login novamente:**
- Isso renova o token de autenticação do Supabase

**4. Verifique o console do navegador:**
- Pressione F12
- Vá na aba "Console"
- Procure por erros em vermelho
- Me envie a mensagem de erro completa

### Erro: "Bucket not found"

O bucket `project-files` não existe. Volte ao **Passo 1** e crie o bucket.

### Erro: "Invalid JWT"

Seu token de autenticação expirou. Faça logout e login novamente.

---

## 📝 O que o script faz?

O arquivo `setup-storage-policies.sql` cria 4 políticas para o bucket `project-files`:

1. **INSERT** - Permite usuários autenticados fazerem upload
2. **SELECT** - Permite leitura pública dos arquivos
3. **DELETE** - Permite que o uploader delete seus arquivos
4. **UPDATE** - Permite que o uploader atualize seus arquivos

E também configura as mesmas políticas para o bucket `avatars` (fotos de perfil).

---

## ✨ Após a Configuração

Depois de executar o script, você poderá:

✅ Fazer upload de arquivos direto do card do projeto
✅ Ver todos os arquivos na página "Arquivos" do menu lateral
✅ Fazer download dos arquivos
✅ Deletar arquivos que você enviou

---

## 🆘 Precisa de Ajuda?

Se o erro persistir após seguir todos os passos:

1. Me envie um print do erro completo do console
2. Me envie um print da lista de buckets no Supabase Storage
3. Me envie o resultado da query de verificação de políticas

Vou te ajudar a resolver! 🚀

