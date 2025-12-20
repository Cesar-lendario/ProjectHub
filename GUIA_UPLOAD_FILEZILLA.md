# 🚀 GUIA DE UPLOAD PARA PRODUÇÃO - FileZilla

## 📦 O QUE VOCÊ PRECISA FAZER

Você vai enviar **APENAS o conteúdo da pasta `dist/`** para o servidor.

---

## 📁 Estrutura da Pasta `dist/` (Local)

```
dist/
├── .htaccess           ← Configuração de cache
├── index.html          ← Página principal (já com correções)
├── _headers            ← Headers (opcional, se usar Netlify/Vercel)
└── assets/             ← Todos os arquivos JS/CSS compilados
    ├── index-Bex2Si_p.js
    ├── index-CZZn2S9j.css
    ├── Dashboard-D5K_Q8y-.js
    ├── TaskList-CiTzfFWf.js
    ├── supabase-CMJcXR0g.js
    ├── recharts-CVb5HtI4.js
    └── ... (todos os outros arquivos)
```

---

## 🎯 PASSO A PASSO - FileZilla

### 1️⃣ Abrir FileZilla e Conectar ao Servidor

1. Abra o FileZilla
2. Conecte ao seu servidor (Host, Usuário, Senha)
3. Navegue até a **pasta raiz do site** (geralmente `public_html/` ou `www/`)

---

### 2️⃣ Fazer Backup dos Arquivos Antigos (IMPORTANTE!)

**Antes de fazer upload, faça backup!**

No servidor, renomeie a pasta atual:
```
public_html/           → public_html_backup_30nov2025/
```

Ou baixe todos os arquivos atuais para seu computador como backup.

---

### 3️⃣ Upload da Pasta `dist/`

**MÉTODO 1: Arrastar e Soltar (Mais Fácil)**

1. No **lado esquerdo** do FileZilla: navegue até `C:\ProjetoHub\ProjectHub-2\ProjectHub\dist\`
2. Selecione **TODOS** os arquivos e pastas dentro de `dist/`:
   - `.htaccess` ✅
   - `index.html` ✅
   - `assets/` ✅ (pasta completa)
3. Arraste e solte para o **lado direito** (servidor) na pasta raiz (ex: `public_html/`)

**MÉTODO 2: Upload Manual**

1. No **lado direito** (servidor), vá para a pasta raiz (ex: `public_html/`)
2. Clique com botão direito → **Upload**
3. Selecione os arquivos de `dist/`:
   - `.htaccess`
   - `index.html`
   - Pasta `assets/` completa

---

### 4️⃣ Verificar Estrutura no Servidor

Após o upload, a estrutura no servidor deve ficar assim:

```
public_html/                    ← RAIZ DO SITE
├── .htaccess                   ← Configuração de cache
├── index.html                  ← Página principal
└── assets/                     ← Pasta com arquivos JS/CSS
    ├── index-Bex2Si_p.js
    ├── index-CZZn2S9j.css
    ├── Dashboard-D5K_Q8y-.js
    ├── TaskList-CiTzfFWf.js
    ├── supabase-CMJcXR0g.js
    └── ... (todos os outros)
```

---

## ✅ CHECKLIST DE UPLOAD

### Antes do Upload:
- [ ] Backup dos arquivos antigos feito
- [ ] FileZilla conectado ao servidor
- [ ] Na pasta raiz do site (public_html/ ou www/)

### Durante o Upload:
- [ ] `.htaccess` enviado para a raiz ✅
- [ ] `index.html` enviado para a raiz ✅
- [ ] Pasta `assets/` enviada para a raiz ✅
- [ ] Todos os 24 arquivos dentro de `assets/` enviados ✅

### Após o Upload:
- [ ] Verificar estrutura no servidor (FileZilla lado direito)
- [ ] Confirmar que `.htaccess` está na raiz
- [ ] Confirmar que pasta `assets/` está na raiz
- [ ] Limpar cache do servidor/CDN (se aplicável)

---

## 🧪 TESTAR APÓS O UPLOAD

### 1. Abrir Janela Anônima

1. Abra uma janela anônima/privada do navegador
2. Pressione `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)

### 2. Acessar o Site

```
www.taskmeet.com.br
```

### 3. Abrir Console do Navegador

Pressione `F12` e vá na aba **Console**

### 4. Verificar Logs

✅ **DEVE APARECER:**
```
[Cache] Versão: 2025.11.30.v1
[index.tsx] Iniciando renderização do App...
[index.tsx] ✅ App renderizado com sucesso
[useAuth] 🔄 Carregando sessão inicial...
[useAuth] 📝 Sessão inicial obtida: ✅ Sessão encontrada
[useAuth] ✅ Carregamento inicial concluído
[useAuth] ℹ️ TOKEN_REFRESHED ignorado (já carregado)
[Cache] ✅ Página carregada com sucesso
```

❌ **NÃO DEVE APARECER:**
```
[AppContent] ⚠️ Timeout: Loading demorou mais de 15 segundos
[Cache] ⚠️ Carregamento demorou mais de 20s
```

### 5. Testar Funcionalidades

- [ ] Dashboard carrega normalmente
- [ ] Não fica travado em "Carregando..."
- [ ] Login funciona
- [ ] Não precisa Ctrl+Shift+R

---

## 🚨 SE DER ERRO 404 ou "Arquivo não encontrado"

### Problema: Arquivos CSS/JS não carregam

**Causa:** Pasta `assets/` não está no lugar certo

**Solução:**
1. Verifique no FileZilla se a pasta `assets/` está na **raiz** do site
2. A estrutura deve ser:
   ```
   public_html/
   ├── index.html
   └── assets/
       └── index-Bex2Si_p.js
   ```
3. **NÃO** deve ser:
   ```
   public_html/
   └── dist/
       ├── index.html
       └── assets/
   ```

---

## 🚨 SE O PROBLEMA DE LOADING INFINITO PERSISTIR

### 1. Verificar se `.htaccess` foi enviado

O arquivo `.htaccess` pode estar oculto no FileZilla!

**Solução:**
1. No FileZilla, vá em: **Servidor** → **Forçar mostrar arquivos ocultos**
2. Verifique se `.htaccess` aparece na lista
3. Se não aparecer, envie novamente

### 2. Limpar Cache do Servidor

Se seu servidor usa cache:

```bash
# Painel do servidor → Cache → Limpar tudo
# Ou
# Cloudflare → Caching → Purge Everything
```

### 3. Forçar No-Cache Temporário

Se ainda não funcionar, edite o `.htaccess` no servidor e adicione no **INÍCIO**:

```apache
# TEMPORÁRIO - FORÇAR NO-CACHE
Header set Cache-Control "no-cache, no-store, must-revalidate"
Header set Pragma "no-cache"
Header set Expires "0"

# ... resto do arquivo ...
```

Salve e teste novamente.

---

## 📊 RESUMO VISUAL - FileZilla

```
COMPUTADOR (Esquerda)          SERVIDOR (Direita)
┌──────────────────────┐      ┌──────────────────────┐
│ dist/                │      │ public_html/         │
│ ├── .htaccess        │  →   │ ├── .htaccess        │
│ ├── index.html       │  →   │ ├── index.html       │
│ └── assets/          │  →   │ └── assets/          │
│     ├── index*.js    │      │     ├── index*.js    │
│     ├── index*.css   │      │     ├── index*.css   │
│     └── ...          │      │     └── ...          │
└──────────────────────┘      └──────────────────────┘

         Arrastar e Soltar →
```

---

## 🎯 RESULTADO ESPERADO

Após o upload correto:

1. ✅ Site carrega em 1-3 segundos
2. ✅ Não fica travado em "Carregando..."
3. ✅ Não precisa Ctrl+Shift+R
4. ✅ Funciona na primeira tentativa
5. ✅ Console mostra os logs corretos

---

## 💡 DICAS IMPORTANTES

1. **Sempre faça backup antes!** Renomeie a pasta antiga no servidor
2. **Use janela anônima para testar** - Evita cache local
3. **Verifique o console (F12)** - Os logs mostram se está funcionando
4. **Paciência no upload** - A pasta `assets/` tem 24 arquivos, pode demorar
5. **Não envie a pasta `dist/` inteira** - Envie apenas o **conteúdo** de `dist/`

---

## 📞 SUPORTE

Se ainda tiver problemas:

1. Tire um print do FileZilla mostrando a estrutura no servidor
2. Tire um print do console (F12) mostrando os erros
3. Compartilhe para análise

---

**Versão:** 2025.11.30.v1  
**Data:** 30/11/2025  
**Status:** ✅ Pronto para upload via FileZilla

**BOA SORTE! 🚀**







