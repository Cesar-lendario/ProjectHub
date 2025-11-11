# 🧹 Como Limpar Cache do Navegador (Firefox/Mozilla)

## 🎯 Problema

O navegador está usando a **versão antiga** do código JavaScript/CSS em cache, mesmo depois de fazer um novo build. Isso faz com que as mudanças não apareçam no navegador.

## ✅ Soluções (em ordem de preferência)

### 1. 🔄 Hard Refresh (Mais Rápido)

**Windows:**
```
Ctrl + Shift + R
ou
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
```

Isso força o navegador a baixar todos os arquivos novamente, ignorando o cache.

---

### 2. 🗑️ Limpar Cache Completo do Firefox

#### Passo a Passo:

1. Abra o Firefox
2. Pressione `Ctrl + Shift + Delete` (Windows) ou `Cmd + Shift + Delete` (Mac)
3. Na janela que abrir:
   - ✅ Marque **"Cache"**
   - ✅ Marque **"Dados de sites e cookies"** (se quiser fazer logout)
   - Escolha **"Tudo"** no intervalo de tempo
4. Clique em **"Limpar agora"**

#### OU pelo Menu:

1. Clique nas **três linhas** no canto superior direito (☰)
2. **Configurações** → **Privacidade e Segurança**
3. Role até **"Cookies e dados de sites"**
4. Clique em **"Limpar dados..."**
5. Marque **"Cache de conteúdo web"**
6. Clique em **"Limpar"**

---

### 3. 🚀 Modo de Desenvolvimento (Recomendado)

Em vez de usar o build (`npm run build`), use o modo de desenvolvimento:

```bash
npm run dev
```

**Vantagens:**
- ✅ Atualização automática ao salvar arquivos (Hot Reload)
- ✅ Não precisa limpar cache
- ✅ Mais rápido para testar mudanças

**URL:** Geralmente `http://localhost:5173` ou `http://localhost:3000`

---

### 4. 🔧 Modo Desenvolvedor do Firefox (Para Testes)

1. Pressione `F12` para abrir as Ferramentas de Desenvolvimento
2. Vá na aba **"Rede"** (Network)
3. Clique com o botão direito → **"Desabilitar cache"**
4. Mantenha o DevTools aberto enquanto navega
5. Recarregue a página (`F5`)

---

### 5. 🆕 Janela Privada/Anônima (Teste Rápido)

1. Pressione `Ctrl + Shift + P` (Windows) ou `Cmd + Shift + P` (Mac)
2. Abra a aplicação na janela privada
3. Teste se funciona

Se funcionar na janela privada, o problema é definitivamente o cache.

---

### 6. 🔒 Limpar Cache do Service Worker (Avançado)

Se a aplicação usa Service Workers:

1. Abra `F12` (DevTools)
2. Vá em **"Storage"** (Armazenamento)
3. No menu lateral esquerdo:
   - Clique em **"Service Workers"** → **"Unregister"**
   - Clique em **"Cache Storage"** → Delete todos os caches
   - Clique em **"IndexedDB"** → Delete se houver
4. Feche e abra o navegador novamente

---

## 🎯 Checklist de Verificação

Depois de limpar o cache, verifique:

- [ ] O badge "👑 ADMIN" aparece no header?
- [ ] Os botões ✏️ e 🗑️ aparecem nos cards da equipe?
- [ ] O console do navegador (F12) não mostra erros?
- [ ] A versão do JavaScript é a mais recente? (verifique o timestamp dos arquivos)

---

## 🐛 Debug: Como Verificar se o Cache Foi Limpo

### 1. Verificar Versão dos Arquivos JavaScript

1. Abra `F12` (DevTools)
2. Vá na aba **"Rede"** (Network)
3. Recarregue a página (`F5`)
4. Procure por `index-[hash].js` (ex: `index-CTRHc1y3.js`)
5. Verifique se o **hash mudou** após o novo build

### 2. Verificar Console por Erros

1. Abra `F12` (DevTools)
2. Vá na aba **"Console"**
3. Procure por erros em vermelho
4. Se houver erros, copie e cole aqui

### 3. Verificar Cookies/Session

Se o problema for com autenticação:

1. `F12` → **"Storage"** → **"Cookies"**
2. Procure por cookies do `supabase`
3. Delete todos os cookies do site
4. Faça logout e login novamente

---

## 🔄 Ainda Não Funcionou?

### Opção 1: Desabilitar Cache Permanentemente (Dev)

No Firefox, digite na barra de endereços:
```
about:config
```

Procure por:
```
browser.cache.disk.enable
```

Mude para `false` (apenas para desenvolvimento)

### Opção 2: Usar Modo Incógnito + DevTools

1. Abra janela privada (`Ctrl + Shift + P`)
2. Abra DevTools (`F12`)
3. Aba **"Rede"** → Marque **"Desabilitar cache"**
4. Use a aplicação normalmente

---

## 📝 Resumo: Solução Mais Rápida

```bash
1. Feche TODAS as abas do navegador com a aplicação
2. No terminal: npm run dev
3. Abra o navegador
4. Pressione Ctrl + Shift + R
5. Faça login novamente
```

---

## 🚨 IMPORTANTE

**Se você fez `npm run build`:**
- O build gera arquivos estáticos em `/dist`
- Você precisa servir esses arquivos com um servidor (ex: `npx serve dist`)
- OU use `npm run dev` para desenvolvimento

**Diferença:**
- `npm run dev` → Servidor de desenvolvimento com hot reload ✅
- `npm run build` → Build para produção (precisa servir os arquivos)

---

**🎯 RECOMENDAÇÃO:** Use sempre `npm run dev` durante o desenvolvimento!

