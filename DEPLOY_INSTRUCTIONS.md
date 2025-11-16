# 🚀 Instruções de Deploy - TaskMeet

## 📦 Pasta `dist/` Pronta para Deploy

Todos os arquivos necessários já estão na pasta `dist/`:

```
dist/
├── .htaccess          ✅ Arquivo de configuração Apache
├── index.html         ✅ Página principal
└── assets/            ✅ JavaScript, CSS e outros recursos
```

---

## 📤 Upload via FileZilla para Locaweb

### Passo 1: Conectar no FTP

Abra o FileZilla e conecte:

```
Host: ftp.seudominio.com.br (ou IP fornecido)
Usuário: seu_usuario_ftp
Senha: sua_senha_ftp
Porta: 21 (FTP) ou 22 (SFTP)
```

### Passo 2: Localizar Arquivos

**No painel LOCAL (esquerda)**, navegue até:
```
c:\ProjetoHub\ProjectHub-1\dist\
```

**No painel REMOTO (direita)**, navegue até:
```
/public_html/          (para domínio principal)
ou
/public_html/subpasta/ (para subdiretório)
```

### Passo 3: Selecionar TODOS os Arquivos

Dentro de `dist/`, selecione:
- ✅ `.htaccess` (IMPORTANTE! Ative "Ver > Mostrar arquivos ocultos" se não aparecer)
- ✅ `index.html`
- ✅ `assets/` (pasta completa com todo o conteúdo)

### Passo 4: Fazer Upload

- Arraste os arquivos para o servidor OU
- Botão direito > "Upload"
- Aguarde a transferência completar (pode levar alguns minutos)

### Passo 5: Verificar Permissões

Se necessário, ajuste as permissões:
- Arquivos: 644 (rw-r--r--)
- Pastas: 755 (rwxr-xr-x)
- `.htaccess`: 644

---

## 🌐 Estrutura Final no Servidor

Deve ficar assim:

```
/public_html/
├── .htaccess       ← NÃO ESQUEÇA!
├── index.html
└── assets/
    ├── index-T-BbWFdv.js
    ├── recharts-BBHOS3L2.js
    ├── supabase-D-V03Gt5.js
    ├── ai-qOrV4Wlz.js
    ├── index-CZZn2S9j.css
    └── ... (outros arquivos)
```

---

## ✅ Checklist Pré-Deploy

- [ ] Build executado (`npm run build`)
- [ ] Arquivo `.htaccess` na pasta `dist/`
- [ ] Variáveis de ambiente corretas no `.env`
- [ ] FileZilla conectado no servidor
- [ ] Todos os arquivos selecionados para upload

---

## 🧪 Testar Após Deploy

1. **Acessar o site**: `https://seudominio.com.br`
2. **Testar carregamento**: Página deve aparecer sem erros
3. **Testar rotas**: Navegue para /dashboard, /projetos, /tarefas
4. **Testar login**: Faça login com suas credenciais
5. **Verificar console**: Abra F12 > Console e veja se há erros

---

## 🐛 Troubleshooting

### Problema: Página em branco

**Soluções:**
- Abra F12 > Console e veja os erros
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o Supabase está acessível
- Verifique se o domínio está autorizado no Supabase

### Problema: 404 ao navegar entre páginas

**Soluções:**
- Confirme que o `.htaccess` foi enviado
- Verifique se o arquivo está visível (ative "Mostrar ocultos")
- Contate suporte Locaweb para ativar `mod_rewrite`
- Teste se o arquivo está acessível: `seudominio.com.br/.htaccess`

### Problema: Assets não carregam (CSS/JS quebrado)

**Soluções:**
- Confirme que a pasta `assets/` foi enviada completamente
- Verifique permissões (chmod 644 para arquivos)
- Limpe cache do navegador (Ctrl + Shift + R)
- Verifique se os caminhos estão corretos no console (F12)

### Problema: Erro de CORS do Supabase

**Soluções:**
- Acesse o Dashboard do Supabase
- Vá em Settings > API
- Adicione seu domínio em "Site URL"
- Adicione `https://seudominio.com.br` em "Redirect URLs"

---

## ⚙️ O que o `.htaccess` faz?

### 1. Reescrita de URLs (SPA Routing)
Permite que rotas como `/dashboard` e `/projetos` funcionem corretamente, redirecionando tudo para `index.html`.

### 2. Cache de Arquivos Estáticos
- Imagens: cache de 1 ano
- CSS/JS: cache de 1 mês
- JSON: cache de 1 dia

### 3. Compressão Gzip
Reduz tamanho dos arquivos em ~70%, melhorando performance.

### 4. Segurança
- Proteção contra clickjacking (X-Frame-Options)
- Proteção XSS (X-XSS-Protection)
- Bloqueia acesso a arquivos sensíveis (.env, .git)
- Desabilita listagem de diretórios

---

## 📊 Tamanho do Deploy

```
Bundle Total: ~1.2 MB
Gzipped: ~320 KB (com compressão do .htaccess)

Principais arquivos:
- recharts: 496 KB (gráficos)
- index: 242 KB (app principal)
- supabase: 177 KB (database)
- ai: 105 KB (Gemini AI)
```

---

## 🔐 Segurança

### Variáveis de Ambiente
As chaves do Supabase e Gemini já estão incluídas no build. Certifique-se de que:

1. **NUNCA** commite o arquivo `.env` no Git
2. Use apenas as chaves **públicas** do Supabase (anon key)
3. Configure RLS (Row Level Security) no Supabase para proteger dados
4. Use HTTPS no domínio (SSL/TLS ativo)

### HTTPS na Locaweb
1. Acesse o Painel da Locaweb
2. Vá em "Certificado SSL"
3. Ative o SSL gratuito (Let's Encrypt)
4. Aguarde a ativação (pode levar até 24h)
5. Force HTTPS no `.htaccess` (já está configurado)

---

## 📞 Suporte

### Locaweb
- Site: https://www.locaweb.com.br/atendimento/
- Telefone: 3550-9000
- Chat: Disponível no painel

### TaskMeet
- Para problemas com a aplicação, verifique os logs no console
- Para problemas com Supabase, acesse o Dashboard

---

## 🎉 Deploy Concluído!

Após seguir todos os passos, seu TaskMeet estará no ar e pronto para uso!

**Boa sorte com seu deploy! 🚀**
