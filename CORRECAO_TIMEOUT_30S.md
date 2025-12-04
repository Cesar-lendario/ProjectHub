# 🔧 Correção Adicional: Timeout de 30 Segundos ao Salvar Tarefas

## ❌ Problema Específico Identificado

**Sintoma observado na imagem:**
- Modal "Editar Tarefa" travado com botão "Salvando..."
- Alerta: "A operação está demorando muito. Por favor, tente novamente."
- Console mostra: `[TaskForm] ⚠️ Timeout ao salvar tarefa (30s)`
- Requisição não completa após 30 segundos

## 🔍 Causas Adicionais Identificadas

### 1. **Falta de Timeout nas Requisições do Supabase**
O `TasksService.update()` estava usando o cliente Supabase diretamente sem timeout explícito, permitindo que requisições travassem indefinidamente.

### 2. **Falta de Verificação de Token Antes das Requisições**
Não havia verificação se o token estava válido antes de fazer requisições, causando falhas silenciosas.

### 3. **Falta de Logs Detalhados**
Não havia logs suficientes para identificar onde exatamente a requisição estava travando.

### 4. **Mensagens de Erro Genéricas**
As mensagens de erro não ajudavam o usuário a entender o problema real.

---

## ✅ Correções Implementadas

### 1. **Melhorias no `TasksService.update()`** (`services/api/tasks.service.ts`)

**Adicionado:**
- ✅ Verificação de sessão antes da requisição
- ✅ Refresh preventivo de token se próximo de expirar (< 5 minutos)
- ✅ Timeout explícito de 25 segundos (menor que o timeout do formulário)
- ✅ Logs detalhados em cada etapa:
  - Início da atualização
  - Verificação de token
  - Refresh preventivo (se necessário)
  - Envio da requisição
  - Tempo de resposta
  - Sucesso ou erro
- ✅ Tratamento específico para erros de autenticação
- ✅ Mensagens de erro mais claras

**Código implementado:**
```typescript
async update(id: string, task: TaskUpdate) {
  // Verificar token antes de fazer requisição
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Sessão expirada. Por favor, recarregue a página.');
  }
  
  // Refresh preventivo se necessário
  if (expiresIn < 300 && expiresIn > 0) {
    await supabase.auth.refreshSession();
  }
  
  // Timeout de 25 segundos
  const updatePromise = supabase.from('tasks').update(...);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout...')), 25000);
  });
  
  const { data, error } = await Promise.race([updatePromise, timeoutPromise]);
  // ...
}
```

### 2. **Melhorias no `TasksService.create()`** (`services/api/tasks.service.ts`)

**Adicionado:**
- ✅ Mesmas melhorias do `update()`:
  - Verificação de sessão
  - Refresh preventivo
  - Timeout de 25 segundos
  - Logs detalhados
  - Tratamento de erros

### 3. **Melhorias no `useProjectContext.updateTask()`** (`hooks/useProjectContext.tsx`)

**Adicionado:**
- ✅ Verificação de sessão antes de chamar o serviço
- ✅ Logs de início e duração da operação
- ✅ Import do `supabase` para verificação de sessão

### 4. **Melhorias nas Mensagens de Erro** (`components/tasks/TaskForm.tsx` e `TaskList.tsx`)

**Antes:**
```
"A operação está demorando muito. Por favor, tente novamente."
```

**Depois:**
```
"A operação está demorando muito. Isso pode indicar:

• Problema de conexão com a internet
• Servidor sobrecarregado
• Token de autenticação expirado

Por favor, verifique sua conexão e tente novamente. 
Se o problema persistir, recarregue a página (Ctrl+Shift+R)."
```

**Adicionado:**
- ✅ Mensagens mais informativas
- ✅ Sugestões de solução
- ✅ Medição de tempo decorrido

---

## 📊 Logs Esperados (Console do Navegador)

### ✅ FUNCIONANDO CORRETAMENTE:

```
[useProjectContext.updateTask] 🔄 Iniciando atualização... {taskId: "..."}
[TasksService.update] 🔄 Iniciando atualização de tarefa... {id: "...", task: {...}}
[TasksService.update] 🔑 Token válido, expira em: 1800 segundos
[TasksService.update] 📤 Enviando requisição ao Supabase...
[TasksService.update] ⏱️ Requisição concluída em 234 ms
[TasksService.update] ✅ Tarefa atualizada com sucesso
[useProjectContext.updateTask] ⏱️ Atualização concluída em 245 ms
[TaskList] ✅ Tarefa atualizada no servidor
```

### ⚠️ COM TOKEN PRÓXIMO DE EXPIRAR:

```
[TasksService.update] 🔑 Token válido, expira em: 240 segundos
[TasksService.update] 🔄 Token próximo de expirar, fazendo refresh...
[TasksService.update] ✅ Token atualizado
[TasksService.update] 📤 Enviando requisição ao Supabase...
```

### ❌ COM TIMEOUT:

```
[TasksService.update] 📤 Enviando requisição ao Supabase...
[TasksService.update] ❌ ERRO CRÍTICO: Error: Timeout: A requisição demorou mais de 25 segundos...
[TaskForm] ⚠️ Timeout ao salvar tarefa após 30 segundos
```

### ❌ COM SESSÃO EXPIRADA:

```
[TasksService.update] ❌ Nenhuma sessão encontrada
[TasksService.update] ❌ ERRO CRÍTICO: Error: Sessão expirada. Por favor, recarregue a página.
```

---

## 🎯 Resultados Esperados

### Antes:
- ❌ Requisições podiam travar indefinidamente
- ❌ Sem verificação de token antes das requisições
- ❌ Logs insuficientes para depuração
- ❌ Mensagens de erro genéricas
- ❌ Timeout apenas no nível do formulário (30s)

### Depois:
- ✅ Timeout explícito de 25s nas requisições
- ✅ Verificação de token antes de cada requisição
- ✅ Refresh preventivo de token
- ✅ Logs detalhados em cada etapa
- ✅ Mensagens de erro informativas
- ✅ Detecção precoce de problemas (antes do timeout do formulário)

---

## 📝 Arquivos Modificados

1. ✅ `services/api/tasks.service.ts`
   - `update()` - Adicionado timeout, logs e verificação de token
   - `create()` - Adicionado timeout, logs e verificação de token

2. ✅ `hooks/useProjectContext.tsx`
   - `updateTask()` - Adicionado verificação de sessão e logs
   - Import do `supabase` adicionado

3. ✅ `components/tasks/TaskForm.tsx`
   - Mensagens de erro melhoradas
   - Medição de tempo decorrido

4. ✅ `components/tasks/TaskList.tsx`
   - Mensagens de erro melhoradas
   - Medição de tempo decorrido

---

## 🔍 Como Testar

1. **Teste Normal:**
   - Edite uma tarefa e salve
   - ✅ Deve completar em menos de 1 segundo
   - ✅ Console deve mostrar logs detalhados

2. **Teste com Token Próximo de Expirar:**
   - Aguarde até token estar próximo de expirar (< 5 minutos)
   - Edite uma tarefa e salve
   - ✅ Deve fazer refresh preventivo
   - ✅ Deve completar normalmente

3. **Teste de Timeout (Simular):**
   - Desconecte a internet temporariamente
   - Tente editar uma tarefa
   - ✅ Deve mostrar timeout após 25 segundos
   - ✅ Mensagem de erro deve ser informativa

4. **Teste com Sessão Expirada:**
   - Limpe o localStorage
   - Tente editar uma tarefa
   - ✅ Deve detectar sessão expirada imediatamente
   - ✅ Mensagem clara pedindo reload

---

## 💡 Próximos Passos Sugeridos

1. **Monitoramento de Performance:**
   - Adicionar métricas de tempo de resposta
   - Alertar quando requisições demoram > 5 segundos

2. **Retry Automático:**
   - Implementar retry automático em caso de timeout
   - Máximo de 2 tentativas

3. **Indicador Visual:**
   - Mostrar indicador de progresso durante salvamento
   - Mostrar tempo decorrido na UI

4. **Otimização de Requisições:**
   - Verificar se há queries lentas no banco
   - Adicionar índices se necessário
   - Otimizar payloads das requisições


