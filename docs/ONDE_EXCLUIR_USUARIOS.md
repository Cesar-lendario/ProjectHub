# 🔍 Onde Encontrar o Botão de Excluir Usuários

## 📍 Localização dos Botões

Existem **3 lugares** onde você pode excluir membros como administrador:

---

## 1️⃣ **Página "Equipe" - Vista de Cards**

### Como Acessar:
1. Menu lateral → Clique em **"Equipe"**
2. Você verá cards com todos os membros

### Onde está o botão:
- **Canto superior direito de cada card**
- Dois botões pequenos em círculo:
  - ✏️ Editar (azul)
  - 🗑️ Excluir (vermelho)

```
┌────────────────────────────┐
│          [✏️] [🗑️]        │ ← Botões aqui no topo direito
│                            │
│        [Avatar]            │
│      Nome do Usuário       │
│         [Role]             │
│                            │
│    📊 Estatísticas         │
└────────────────────────────┘
```

**Importante:** Os botões só aparecem se você for **Admin global**!

---

## 2️⃣ **Página "Equipe" - Perfil do Usuário**

### Como Acessar:
1. Menu lateral → **"Equipe"**
2. **Clique no card** de qualquer membro
3. Abre a página de perfil detalhado

### Onde está o botão:
- **Canto superior direito da página**
- Dois botões maiores:
  - [Editar] (cinza)
  - [🗑️ Excluir] (vermelho)

```
┌─────────────────────────────────────────────┐
│ ← Voltar          [Editar] [🗑️ Excluir]    │ ← Botões aqui
├─────────────────────────────────────────────┤
│                                             │
│         [Grande Card de Perfil]             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 3️⃣ **Página "Admin - Usuários" (Tabela)**

### Como Acessar:
1. Menu lateral → **"Admin - Usuários"**
2. Você verá uma tabela com todos os usuários

### Onde está o botão:
- **Coluna "Ações" à direita**
- Dois ícones por linha:
  - ✏️ Editar
  - 🗑️ Excluir

```
┌─────────────────────────────────────────────┐
│ Usuário  │ Email  │ Função │ Perfil │ Ações │
├─────────────────────────────────────────────┤
│ João     │ ...    │ ...    │ Admin  │ ✏️ 🗑️ │
│ Maria    │ ...    │ ...    │ Eng    │ ✏️ 🗑️ │ ← Botões aqui
└─────────────────────────────────────────────┘
```

---

## ❓ Por que não vejo os botões?

### Possível Causa 1: Você não é Admin
**Verificar:**
- Olhe no canto superior direito (seu avatar)
- Seu perfil deve ter role = **"Admin"**
- Se for "Supervisor" ou "Engineer", você **NÃO** verá os botões

**Solução:**
- Peça a outro admin para promover você
- Ou acesse o banco de dados e altere seu role

---

### Possível Causa 2: Tentando excluir a si mesmo
Os botões ficam **desabilitados** ou **ocultos** quando:
- Você tenta excluir seu próprio perfil
- Está vendo o perfil do único administrador do sistema

---

### Possível Causa 3: Estado do Admin não está sendo reconhecido

**Verificar no Console do Navegador:**

1. Pressione **F12** (DevTools)
2. Vá na aba **Console**
3. Digite:
```javascript
// Ver seu perfil atual
localStorage.getItem('sb-siujbzskkmjxipcablao-auth-token')

// Ver dados do contexto (se disponível)
// Após página carregar, você pode ver no React DevTools
```

4. Verifique se o `profile.role` está como `"admin"`

---

## 🔧 Como Garantir que Você é Admin

### Opção 1: Via Supabase Dashboard

1. Acesse https://app.supabase.com
2. Vá no seu projeto
3. Table Editor → `users`
4. Encontre seu email
5. Coluna `role` → Altere para `"admin"`

### Opção 2: Via SQL no Supabase

```sql
-- Substitua 'seu-email@exemplo.com' pelo seu email
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

---

## 🎯 Teste Rápido

Para confirmar que você é admin:

1. Vá em **"Admin - Usuários"** no menu
2. Se você **NÃO conseguir acessar** esta página:
   - Você verá: "Acesso negado. Esta página é apenas para administradores."
   - **Significa que você NÃO é admin**

3. Se conseguir ver a página:
   - ✅ Você é admin
   - Os botões devem estar visíveis na coluna "Ações"

---

## 📸 Screenshots dos Locais

### 1. Cards na Página Equipe
Os botões aparecem no **canto superior direito** de cada card:

```
╔════════════════════════════╗
║       [✏️ ícone] [🗑️ ícone] ║  ← AQUI!
║                            ║
║     👤                     ║
║     Nome                   ║
║     [Badge Role]           ║
║                            ║
║   📊 Estatísticas          ║
╚════════════════════════════╝
```

### 2. Perfil do Usuário
Botões no **topo da página à direita**:

```
┌──────────────────────────────────────┐
│ ← Voltar    [Editar] [🗑️ Excluir]   │  ← AQUI!
└──────────────────────────────────────┘
```

### 3. Tabela de Admin
Botões na **última coluna** de cada linha:

```
│ Maria    │ maria@... │ Dev  │ Engineer │ ✏️ 🗑️ │  ← AQUI!
│ João     │ joao@...  │ PM   │ Super    │ ✏️ 🗑️ │  ← AQUI!
```

---

## ⚠️ Limitações Importantes

### Você NÃO pode excluir:
- ❌ **Você mesmo** (seu próprio perfil)
- ❌ **Outro admin** se for o único admin do sistema
- ❌ **Qualquer usuário** se você não for admin

### Botões desabilitados:
Na tabela de Admin, o botão 🗑️ fica **cinza e desabilitado** para:
- Seu próprio perfil
- O único admin do sistema

---

## 🆘 Ainda não vejo os botões?

### Debug Passo a Passo:

1. **Confirme que é admin:**
```javascript
// Cole no Console do DevTools (F12)
console.log('Meu perfil:', JSON.parse(
  localStorage.getItem('sb-siujbzskkmjxipcablao-auth-token')
));
```

2. **Verifique se o componente está recebendo isAdmin:**
- Abra React DevTools
- Encontre o componente `TeamMemberCard` ou `UserManagementView`
- Verifique a prop `isAdmin` (deve ser `true`)

3. **Limpe o cache:**
```bash
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```
- Marque "Cookies e dados de sites"
- Limpe e faça login novamente

4. **Recarregue a página:**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

## 💡 Dica de Ouro

**O jeito mais fácil de ver os botões:**

1. Vá em **"Admin - Usuários"** (menu lateral)
2. Se você for admin, verá a **tabela completa**
3. Os botões 🗑️ estão bem visíveis na última coluna
4. Clique em qualquer 🗑️ (exceto o seu próprio)
5. O modal profissional de exclusão abrirá! 🎉

---

## 📞 Ainda com problemas?

Se depois de tudo isso você ainda não vê os botões:

1. Verifique o console do navegador (F12) por erros
2. Confirme que está logado com a conta certa
3. Verifique a role no banco de dados
4. Tente fazer logout e login novamente
5. Limpe cookies e cache do navegador

---

## ✅ Checklist Final

- [ ] Sou admin (role = 'admin')
- [ ] Fiz login com a conta certa
- [ ] Estou na página "Equipe" ou "Admin - Usuários"
- [ ] Não estou tentando excluir a mim mesmo
- [ ] Limpei o cache do navegador
- [ ] Recarreguei a página (Ctrl + Shift + R)

Se todos marcados e ainda não vê → problema técnico, verifique console!

