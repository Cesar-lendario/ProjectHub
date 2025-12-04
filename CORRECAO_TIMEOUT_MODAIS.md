# 🔧 Correção: Timeout e Travamento de Modais Após 6 Minutos

## ❌ Problema Identificado

**Sintomas:**
1. Aplicação demora muito para entrar inicialmente
2. Após ~6 minutos sem interação, modais de tarefas/projetos travam:
   - Ficam tentando carregar ao editar/criar
   - Não salvam dados
   - Ou simplesmente não abrem
3. Necessário limpar cache continuamente para funcionar
4. Problema generalizado em toda a aplicação

## 🔍 Causa Raiz Identificada

### 1. **Token de Autenticação Expirado (CAUSA PRINCIPAL)**
Os serviços de API (`ProjectsService` e `TasksService`) estavam usando `fetch` direto com apenas a **anon key** do Supabase, **sem usar o token de autenticação do usuário**. Isso causava:

- Após ~6 minutos, quando o token JWT expirava, as requisições falhavam com erro 401
- O Supabase tem RLS (Row Level Security) que requer token válido do usuário
- O `autoRefreshToken` do Supabase só funciona com o cliente Supabase, não com `fetch` direto

### 2. **Falta de Refresh Automático em Requisições Fetch**
Quando usávamos `fetch` direto, não havia:
- Verificação se o token estava válido antes da requisição
- Refresh automático do token quando próximo de expirar
- Retry com token atualizado em caso de erro 401

### 3. **Tratamento Inadequado de Erros de Autenticação**
Os modais não tratavam especificamente erros de autenticação:
- Erros 401 eram tratados como erros genéricos
- Não havia feedback claro ao usuário sobre sessão expirada
- Não havia reload automático quando necessário

---

## ✅ Correções Implementadas

### 1. **Criação de Helper de Autenticação** (`services/api/authHelper.ts`)

**Novo arquivo criado** com duas funções principais:

#### `getAuthToken()` - Obtém token válido
- Verifica se há sessão ativa
- Detecta se o token está próximo de expirar (< 5 minutos)
- Faz refresh preventivo se necessário
- Retorna o token atualizado

#### `authenticatedFetch()` - Fetch autenticado
- Automaticamente adiciona o token do usuário nas requisições
- Faz refresh automático se receber erro 401
- Retry automático com token atualizado
- Fallback para anon key se não houver token (apenas leitura)

**Características:**
- ✅ Logs detalhados para depuração
- ✅ Refresh preventivo quando token próximo de expirar
- ✅ Retry automático em caso de token expirado
- ✅ Tratamento robusto de erros

### 2. **Atualização dos Serviços de API**

#### `services/api/projects.service.ts`
- ✅ `create()` agora usa `authenticatedFetch()` com token do usuário
- ✅ `update()` agora usa `authenticatedFetch()` com token do usuário
- ✅ Logs melhorados com prefixo `[ProjectsService.*]`
- ✅ Tratamento específico para erro 401

#### `services/api/tasks.service.ts`
- ✅ `createBulk()` agora usa `authenticatedFetch()` com token do usuário
- ✅ Logs melhorados com prefixo `[TasksService.*]`
- ✅ Tratamento específico para erro 401

### 3. **Melhoria no Tratamento de Erros nos Modais**

#### `components/tasks/TaskList.tsx`
- ✅ Detecta erros de sessão expirada
- ✅ Mostra mensagem clara ao usuário
- ✅ Recarrega página automaticamente quando necessário

#### `components/projects/ProjectList.tsx`
- ✅ Detecta erros de sessão expirada
- ✅ Mostra mensagem clara ao usuário
- ✅ Recarrega página automaticamente quando necessário

#### `components/tasks/TaskForm.tsx`
- ✅ Tratamento específico para erros de autenticação
- ✅ Feedback claro ao usuário

#### `components/projects/ProjectForm.tsx`
- ✅ Tratamento específico para erros de autenticação
- ✅ Feedback claro ao usuário

### 4. **Monitoramento Preventivo de Sessão** (`hooks/useAuth.tsx`)

**Adicionado:**
- ✅ Interval de verificação a cada 2 minutos
- ✅ Detecta quando token está próximo de expirar (< 5 minutos)
- ✅ Faz refresh preventivo automaticamente
- ✅ Evita que token expire durante operações

**Benefícios:**
- Token sempre atualizado antes de expirar
- Menos chance de erros durante operações
- Experiência mais fluida para o usuário

---

## 📊 Logs Esperados (Console do Navegador)

### ✅ FUNCIONANDO CORRETAMENTE:

```
[authHelper] 🔑 Obtendo token de autenticação...
[authHelper] ⏰ Token expira em: 1800 segundos
[authHelper] ✅ Token obtido: eyJhbGciOiJSUzI1NiIs...
[authHelper] 🔐 Requisição autenticada com token do usuário
[ProjectsService.create] ✅ Fetch concluído, status: 200
[ProjectsService.create] ✅ Projeto criado com sucesso!
```

### ⚠️ COM TOKEN PRÓXIMO DE EXPIRAR:

```
[authHelper] 🔑 Obtendo token de autenticação...
[authHelper] ⏰ Token expira em: 240 segundos
[authHelper] 🔄 Token próximo de expirar, tentando refresh...
[authHelper] ✅ Token atualizado com sucesso
[authHelper] ✅ Token obtido: eyJhbGciOiJSUzI1NiIs...
```

### 🔄 COM TOKEN EXPIRADO (RETRY AUTOMÁTICO):

```
[authHelper] 🔐 Requisição autenticada com token do usuário
[ProjectsService.create] ✅ Fetch concluído, status: 401
[authHelper] 🔄 Token expirado, tentando refresh e retry...
[authHelper] ✅ Token atualizado, retentando requisição...
[ProjectsService.create] ✅ Fetch concluído, status: 200
```

### ❌ COM SESSÃO EXPIRADA (RELOAD):

```
[ProjectsService.create] ❌ Erro HTTP: 401 Unauthorized
Sua sessão expirou. A página será recarregada para renovar a autenticação.
```

---

## 🎯 Resultados Esperados

### Antes:
- ❌ Modais travavam após 6 minutos
- ❌ Requisições falhavam silenciosamente
- ❌ Necessário limpar cache manualmente
- ❌ Experiência frustrante para o usuário

### Depois:
- ✅ Modais funcionam mesmo após longos períodos de inatividade
- ✅ Token é atualizado automaticamente antes de expirar
- ✅ Requisições sempre usam token válido
- ✅ Erros de autenticação são tratados adequadamente
- ✅ Feedback claro ao usuário quando necessário
- ✅ Experiência fluida e confiável

---

## 📝 Arquivos Modificados

1. ✅ **NOVO:** `services/api/authHelper.ts` - Helper de autenticação
2. ✅ `services/api/projects.service.ts` - Usa `authenticatedFetch()`
3. ✅ `services/api/tasks.service.ts` - Usa `authenticatedFetch()`
4. ✅ `hooks/useAuth.tsx` - Monitoramento preventivo de sessão
5. ✅ `components/tasks/TaskList.tsx` - Tratamento de erros melhorado
6. ✅ `components/projects/ProjectList.tsx` - Tratamento de erros melhorado
7. ✅ `components/tasks/TaskForm.tsx` - Tratamento de erros melhorado
8. ✅ `components/projects/ProjectForm.tsx` - Tratamento de erros melhorado

---

## 🔍 Como Testar

1. **Teste de Token Expirando:**
   - Faça login na aplicação
   - Aguarde ~5 minutos sem interação
   - Tente criar/editar uma tarefa ou projeto
   - ✅ Deve funcionar normalmente (refresh preventivo)

2. **Teste de Requisição com Token Expirado:**
   - Simule token expirado (modificar localStorage manualmente)
   - Tente criar/editar uma tarefa ou projeto
   - ✅ Deve fazer refresh automático e retry

3. **Teste de Sessão Completamente Expirada:**
   - Limpe o localStorage completamente
   - Tente criar/editar uma tarefa ou projeto
   - ✅ Deve mostrar mensagem e recarregar página

4. **Teste de Monitoramento Preventivo:**
   - Abra o console do navegador
   - Aguarde 2 minutos
   - ✅ Deve ver logs de verificação de sessão
   - Se token próximo de expirar, deve ver refresh preventivo

---

## 💡 Próximos Passos Sugeridos

1. **Monitoramento de Performance:**
   - Adicionar métricas de tempo de resposta das requisições
   - Rastrear frequência de refresh de tokens

2. **Melhorias de UX:**
   - Notificação discreta quando sessão está sendo renovada
   - Indicador visual de "conectado" vs "sincronizando"

3. **Otimizações:**
   - Cache de requisições frequentes
   - Debounce em refresh preventivo para evitar múltiplos refresh simultâneos

