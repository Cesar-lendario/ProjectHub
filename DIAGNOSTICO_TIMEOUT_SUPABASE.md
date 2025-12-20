# 🔍 DIAGNÓSTICO: Timeout ao Salvar Tarefas no Supabase

**Problema:** Timeout de 20 segundos ao salvar/editar tarefas  
**Causa Provável:** Políticas RLS com JOINs pesados e sem índices

---

## 📊 ANÁLISE DO PROBLEMA

### Logs do Console (da imagem):
```
[TaskForm] Iniciando salvamento da tarefa...
[TaskList] Iniciando salvamento...
[TaskList] Atualizando tarefa no servidor...
⚠️ [TaskForm] Timeout ao salvar tarefa após 20 segundos
```

### O que está acontecendo:
1. ✅ Frontend inicia o salvamento
2. ✅ Request é enviado ao Supabase
3. ❌ **Supabase demora 20+ segundos para processar**
4. ❌ Timeout é atingido antes de retornar

### Por quê demora tanto?

As políticas RLS da tabela `tasks` fazem:
```sql
-- Esta query é MUITO LENTA:
EXISTS (
  SELECT 1
  FROM public.project_team pt
  JOIN public.users u ON u.id = pt.user_id  -- JOIN pesado!
  WHERE pt.project_id = tasks.project_id
    AND (u.auth_id::uuid) = auth.uid()      -- Conversão cara!
)
```

**Problemas:**
- ❌ JOIN entre 2 tabelas (project_team + users)
- ❌ Conversão de tipo `(u.auth_id::uuid)`
- ❌ SEM índices otimizados
- ❌ Executa para CADA linha verificada

---

## 🔧 SOLUÇÃO: 3 Opções (Progressivas)

### ✅ OPÇÃO 1: Script Otimizado (Recomendado)

**Arquivo:** `FIX_TASKS_RLS_TIMEOUT.sql`

**O que faz:**
1. Cria 5 índices para otimizar queries
2. Remove JOINs desnecessários das políticas
3. Usa subqueries otimizadas
4. Adiciona `LIMIT 1` para parar na primeira correspondência

**Resultado Esperado:**
- ANTES: 15-20 segundos (timeout)
- DEPOIS: 200-500ms (rápido)

**Como aplicar:**
```sql
-- 1. Copiar conteúdo de FIX_TASKS_RLS_TIMEOUT.sql
-- 2. Abrir Supabase Dashboard → SQL Editor
-- 3. Colar e executar
-- 4. Testar salvamento de tarefa
```

---

### ✅ OPÇÃO 2: Script Super Otimizado (Se Opção 1 não resolver)

**Arquivo:** `FIX_TASKS_RLS_TIMEOUT_ALTERNATIVE.sql`

**O que faz:**
1. Cria funções SQL para cachear user_id
2. Evita subqueries repetidas
3. Políticas RLS mais simples e rápidas

**Resultado Esperado:**
- ANTES: 15-20 segundos (timeout)
- DEPOIS: 50-200ms (instantâneo!)

**Como aplicar:**
```sql
-- 1. Copiar conteúdo de FIX_TASKS_RLS_TIMEOUT_ALTERNATIVE.sql
-- 2. Abrir Supabase Dashboard → SQL Editor
-- 3. Colar e executar
-- 4. Testar salvamento de tarefa
```

---

### ✅ OPÇÃO 3: Diagnóstico Manual (Para entender o problema)

Execute estes comandos no **SQL Editor do Supabase**:

#### 1. Verificar Políticas Atuais
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  LEFT(qual::text, 100) as policy_using,
  LEFT(with_check::text, 100) as policy_check
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;
```

**O que procurar:**
- ❌ Se tiver JOINs no `policy_using` → **PROBLEMA!**
- ❌ Se tiver conversões de tipo `::uuid` → **PROBLEMA!**
- ✅ Se tiver políticas simples → **OK**

---

#### 2. Verificar Índices
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tasks', 'project_team', 'users')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
```

**O que procurar:**
- ✅ `idx_users_auth_id` deve existir
- ✅ `idx_project_team_project_user` deve existir
- ✅ `idx_tasks_project_id` deve existir
- ❌ Se não existirem → **PROBLEMA!**

---

#### 3. Testar Performance de Query
```sql
-- Substituir pelo seu project_id real
EXPLAIN ANALYZE
SELECT * FROM public.tasks
WHERE project_id = '4e434e76-c72a-48d8-a235-ac4bfa51a0b1'
LIMIT 10;
```

**O que procurar:**
- ✅ Deve mostrar `Index Scan` (usando índice)
- ❌ Se mostrar `Seq Scan` → sem índice (PROBLEMA!)
- ✅ Execution time < 50ms → OK
- ❌ Execution time > 1000ms → PROBLEMA!

---

#### 4. Verificar Estatísticas das Tabelas
```sql
SELECT 
  schemaname,
  relname as table_name,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN ('tasks', 'project_team', 'users')
ORDER BY relname;
```

**O que procurar:**
- ✅ `last_analyze` recente → OK
- ❌ `last_analyze` NULL ou muito antigo → Execute `ANALYZE`
- ❌ Muitos `dead_rows` → Execute `VACUUM ANALYZE`

Se `last_analyze` estiver desatualizado, execute:
```sql
ANALYZE public.tasks;
ANALYZE public.project_team;
ANALYZE public.users;
```

---

#### 5. Verificar Usuário Atual e Permissões
```sql
-- Verificar seu usuário
SELECT 
  id,
  auth_id,
  full_name,
  role
FROM public.users
WHERE auth_id = auth.uid();

-- Verificar seus projetos
SELECT 
  pt.project_id,
  pt.user_id,
  pt.role,
  p.name as project_name
FROM public.project_team pt
JOIN public.projects p ON p.id = pt.project_id
WHERE pt.user_id = (
  SELECT id::text 
  FROM public.users 
  WHERE auth_id = auth.uid()
);
```

**O que verificar:**
- ✅ Seu usuário aparece
- ✅ Você está no projeto que está tentando editar
- ✅ Você tem role `admin` ou `editor`
- ❌ Se não aparecer → Problema de permissões

---

## 🚀 PASSO A PASSO RECOMENDADO

### 1️⃣ Executar Opção 1 (Script Otimizado)

```sql
-- Abrir Supabase Dashboard
-- SQL Editor → New Query
-- Copiar e colar FIX_TASKS_RLS_TIMEOUT.sql
-- Executar (Run)
```

### 2️⃣ Testar no Site

1. Recarregar página (Ctrl+Shift+R)
2. Tentar editar/salvar uma tarefa
3. Observar console (F12):

**Logs esperados:**
```
[TaskForm] Iniciando salvamento da tarefa...
[TasksService.update] 🔄 Iniciando atualização...
[TasksService.update] 🔑 Token válido, expira em: XXXXs
[TasksService.update] 📤 Enviando requisição ao Supabase...
[TasksService.update] ⏱️ Requisição concluída em 234ms  ← DEVE SER < 1s!
[TasksService.update] ✅ Tarefa atualizada com sucesso
[TaskList] ✅ Tarefa atualizada no servidor
```

### 3️⃣ Se Ainda Estiver Lento (> 2 segundos)

Execute **Opção 2** (Script Alternative):

```sql
-- Copiar e colar FIX_TASKS_RLS_TIMEOUT_ALTERNATIVE.sql
-- Executar
-- Testar novamente
```

### 4️⃣ Se Ainda Persistir

Execute diagnósticos manuais acima e envie resultados para análise.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### Antes de Aplicar Scripts:
- [ ] Fazer backup do banco (opcional mas recomendado)
- [ ] Anotar políticas atuais (caso precise reverter)
- [ ] Ter acesso ao SQL Editor do Supabase

### Após Aplicar Opção 1:
- [ ] Script executou sem erros
- [ ] 4 políticas criadas (verificar)
- [ ] 5 índices criados (verificar)
- [ ] Testar salvamento de tarefa
- [ ] Verificar tempo no console (deve ser < 1s)

### Se Opção 1 não resolver:
- [ ] Aplicar Opção 2 (Alternative)
- [ ] Executar ANALYZE nas tabelas
- [ ] Verificar logs de erro do Supabase
- [ ] Executar diagnósticos manuais

---

## 🐛 TROUBLESHOOTING

### Problema: "permission denied for table"
```sql
-- Você precisa ser owner ou ter permissões
-- Execute como usuário postgres ou service_role
```

### Problema: "policy already exists"
```sql
-- Execute a parte de DROP primeiro:
DROP POLICY IF EXISTS "tasks_select_optimized" ON public.tasks;
-- Depois crie novamente
```

### Problema: "relation does not exist"
```sql
-- Verifique se as tabelas existem:
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tasks', 'project_team', 'users');
```

### Problema: Ainda demora muito
```sql
-- Execute VACUUM ANALYZE:
VACUUM ANALYZE public.tasks;
VACUUM ANALYZE public.project_team;
VACUUM ANALYZE public.users;

-- Verifique se índices foram criados:
\d+ public.tasks
-- ou
SELECT * FROM pg_indexes WHERE tablename = 'tasks';
```

---

## 📊 MÉTRICAS ESPERADAS

| Métrica | Antes | Depois (Opção 1) | Depois (Opção 2) |
|---------|-------|------------------|------------------|
| **Tempo de resposta** | 15-20s | 200-500ms | 50-200ms |
| **Timeout atingido?** | ✅ Sim | ❌ Não | ❌ Não |
| **Índices** | 0-2 | 5 | 5 |
| **Políticas RLS** | Com JOINs | Sem JOINs | Com funções |
| **Experiência do usuário** | ❌ Ruim | ✅ Boa | ✅ Excelente |

---

## 💡 POR QUE ISSO ACONTECE?

### Contexto:
O Supabase usa **PostgreSQL** com **Row Level Security (RLS)**.

Cada query precisa verificar se o usuário tem permissão para acessar/modificar aquela linha.

### O Problema:
As políticas RLS originais fazem:
1. Para cada tarefa, busca na tabela `project_team`
2. Faz JOIN com tabela `users`
3. Converte tipos `auth_id::uuid`
4. Verifica permissões

Se você tem 100 tarefas, isso executa 100x!

### A Solução:
1. **Índices**: PostgreSQL encontra registros instantaneamente
2. **Sem JOINs**: Menos tabelas = mais rápido
3. **Funções cacheadas**: Calcula user_id uma vez só
4. **LIMIT 1**: Para na primeira correspondência

---

## ✅ CONCLUSÃO

Execute o **Opção 1** primeiro. Em 99% dos casos, isso resolve.

Se não resolver completamente, execute **Opção 2**.

**Tempo estimado:** 5-10 minutos para aplicar e testar

**Resultado:** Salvamento de tarefas em < 1 segundo ✨

---

**Arquivos Relacionados:**
- `FIX_TASKS_RLS_TIMEOUT.sql` (Solução principal)
- `FIX_TASKS_RLS_TIMEOUT_ALTERNATIVE.sql` (Solução alternativa)
- `DIAGNOSTICO_TIMEOUT_SUPABASE.md` (Este arquivo)


