## Visão Geral

ProjectHub é uma plataforma web multitenant de gestão de projetos orientada a equipes distribuídas. O aplicativo consolida planejamento, execução e monitoramento em um único painel, oferecendo visão integrada de projetos, tarefas, cronograma, comunicação e colaboração da equipe. O fluxo principal passa pelo provedor de contexto de projetos (`useProjectContext`), que centraliza o estado compartilhado da aplicação e implementa todas as operações CRUD.

## Principais Funcionalidades

### 📊 Dashboard
- Métricas resumidas e KPIs em tempo real
- Gráficos de orçamento (realizado vs planejado)
- Análise de riscos com IA (Google Gemini)
- Indicadores de progresso por projeto
- Visão consolidada de tarefas ativas, atrasadas e concluídas

### 🏢 Gestão de Projetos
- CRUD completo de projetos com formulários dinâmicos
- Tipos de projeto predefinidos: Homologação, Renovação CCT, Outros
- Criação automática de tarefas padrão por tipo de projeto (status inicial: "A Fazer")
- Análise de caminho crítico para identificar gargalos
- Gerenciamento de equipe por projeto (admin, editor, viewer)
- Controle de orçamento e custos reais
 - Alternância de visualização de projetos entre **cards** e **lista**
 - Filtros avançados por **nome da empresa**, **tipo de projeto**, **nome do contato** e **data de início**

### ✅ Gestão de Tarefas
- Visualização Kanban com 4 colunas: Pendente, A Fazer, Em Progresso, Concluída
- Drag-and-drop para mudança de status (não implementado ainda)
- Formulário dinâmico com dependências entre tarefas
- Atribuição de responsáveis e prioridades (Alta, Média, Baixa)
- Sistema de comentários e anexos por tarefa
- **Notificações de Cobranças**: modal para envio de lembretes por Email e WhatsApp
- Histórico de comunicações com clientes (Data Email, Data WhatsApp)
- Modal de lembrete de tarefas sincronizado com o projeto filtrado na página de tarefas
- Lembretes considerando apenas tarefas nas colunas **Pendente** e **A Fazer**
- **Modal de Resumo de Tarefas**: botão "Resumo" que exibe um modal com listagem detalhada das tarefas nos status **Pendente**, **A Fazer** e **Em andamento**
  - Mostra nome, descrição e data de vencimento de cada tarefa
  - Agrupado por status com identificação visual por cor
  - Sincronizado com o projeto atualmente filtrado
 - Paleta de cores unificada por status em todo o sistema (Kanban e cronograma):
   - **Pendente** = vermelho
   - **A Fazer** = roxo
   - **Em andamento** = azul
   - **Concluído** = verde

### 📅 Cronograma
- Visão de Gantt consolidada por projeto
- Timeline semanal com scroll horizontal
- Visualização de dependências e duração de tarefas
- Ajustes recentes:
  - Remoção da opção "Todos os Projetos" para evitar ambiguidades
  - Ordenação de tarefas prioritárias no topo da tabela
  - Cores das barras do cronograma alinhadas aos status das tarefas (Pendente, A Fazer, Em andamento, Concluído)
- Cálculo automático de datas de início baseado em prazos
 - Seleção sempre por **projeto individual** (opção "Todos os projetos" descontinuada para evitar ambiguidades)
 - Ordenação de tarefas do cronograma priorizando **DOCUMENTOS DA EMPRESA** e **NF/ IDENTIFICAÇÃO ...** no topo da tabela
 - Cores das barras do cronograma alinhadas aos status das tarefas (Pendente, A Fazer, Em andamento, Concluído)

### 👥 Gestão de Equipe e Usuários
- **TeamManagementView**: visualização em cards com estatísticas por membro
- **UserManagementView**: tabela administrativa para gerenciar todos os usuários
- Perfis de usuário com avatar, função, email e estatísticas de tarefas
- Upload de avatares para Supabase Storage (bucket `avatars`)
- Sistema de permissões com 3 níveis globais:
  - **Admin**: acesso total ao sistema (apenas 1 permitido)
  - **Supervisor**: acesso a relatórios e gestão de equipe
  - **Engineer**: acesso básico a projetos e tarefas
- Permissões por projeto (admin, editor, viewer)
- **Exclusão Profissional de Usuários** (`DeleteUserModal`):
  - Análise de impacto (projetos e tarefas afetadas)
  - Reatribuição de tarefas para outro usuário
  - Confirmação por digitação do nome
  - Validações de segurança (não exclui admin único, próprio perfil)
  - Audit logging completo para rastreabilidade
  - Interface visual moderna com estatísticas e avisos
- **Badge visual de admin**: indicador "👑 ADMIN" no header para usuários administradores

### 📁 Arquivos
- Upload de arquivos por projeto (PDF, DOC, DOCX, imagens)
- Listagem com ícones dinâmicos por tipo MIME
- Filtro por projeto
- Download direto dos arquivos
- **Status atual**: armazenamento local temporário (URL.createObjectURL)
- **Próxima implementação**: integração com Supabase Storage (bucket `project-files`)

### 💬 Comunicação
- Chat contextual por canal
- Sistema de mensagens com timestamp
- Suporte a entrada de texto estruturada
- Visualização de mensagens por usuário autenticado

### 📈 Relatórios
- Consultas consolidadas de métricas operacionais
- Análise de progresso por projeto
- Identificação de projetos em risco
- Exportação de dados (planejada)

### 📧 Sistema de Notificações
- **Histórico de Cobranças** (NotificationLogTable): tabela com Data Email e Data WhatsApp
- **Modal de Envio de Lembretes** (NotificationSenderModal):
  - Seleção de projeto
  - Geração automática de mensagens com lista de tarefas ativas
  - Envio por Email (mailto:)
  - Envio por WhatsApp (via wa.me)
  - Preview editável de mensagens WhatsApp
- Registro automático de data/hora de envio

## Integrações Externas

### Supabase
- **Autenticação** (`services/supabaseClient.ts`, `hooks/useAuth.tsx`): 
  - Login com email/senha
  - Gerenciamento de sessão persistente
  - Criação de perfis de usuário
  - **Mapeamento automático de roles**: conversão entre roles do banco (`'admin'`, `'supervisor'`, `'engineer'`) e roles da aplicação (`'Administrador'`, `'Supervisor'`, `'Engenheiro'`)
- **Banco de Dados** (`services/api/*`):
  - 7 tabelas: users, profiles, projects, tasks, project_team, attachments, messages
  - Tipagem completa com TypeScript (`types/database.types.ts`)
  - Serviços dedicados para cada tabela
  - **Mappers bidirecionais** (`services/api/mappers.ts`): conversão consistente entre tipos do banco e da aplicação
  - Row Level Security (RLS) para isolamento e segurança
- **Storage** (`avatars` bucket):
  - Upload de fotos de perfil
  - URLs públicas para avatares
  - Políticas RLS para segurança
- **Storage** (`project-files` bucket) - *configurar*:
  - Upload de arquivos de projetos
  - Integração completa implementada

### Google Gemini AI
- **Serviço** (`services/geminiService.ts`):
  - Análise de riscos de projetos
  - Geração de insights e oportunidades
  - Análise de caminho crítico
  - Política de retry automático
  - Tratamento robusto de erros
  - Timeout configurável (30s)

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript, Vite como bundler
- **Estado**: React Context API (Auth + ProjectContext)
- **UI**: Componentização por domínio com Tailwind CSS
- **Gráficos**: Recharts para visualizações
- **Backend**: Supabase (Auth + Storage)
- **IA**: Google Gemini para análise de riscos
- **Build/Dev**: npm + Vite + TypeScript
- **Performance**: Lazy loading, code splitting, Web Vitals

## Arquitetura e Fluxo de Dados

### Camada de Apresentação
```
App.tsx (Router)
  ├─ AuthProvider (Contexto de Autenticação)
  │   └─ ProjectProvider (Contexto Central)
  │       └─ MainLayout
  │           ├─ Header (perfil, logout)
  │           ├─ Sidebar (navegação)
  │           └─ Views (Dashboard, Tasks, Projects, etc.)
```

### Fluxo de Autenticação
1. Usuário acessa aplicação
2. `useAuth` verifica sessão no Supabase
3. Se não autenticado → `LoginPage`
4. Login → Supabase Auth → Cria/atualiza perfil
5. Redireciona para Dashboard

### Fluxo de Dados (Estado)
```
useProjectContext (fonte única da verdade)
  ├─ Estado Local:
  │   ├─ projects[] (com tasks, team, files)
  │   ├─ users[]
  │   ├─ messages[]
  │   └─ rolePermissions
  │
  └─ Operações CRUD:
      ├─ Projetos: add, update, delete
      ├─ Tarefas: add, update, delete
      ├─ Usuários: add, update, delete
      ├─ Equipe: addToProject, removeFromProject, updateRole
      ├─ Arquivos: addFile
      ├─ Mensagens: addMessage
      └─ Notificações: logNotification
```

### Integrações
```
Frontend (React)
  ├─ Supabase Client
  │   ├─ Auth (login, logout, session)
  │   └─ Storage (avatars bucket)
  │
  └─ Gemini Service
      └─ AI Analysis (risks, insights)
```

### Padrões de Design Utilizados
- **Context Pattern**: gerenciamento de estado global
- **Provider Pattern**: encapsulamento de lógica
- **Compound Components**: modais e formulários
- **Render Props**: componentes reutilizáveis
- **Custom Hooks**: lógica compartilhada
- **Lazy Loading**: otimização de carregamento

## Estrutura de Pastas (alto nível)

### Raiz do Projeto
- `App.tsx`: ponto de entrada com roteamento de views baseado em estado, composição de layout (`Header`, `Sidebar`, conteúdo principal) e lazy loading de componentes
- `types.ts`: contratos de dados TypeScript (Project, Task, User, Message, Attachment, enums de status e prioridades)
- `constants.ts`: dados mock, valores compartilhados, configurações de permissões e tarefas padrão por tipo de projeto

### `components/`
Módulos segmentados por domínio funcional:

#### `admin/`
- `UserManagementView.tsx`: tabela administrativa de usuários
- `PermissionSettingsView.tsx`: configuração de permissões por perfil

#### `dashboard/`
- `Dashboard.tsx`: visão geral com KPIs e gráficos
- `ProjectCard.tsx`: card de projeto com métricas
- `BudgetChart.tsx`: gráfico de orçamento (Recharts)
- `RiskAnalysis.tsx`: análise de riscos com IA

#### `projects/`
- `ProjectList.tsx`: listagem em grid de projetos
- `ProjectForm.tsx`: formulário de criação/edição
- `ProjectDetail.tsx`: detalhes e caminho crítico

#### `tasks/`
- `TaskList.tsx`: quadro Kanban principal
- `KanbanColumn.tsx`: coluna do Kanban por status
- `TaskForm.tsx`: formulário de tarefa com dependências
- `TaskDetail.tsx`: detalhes da tarefa
- `NotificationSenderModal.tsx`: envio de lembretes Email/WhatsApp
- `NotificationLogTable.tsx`: histórico de cobranças
- `WhatsappPreviewModal.tsx`: preview de mensagem WhatsApp

#### `schedule/`
- `ScheduleView.tsx`: visualização de cronograma Gantt

#### `team/`
- `TeamManagementView.tsx`: gerenciamento de equipe (orquestrador)
- `TeamView.tsx`: visualização em cards de membros
- `TeamMemberCard.tsx`: card individual de membro com botões de edição/exclusão
- `UserProfileView.tsx`: perfil detalhado com upload de avatar
- `TeamForm.tsx`: formulário de criação/edição de usuário
- `TeamManagementModal.tsx`: gerenciamento de equipe por projeto
- `DeleteUserModal.tsx`: modal profissional para exclusão de usuários com análise de impacto

#### `files/`
- `FilesView.tsx`: listagem de arquivos por projeto
- `FileUpload.tsx`: modal de upload
- `FileIcon.tsx`: ícones dinâmicos por tipo MIME

#### `communication/`
- `CommunicationView.tsx`: interface de chat
- `ChatMessage.tsx`: componente de mensagem

#### `reports/`
- `ReportsView.tsx`: relatórios consolidados

#### `layout/`
- `Header.tsx`: cabeçalho com perfil, badge de admin e logout
- `Sidebar.tsx`: menu lateral com navegação

#### `ui/`
- `Card.tsx`: componente base de cartão
- `Icons.tsx`: biblioteca de ícones SVG

#### `auth/`
- `LoginPage.tsx`: página de autenticação

### `hooks/`
Hooks contextuais que encapsulam regras de negócio:

- `useAuth.tsx`: autenticação Supabase, sessão, login/logout, criação de perfis, **mapeamento automático de roles**
- `useProjectContext.tsx`: contexto central com CRUD de projetos, tarefas, usuários (incluindo exclusão profissional), arquivos e notificações
- `useTheme.tsx`: gerenciamento de tema (light/dark)

### `services/`
Integrações com serviços externos e APIs:

- `supabaseClient.ts`: cliente Supabase tipado com credenciais
- `geminiService.ts`: integração Google Gemini AI com retry policy
- `api/`: serviços de API para cada tabela do Supabase
  - `projects.service.ts`: CRUD de projetos e notificações
  - `tasks.service.ts`: CRUD de tarefas, criação em lote
  - `users.service.ts`: CRUD de usuários
  - `team.service.ts`: gerenciamento de equipes de projetos
  - `attachments.service.ts`: CRUD de anexos e upload de arquivos
  - `messages.service.ts`: CRUD de mensagens e canais
  - `mappers.ts`: conversão entre tipos do banco e da aplicação
  - `index.ts`: exportação centralizada de todos os serviços

### `types/`
Definições de tipos TypeScript:

- `database.types.ts`: tipos gerados do schema do Supabase
- (tipos da aplicação estão em `types.ts` na raiz)

### `utils/`
Utilitários e funções auxiliares:

- `criticalPath.ts`: algoritmo de cálculo de caminho crítico (DFS)
- `reportWebVitals.ts`: métricas de performance (FCP, LCP, INP, TTFB)

## Estrutura do Banco de Dados

O ProjectHub utiliza o Supabase PostgreSQL com as seguintes tabelas:

### Tabelas Principais

#### `users`
- `id` (uuid, PK): Identificador único do usuário
- `name` (text): Nome completo
- `avatar` (text, nullable): URL do avatar
- `function` (text, nullable): Função/cargo
- `role` (enum): Papel global (`'admin'`, `'supervisor'`, `'engineer'`)
- `auth_id` (uuid, nullable): Referência ao usuário autenticado do Supabase Auth
- `created_at` (timestamp): Data de criação
- **Nota**: Campo `email` não existe na tabela (email vem do Supabase Auth via `auth_id`)

#### `profiles`
- Similar a `users`, usado para perfis de autenticação do Supabase
- Sincronizado automaticamente com a tabela de autenticação

#### `projects`
- `id` (uuid, PK): Identificador único do projeto
- `name` (text): Nome do projeto
- `description` (text): Descrição detalhada
- `start_date` (date): Data de início
- `end_date` (date): Data de término
- `status` (enum): Status (planning, in_progress, on_hold, completed, cancelled)
- `project_type` (enum): Tipo (homologacao, renovacao_cct, outros)
- `budget` (numeric): Orçamento planejado
- `actual_cost` (numeric): Custo real
- `client_name` (text): Nome do cliente
- `client_email` (text): Email do cliente
- `last_email_notification` (timestamp, nullable): Última notificação por email
- `last_whatsapp_notification` (timestamp, nullable): Última notificação por WhatsApp
- `created_at`, `updated_at` (timestamp): Datas de criação e atualização

#### `tasks`
- `id` (uuid, PK): Identificador único da tarefa
- `project_id` (uuid, FK): Referência ao projeto
- `name` (text): Nome da tarefa
- `description` (text): Descrição
- `status` (enum): Status (pending, todo, in_progress, done)
- `priority` (enum): Prioridade (low, medium, high)
- `due_date` (date): Data de vencimento
- `assignee_id` (uuid, FK, nullable): Responsável pela tarefa
- `duration` (integer): Duração em dias
- `dependencies` (text[]): Array de IDs de tarefas dependentes
- `created_at`, `updated_at` (timestamp)

#### `project_team`
- `id` (uuid, PK): Identificador único
- `project_id` (uuid, FK): Referência ao projeto
- `user_id` (uuid, FK): Referência ao usuário
- `role` (enum): Papel no projeto (admin, editor, viewer)
- `created_at` (timestamp)

#### `attachments`
- `id` (uuid, PK): Identificador único
- `project_id` (uuid, FK): Referência ao projeto
- `task_id` (uuid, FK, nullable): Referência à tarefa (opcional)
- `name` (text): Nome do arquivo
- `type` (text): Tipo MIME
- `size` (integer): Tamanho em bytes
- `url` (text): URL pública do arquivo
- `uploaded_by` (uuid, FK): Quem fez o upload
- `created_at` (timestamp)

#### `messages`
- `id` (uuid, PK): Identificador único
- `sender_id` (uuid, FK): Remetente da mensagem
- `channel` (text): Canal/contexto da mensagem
- `content` (text): Conteúdo da mensagem
- `is_read` (boolean): Status de leitura
- `created_at` (timestamp)

### Relacionamentos

```
users ──┬─> tasks (assignee)
        ├─> project_team (member)
        ├─> messages (sender)
        └─> attachments (uploaded_by)

projects ──┬─> tasks
           ├─> project_team
           └─> attachments

tasks ──> attachments (opcional)
```

### Índices Importantes

- `projects.status`, `projects.project_type`
- `tasks.project_id`, `tasks.assignee_id`, `tasks.status`
- `project_team.project_id`, `project_team.user_id`
- `attachments.project_id`, `attachments.task_id`
- `messages.channel`, `messages.sender_id`

## Como Executar

### Instalação Local

1. **Clone o repositório e instale dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env.local` na raiz do projeto com:
   
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=sua-url-do-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   
   # Google Gemini AI (opcional)
   VITE_GEMINI_API_KEY=sua-chave-gemini
   # ou
   API_KEY=sua-chave-gemini
   ```

3. **Configure o Supabase Storage:**
   
   No dashboard do Supabase, crie os seguintes buckets:
   
   - **Bucket `avatars`** (público):
     - Para upload de fotos de perfil
     - Configurar políticas RLS para autenticados
   
   - **Bucket `project-files`** (público) - *planejado*:
     - Para arquivos de projetos
     - Limite de 10 MB por arquivo
     - Tipos permitidos: PDF, DOC, DOCX, imagens

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   
   A aplicação estará disponível em `http://localhost:5173`

### Observações Importantes

- ⚠️ Sem a chave do Gemini, funcionalidades de análise de risco e insights de caminho crítico permanecem inativas, mas o restante da aplicação segue operacional.
- ⚠️ Sem configurar o bucket `avatars`, o upload de fotos de perfil falhará.
- ℹ️ O sistema está integrado ao Supabase para persistência de dados. Certifique-se de que as tabelas estão criadas no banco.
- 🔧 **Cache do navegador**: Ao fazer mudanças no código, use `npm run dev` para desenvolvimento com hot reload. Para limpar cache do navegador, use `Ctrl + Shift + R` (Firefox/Chrome). Veja `docs/LIMPAR_CACHE_NAVEGADOR.md` para instruções detalhadas.
- 🔐 **Roles no banco**: Os roles são armazenados em inglês minúsculo no banco (`'admin'`, `'supervisor'`, `'engineer'`) e convertidos automaticamente para português na aplicação (`'Administrador'`, `'Supervisor'`, `'Engenheiro'`). Os mappers em `services/api/mappers.ts` garantem essa conversão.

### Build para Produção

```bash
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

## Considerações de Escalabilidade e Manutenção

### Arquitetura Multitenant
- Estruture ambientes por tenant definindo filtros globais (`setGlobalProjectFilter`) e segmentação por organização
- Futuras integrações com Supabase devem usar colunas `tenant_id` para isolamento de dados
- Implemente Row Level Security (RLS) no Supabase para garantir isolamento entre tenants

### Camadas de Serviço
- Padronize camadas de serviço com rotas intermediárias (BFF ou Supabase Edge Functions)
- Reduza lógica cliente-supabase direta para melhorar segurança
- Habilite caching e otimizações de rede
- Centralize validações e regras de negócio no backend

### Manutenibilidade do Código
- Monitore o crescimento dos arquivos em `components/` e `hooks/`
- Quando módulos passarem de ~300 linhas, considere:
  - Quebrar em subcomponentes menores
  - Extrair hooks auxiliares customizados
  - Separar lógica de apresentação e negócio
- `useProjectContext.tsx` (356 linhas) é candidato a refatoração futura

### Gestão de Estado
- Considere migrar para Redux Toolkit ou Zustand quando:
  - O contexto crescer além de 500 linhas
  - Houver necessidade de DevTools avançadas
  - Performance de re-renders se tornar problema
- Implemente normalização de dados para grandes volumes
- Use React Query/TanStack Query para cache de dados do servidor

### Sistema de Permissões
- Atual: permissões globais (Admin, Supervisor, Engineer) + permissões por projeto (admin, editor, viewer)
- Evolução sugerida:
  - Sistema de roles e permissões granulares
  - Permissões por módulo configuráveis (já iniciado em PermissionSettingsView)
  - Políticas de acesso baseadas em atributos (ABAC)

### Exclusão de Dados
- **Implementação atual**: 
  - Hard delete (remoção permanente) com validações robustas
  - Modal profissional com análise de impacto
  - Reatribuição de tarefas antes da exclusão
  - Audit logging para rastreabilidade
  - Proteção contra exclusão do admin único ou próprio perfil
- **Evolução sugerida**:
  - Implementar Soft Delete com campo `deleted_at`
  - Sistema de auditoria persistente em banco
  - Período de quarentena antes da exclusão definitiva
  - Funcionalidade de restauração de dados
  
### Upload de Arquivos
- **Status atual**: 
  - Avatares: Supabase Storage bucket `avatars` (funcional)
  - Arquivos de projeto: armazenamento local temporário
- **Próximos passos**:
  - Criar bucket `project-files` no Supabase
  - Implementar upload real de arquivos de projeto
  - Adicionar validação de tipo MIME e tamanho
  - Implementar exclusão de arquivos antigos
  - Considerar CDN para distribuição global

## Otimizações de Performance

- **Lazy loading agressivo**: views de domínio (`Dashboard`, `TaskList`, etc.), `ProjectProvider`, gráficos (Recharts) e integrações Gemini só são carregados quando necessários, reduzindo o bundle inicial para ~205 kB (≈64 kB gzip).
- **Divisão manual de chunks**: configuração em `vite.config.ts` separa dependências pesadas (`recharts`, `supabase`, `react`, `@google/genai`, utilitários), melhorando cache de longo prazo.
- **Métricas em desenvolvimento**: `utils/reportWebVitals.ts` inicializa Web Vitals automaticamente em modo DEV e loga FCP, LCP, INP, TTFB etc. no console.
- **Boas práticas sugeridas**:
  1. Rode `npm run build` e sirva `dist/` com `npm run preview` antes de executar Lighthouse.
  2. No Chrome DevTools > Lighthouse (modo Desktop), mensure LCP/FID após cada release para acompanhar regressões.
  3. Em produção, configure caching HTTP com `immutable` para chunks versionadas e `max-age` curto para `index.html`.

## Próximos Passos Sugeridos

### Testes e Qualidade
- Adicionar testes unitários (React Testing Library, Vitest) para componentes críticos:
  - `Dashboard`, `TaskList`, `ProjectForm`
  - `useProjectContext`, `useAuth` hooks
  - Funções de validação e cálculos
- Implementar testes E2E com Playwright ou Cypress
- Adicionar cobertura mínima de 70%
- Integrar CI/CD com verificação de testes

### Observabilidade e Logs
- Formalizar política de logs estruturados (JSON)
- Integração com Sentry para error tracking
- Implementar telemetria com OpenTelemetry
- **Logs de auditoria implementados**: console logs para exclusão de usuários e reatribuição de tarefas
- Persistir logs de auditoria no banco de dados
- Dashboards de monitoramento (Grafana, DataDog)

### Documentação
- Diagramas de fluxo de dados (DFD)
- Diagramas de arquitetura (C4 Model)
- Políticas de acesso por perfil detalhadas
- Guias de deploy multitenant
- API documentation (se adicionar backend)
- Runbooks para operações comuns
- **Documentação criada**:
  - `docs/DELETE_USER_FEATURE.md`: funcionalidade de exclusão de usuários
  - `docs/ONDE_EXCLUIR_USUARIOS.md`: guia visual para localizar botões de exclusão
  - `docs/CORRECAO_ROLE_ADMIN.md`: correção do problema de mapeamento de roles
  - `docs/LIMPAR_CACHE_NAVEGADOR.md`: guia completo para limpar cache do navegador
  - `SUPABASE_SETUP.md`: instruções de configuração do Supabase

### Funcionalidades Pendentes
- **Drag-and-drop no Kanban**: implementar reordenação de tarefas
- **Upload de arquivos para Supabase**: migrar de URL temporária para storage real
- **Notificações em tempo real**: usar Supabase Realtime
- **Exportação de relatórios**: PDF, Excel, CSV
- **Gráficos avançados**: mais visualizações no Dashboard
- **Pesquisa global**: buscar em projetos, tarefas e arquivos
- **Filtros avançados**: por data, status, responsável, prioridade
- **Tags e labels**: categorização flexível de projetos e tarefas
- **Comentários em tempo real**: sistema de chat por tarefa
- **Anexos em tarefas**: upload de arquivos por tarefa
- **Histórico de alterações**: audit trail completo
- **Notificações push**: browser notifications para eventos importantes

### Melhorias de UX
- Dark mode persistente (tema já implementado, falta polimento)
- Modo offline com sincronização
- Atalhos de teclado
- Busca fuzzy inteligente
- Tour guiado para novos usuários
- Tooltips contextuais
- Feedback visual aprimorado (loading states, skeletons)
- Animações suaves (Framer Motion)

### Performance
- Implementar virtualização de listas longas (react-window)
- Code splitting mais granular
- Preload de dados críticos
- Service Worker para cache
- Otimização de imagens (WebP, lazy loading)
- Reduzir re-renders desnecessários (React.memo, useMemo)

### Segurança
- Implementar Content Security Policy (CSP)
- Adicionar rate limiting no backend
- Validação de entrada robusta
- Sanitização de dados do usuário
- Proteção contra XSS e CSRF
- Auditoria de segurança periódica
- Backup automático de dados críticos

### Infraestrutura
- Pipeline CI/CD automatizado
- Ambientes de staging e production
- Feature flags para releases graduais
- Monitoramento de uptime e SLA
- Estratégia de backup e recuperação
- Documentação de runbooks operacionais

## 🔧 Correções e Melhorias Recentes

### Correção de Mapeamento de Roles (Nov 2025)

**Problema**: Usuários administradores não conseguiam ver os botões de edição e exclusão nos cards de membros da equipe.

**Causa raiz**: O hook `useAuth` estava retornando os dados do usuário diretamente do banco sem aplicar o mapeamento de roles. No banco, os roles são armazenados em inglês minúsculo (`'admin'`, `'supervisor'`, `'engineer'`), mas a aplicação espera em português (`'Administrador'`, `'Supervisor'`, `'Engenheiro'`).

**Solução implementada**:
1. Adicionado `mapUser` no `useAuth.tsx` para garantir conversão automática de roles
2. Corrigido `mappers.ts` para lidar com campos opcionais (ex: email)
3. Adicionado badge visual "👑 ADMIN" no header para identificação clara
4. Documentação completa em `docs/CORRECAO_ROLE_ADMIN.md`

**Arquivos modificados**:
- `hooks/useAuth.tsx`: adicionado mapeamento de usuário
- `services/api/mappers.ts`: tratamento de email opcional
- `components/layout/Header.tsx`: badge de administrador
- `docs/overview.md`: atualizado com schema real do banco

**Lição aprendida**: Sempre use os mappers ao buscar dados do Supabase para garantir conversão consistente entre tipos do banco e da aplicação.

### Feature: Exclusão Profissional de Usuários (Nov 2025)

**Implementação**: Sistema completo de exclusão de usuários com validações de segurança, análise de impacto e reatribuição de tarefas.

**Componentes criados**:
- `DeleteUserModal.tsx`: modal com análise de impacto e confirmação
- Lógica de exclusão em `useProjectContext.tsx` com validações robustas
- Documentação em `docs/DELETE_USER_FEATURE.md`

**Recursos**:
- ✅ Análise de impacto (projetos e tarefas afetadas)
- ✅ Reatribuição obrigatória de tarefas
- ✅ Confirmação por digitação do nome
- ✅ Validações: não exclui próprio perfil, admin único
- ✅ Audit logging completo no console
- ✅ Interface visual moderna

### Documentação Expandida (Nov 2025)

**Novos documentos criados**:
- `docs/DELETE_USER_FEATURE.md`: documentação completa da feature de exclusão
- `docs/ONDE_EXCLUIR_USUARIOS.md`: guia visual para localizar botões
- `docs/CORRECAO_ROLE_ADMIN.md`: análise detalhada da correção de roles
- `docs/LIMPAR_CACHE_NAVEGADOR.md`: guia completo para desenvolvedores

**Objetivo**: Facilitar onboarding de novos desenvolvedores e troubleshooting de problemas comuns.

### Correção de Criação e Edição de Projetos (Nov 2025)

**Problema**: Projetos não estavam sendo salvos corretamente no Supabase, tanto na criação quanto na edição.

**Causas identificadas**:
1. **Criação**: Campo obrigatório `created_by` não estava sendo enviado
2. **Criação**: Campo `cliente_email` estava sendo enviado como `client_email` (nome incorreto)
3. **Edição**: Campo `created_by` estava sendo enviado incorretamente no UPDATE (deve ser definido apenas na criação)
4. **Edição**: Atualização do estado não preservava tarefas, equipe e arquivos existentes

**Soluções implementadas**:

**Método `addProject` (criação)**:
- ✅ Adicionado campo `created_by` com ID do usuário logado (`profile?.id || null`)
- ✅ Corrigido nome do campo de `client_email` para `cliente_email`
- ✅ Adicionados logs detalhados para depuração

**Método `updateProject` (edição)**:
- ✅ **REMOVIDO** campo `created_by` do payload de atualização (não deve ser alterado após criação)
- ✅ Corrigido nome do campo de `client_email` para `cliente_email`
- ✅ Implementada lógica para preservar tarefas, equipe e arquivos existentes ao atualizar o estado
- ✅ Adicionados logs detalhados da resposta do Supabase

**Arquivos modificados**:
- `hooks/useProjectContext.supabase.tsx`: métodos `addProject` e `updateProject`

**Regras importantes**:
- ⚠️ O campo `created_by` deve ser enviado **APENAS** na criação do projeto
- ⚠️ O campo `created_by` **NÃO** deve ser enviado na atualização do projeto (causa falha silenciosa)
- ⚠️ O campo correto no banco é `cliente_email`, não `client_email`
- ⚠️ Ao atualizar o estado local, sempre preserve os dados relacionados (tasks, team, files)
- ⚠️ **CRÍTICO**: Enviar `created_by` no update faz a requisição travar sem retornar erro

**Benefícios**:
- ✅ Criação de projetos funciona corretamente
- ✅ Edição de projetos funciona corretamente
- ✅ Rastreabilidade de quem criou cada projeto
- ✅ Preservação de dados relacionados durante edição
- ✅ Logs detalhados para facilitar depuração futura

### Alteração no Status Inicial de Tarefas Padrão (Nov 2025)

**Modificação**: Tarefas padrão criadas automaticamente para projetos do tipo "Homologação" e "Renovação CCT" agora são criadas com status "A Fazer" ao invés de "Pendente".

**Motivação**: Melhorar o fluxo de trabalho inicial, colocando as tarefas diretamente na coluna de trabalho ativo do Kanban.

**Implementação**:
- Alterado o status de `'pending'` para `'todo'` no método `addProject`
- Arquivo modificado: `hooks/useProjectContext.supabase.tsx` (linha 173)

**Impacto**:
- ✅ Tarefas aparecem diretamente na coluna "A Fazer" do Kanban
- ✅ Fluxo de trabalho mais intuitivo para novos projetos
- ✅ Reduz um passo manual de mover tarefas de "Pendente" para "A Fazer"

### Melhorias na Gestão de Tarefas e Projetos (Nov 2025)

**Gestão de Tarefas**

- Ajustado o `TaskForm` para garantir que o botão de salvar não permaneça travado em estado de "Salvando" ao reabrir o modal de edição
- Atualizado o `NotificationSenderModal` para:
  - Considerar apenas tarefas com status **Pendente** e **A Fazer** na composição de e-mails e mensagens de WhatsApp
  - Sincronizar automaticamente o projeto selecionado com o filtro atual da página de tarefas
 - Unificada a paleta de cores de status entre **Quadro de Tarefas (Kanban)** e **Cronograma**, garantindo que:
   - **Pendente** seja exibido em vermelho
   - **A Fazer** seja exibido em roxo
   - **Em andamento** seja exibido em azul
   - **Concluído** seja exibido em verde
- Implementado **Modal de Resumo de Tarefas** (`TaskSummaryModal.tsx`):
  - Novo botão "Resumo" ao lado de "Lembrete de Tarefas" na página de tarefas
  - Exibe detalhes completos de cada tarefa (nome, descrição, data de vencimento) agrupados por status
  - Considera apenas tarefas em **Pendente**, **A Fazer** e **Em andamento**
  - Ligado ao projeto selecionado no filtro (solicita seleção de projeto se filtro estiver em "Todos")
  - Interface visual com bordas coloridas por status para identificação rápida

**Gestão de Projetos**

- Adicionada alternância de visualização entre **Cards** e **Lista** na página de projetos, reaproveitando as mesmas métricas e ações em ambos os modos
- Implementados filtros combináveis por **nome da empresa**, **tipo de projeto**, **nome do contato** e **data de início**, aplicados tanto à visão em cards quanto à visão em lista
 - Ajustado o **ScheduleView** para remover a opção "Todos os Projetos" no cronograma, garantindo que sempre haja um projeto selecionado e evitando combinações ambíguas de datas


### Correção Crítica: Bug do Supabase JS com Emails Longos (Nov 2025)

**Problema identificado**: Criação e edição de projetos travavam indefinidamente quando o campo `cliente_email` tinha mais de ~30 caracteres. O mesmo problema ocorria na criação em lote de tarefas padrão.

**Sintomas**:
- ✅ Emails curtos (≤30 caracteres): funcionavam perfeitamente
- ❌ Emails longos (>30 caracteres): requisição travava sem retornar erro ou timeout
- ❌ Modal de cadastro/edição ficava travado em "Salvando..."
- ❌ Projeto era criado no banco (via SQL direto funcionava), mas não via cliente JS

**Causa raiz**: Bug no cliente `@supabase/supabase-js` (versão 2.45.0) que trava ao fazer INSERT/UPDATE com campos text longos. O problema afeta tanto operações diretas quanto chamadas RPC.

**Investigação realizada**:
1. ✅ Verificado que o banco aceita emails longos (teste via SQL direto funcionou)
2. ✅ Confirmado que não há constraints, validações ou limites de tamanho no campo
3. ✅ Descartado problema com RLS (políticas simplificadas, mesmo problema)
4. ✅ Descartado problema com triggers (removido temporariamente, mesmo problema)
5. ✅ Identificado que o timeout ocorria tanto no cliente JS quanto em chamadas RPC via cliente JS
6. ✅ Confirmado que chamadas RPC via `fetch` direto funcionam perfeitamente

**Soluções implementadas**:

#### 1. Funções RPC no Supabase
Criadas funções SQL personalizadas que contornam o bug do cliente JS:

```sql
-- Função para criar projeto
CREATE OR REPLACE FUNCTION create_project(
    p_name TEXT, p_description TEXT, p_start_date DATE, p_end_date DATE,
    p_status TEXT, p_project_type TEXT, p_client_name TEXT,
    p_cliente_email TEXT, p_created_by UUID
) RETURNS SETOF projects ...

-- Função para atualizar projeto
CREATE OR REPLACE FUNCTION update_project(
    p_id UUID, p_name TEXT, p_description TEXT, p_start_date DATE,
    p_end_date DATE, p_status TEXT, p_project_type TEXT,
    p_client_name TEXT, p_cliente_email TEXT
) RETURNS SETOF projects ...
```

#### 2. Uso de Fetch Direto
Substituído o cliente Supabase JS por chamadas `fetch` diretas à API REST do Supabase:

**Arquivo**: `services/api/projects.service.ts`
- ✅ Método `create`: usa `fetch` para chamar RPC `create_project`
- ✅ Método `update`: usa `fetch` para chamar RPC `update_project`

**Arquivo**: `services/api/tasks.service.ts`
- ✅ Método `createBulk`: usa `fetch` para inserir múltiplas tarefas

**Exemplo de implementação**:
```typescript
const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_project`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({ p_name, p_description, ... })
});
```

#### 3. Logs Detalhados
Adicionados logs completos para facilitar depuração:
- `ProjectsService.create/update`: logs de dados enviados, tamanho do email, status HTTP, resposta
- `TasksService.createBulk`: logs de quantidade de tarefas, status HTTP
- `useProjectContext.addProject`: logs de cada etapa (criação, mapeamento, tarefas, estado)

**Arquivos modificados**:
- `services/api/projects.service.ts`: métodos `create` e `update`
- `services/api/tasks.service.ts`: método `createBulk`
- `hooks/useProjectContext.tsx`: logs adicionados no `addProject`
- `services/supabaseClient.ts`: configurações de timeout e headers

**Resultados**:
- ✅ **Criação de projetos** com emails longos funciona perfeitamente
- ✅ **Edição de projetos** com emails longos funciona perfeitamente
- ✅ **Criação de tarefas em lote** funciona sem travamentos
- ✅ **Modal fecha** corretamente após salvar
- ✅ **Projetos aparecem** na lista imediatamente
- ✅ **Performance**: requisições completam em <1 segundo

**Lições aprendidas**:
1. ⚠️ O cliente Supabase JS pode ter bugs com campos text longos
2. ✅ Sempre testar operações críticas via SQL direto para isolar problemas
3. ✅ Usar `fetch` direto é uma solução confiável quando o cliente JS falha
4. ✅ Funções RPC no Supabase são úteis para contornar limitações do cliente
5. ✅ Logs detalhados são essenciais para depuração de problemas intermitentes

**Workaround temporário**: Se o problema persistir em outras operações, considere:
- Usar `fetch` direto para todas as operações críticas
- Reportar o bug para o time do Supabase
- Atualizar para versão mais recente do `@supabase/supabase-js` quando disponível

