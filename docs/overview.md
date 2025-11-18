## Visão Geral

TaskMeet é uma plataforma web multitenant de gestão de projetos orientada a equipes distribuídas. O aplicativo consolida planejamento, execução e monitoramento em um único painel, oferecendo visão integrada de projetos, tarefas, cronograma, comunicação e colaboração da equipe. O fluxo principal passa pelo provedor de contexto de projetos (`useProjectContext`), que centraliza o estado compartilhado da aplicação e implementa todas as operações CRUD.

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
- **Sistema de Convites** (`InviteMemberModal`):
  - Primeiro usuário cadastrado torna-se automaticamente **Administrador**
  - Cadastros subsequentes **apenas via convite** enviado pelo administrador
  - Modal de convite integrado na página de Equipe (botão "+ Novo Membro")
  - Geração de links únicos de convite válidos por **7 dias**
  - Envio de convites via email (link `mailto:` pronto para uso)
  - Pré-preenchimento automático de dados (nome, email, perfil) no cadastro
  - Logout automático ao acessar link de convite (para processar o cadastro)
  - Validação de expiração e status do convite
  - Marcação automática de convite como "aceito" após cadastro bem-sucedido
  - Tabela `user_invites` no Supabase com RLS policies
  - Roles pré-definidos pelo admin: **Supervisor** ou **Engenheiro**
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

O TaskMeet utiliza o Supabase PostgreSQL com as seguintes tabelas:

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

#### `user_invites`
- `id` (uuid, PK): Identificador único (usado como token de convite)
- `email` (text): Email do convidado
- `name` (text): Nome do convidado
- `role` (enum): Perfil pré-definido (`'supervisor'` ou `'engineer'`)
- `status` (enum): Status do convite (`'pending'`, `'accepted'`, `'expired'`)
- `invited_by` (uuid, FK, nullable): Quem enviou o convite (referência a `users.id`)
- `expires_at` (timestamp): Data de expiração (7 dias após criação)
- `created_at` (timestamp): Data de criação

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

### Melhorias de UX e Comunicação (Nov 2025)

**Sistema de Notificações de Mensagens Não Lidas**

Implementado sistema completo de notificações para mensagens de comunicação:

1. **Ícone de Notificação no Header** (`Header.tsx`):
   - Badge vermelho pulsante com contador de mensagens não lidas
   - Exibe número até 99+ mensagens
   - Clique navega diretamente para a página de Comunicação
   - Tooltip informativo com quantidade de mensagens
   - Integrado com `useProjectContext` para contagem em tempo real

2. **Badges por Canal** (`CommunicationView.tsx`):
   - Indicadores vermelhos ao lado de cada canal/projeto com mensagens não lidas
   - Contador específico por canal (ex: "# SPACE [3]")
   - Facilita identificação rápida de qual projeto tem mensagens novas
   - Atualização dinâmica conforme mensagens são lidas

3. **Marcação Automática de Leitura**:
   - Mensagens marcadas como lidas automaticamente ao visualizar um canal
   - **Persistência no banco de dados** via `MessagesService.markChannelAsRead`
   - Badges desaparecem instantaneamente ao abrir o canal
   - Estado mantido após recarregar a página
   - Exclui automaticamente as próprias mensagens do usuário (não conta como não lida)

4. **Avatar Dinâmico em Mensagens** (`ChatMessage.tsx`):
   - Avatares atualizados em tempo real nas mensagens
   - Busca avatar do contexto de usuários para sempre mostrar a versão mais recente
   - Ao trocar avatar no perfil, todas as mensagens antigas mostram o novo avatar

**Arquivos modificados**:
- `components/layout/Header.tsx`: adicionado ícone de notificação com badge
- `components/communication/CommunicationView.tsx`: badges por canal e auto-read
- `components/communication/ChatMessage.tsx`: avatar dinâmico
- `hooks/useProjectContext.tsx`: função `markMessagesAsRead` assíncrona
- `services/api/messages.service.ts`: método `markChannelAsRead` com persistência
- `App.tsx`: função `handleGoToCommunication` para navegação

**Configuração SQL necessária no Supabase**:
```sql
-- Garantir coluna is_read existe
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Políticas RLS para permitir atualização de mensagens
CREATE POLICY "Users can mark messages as read" ON messages
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Índice para performance
CREATE INDEX idx_messages_is_read ON messages(channel, is_read, sender_id);
```

**Melhorias Visuais na Interface**

1. **Reordenação do Sidebar** (`Sidebar.tsx`):
   - Ordem otimizada para fluxo de trabalho intuitivo:
     1. Dashboard
     2. Projetos
     3. Tarefas
     4. Cronograma
     5. Equipe
     6. Comunicação (movida para 6º para melhor acesso)
     7. Arquivos
     8. Relatórios
     9. Histórico de Cobranças

2. **Lista de Projetos** (`ProjectList.tsx`):
   - Progresso em **negrito** na visualização em lista para destaque visual
   - Exemplo: "Tarefas: 10/15  **Progresso: 67%**"

3. **Navegação de Histórico de Cobranças** (`NotificationLogTable.tsx`):
   - Clicar em uma linha da tabela navega diretamente para as tarefas do projeto
   - Aplica filtro automático pelo projeto selecionado
   - Props `setCurrentView` e `setGlobalProjectFilter` para navegação integrada

4. **Lista de Tarefas com Cores** (`TaskList.tsx`):
   - **Títulos de status coloridos** na visualização em lista:
     - Pendente: vermelho (`text-red-600 dark:text-red-400`)
     - A Fazer: roxo (`text-purple-600 dark:text-purple-400`)
     - Em andamento: azul (`text-blue-600 dark:text-blue-400`)
     - Concluído: verde (`text-green-600 dark:text-green-400`)
   - **Bordas laterais coloridas** em cada linha de tarefa (4px) e no cabeçalho de status
   - Compatível com modo claro e escuro
   - Identificação visual instantânea do status

**Melhorias no Perfil do Usuário**

1. **Correção do Upload de Avatar** (`UserProfileView.tsx`):
   - **PROBLEMA**: Avatar não estava sendo salvo no banco de dados
   - **CAUSA**: Linha de `updateUser` estava comentada após o upload
   - **SOLUÇÃO**: Ativado `updateUser({ ...user, email: editedEmail, avatar: finalAvatarUrl })`
   - Avatar agora persiste corretamente após upload
   - Integração com `useProjectContext.updateUser`

2. **Estatísticas do Perfil Atualizadas**:
   - **ANTES**: Tarefas Atribuídas, Concluídas, Atrasadas
   - **DEPOIS**: Grid de 4 cards responsivo:
     1. **Tarefas Atribuídas** (azul): total de tarefas do usuário
     2. **Tarefas Pendentes** (vermelho): status `Pending`
     3. **Tarefas A Fazer** (cinza): status `ToDo`
     4. **Tarefas Em Andamento** (laranja): status `InProgress`
   - Layout responsivo: 1 coluna (mobile), 2 colunas (tablet), 4 colunas (desktop)
   - Estatísticas mais úteis e alinhadas com o fluxo de trabalho real

**Resultados**:
- ✅ Usuários nunca perdem mensagens não lidas
- ✅ Identificação instantânea de qual projeto tem mensagens novas

### Sistema de Convites e Gestão de Acesso (Nov 2025)

**Implementação**: Sistema completo de controle de acesso com convites por email e lógica de primeiro administrador.

**Motivação**: Melhorar a segurança e controlar o acesso à aplicação, evitando cadastros abertos e não autorizados.

**Funcionalidades implementadas**:

1. **Lógica de Primeiro Administrador** (`LoginPage.tsx`):
   - O primeiro usuário a se cadastrar torna-se automaticamente **Administrador**
   - Sistema detecta ausência de admins na tabela `users`
   - Cadastro direto bloqueado automaticamente após criação do primeiro admin
   - Mensagem clara para usuários: "Novos cadastros só podem ser feitos via convite do administrador"

2. **Modal de Convite de Membros** (`InviteMemberModal.tsx`):
   - Integrado na página de Equipe (botão "+ Novo Membro")
   - Campos: Nome, Email, Perfil (Supervisor ou Engenheiro)
   - Geração automática de token único (UUID)
   - Data de expiração: 7 dias após criação
   - Link de convite: `http://localhost:3000/?invite=TOKEN`
   - Botão "Copiar Link" para facilitar compartilhamento
   - Link `mailto:` pronto para envio por email

3. **Tabela `user_invites`** (Supabase):
   - Campos: `id` (token), `email`, `name`, `role`, `status`, `invited_by`, `expires_at`, `created_at`
   - Status possíveis: `'pending'`, `'accepted'`, `'expired'`
   - RLS Policies configuradas:
     - SELECT: público (permite validação de tokens)
     - INSERT: apenas admins
     - UPDATE: permitido (para marcar como aceito)
   - Índices para performance em buscas por email e status

4. **Processamento de Convites** (`LoginPage.tsx`):
   - Detecção automática do parâmetro `?invite=TOKEN` na URL
   - Validação completa:
     - Token existe no banco
     - Status = 'pending'
     - Data de expiração válida
   - Pré-preenchimento automático de campos:
     - Nome (desabilitado)
     - Email (desabilitado)
     - Perfil (desabilitado, definido pelo admin)
   - Usuário cria apenas a senha
   - Marcação automática do convite como 'accepted'

5. **Logout Automático ao Acessar Convite** (`App.tsx`):
   - Sistema detecta `?invite=` na URL
   - Se há sessão ativa, faz logout automático
   - Força exibição da `LoginPage` para processar o convite
   - Evita confusão de contas e garante fluxo correto

6. **Serviço de Convites** (`InvitesService`):
   - `create()`: cria novo convite no banco
   - `getById()`: busca convite por token
   - `markAccepted()`: atualiza status para 'accepted'
   - Tratamento robusto de erros (ex: token não encontrado)

7. **Correção de Permissões RLS** (`supabase_fix_admin_permissions.sql`):
   - Policy UPDATE atualizada para permitir admins editarem qualquer usuário
   - Policy DELETE já permitia admins excluírem usuários
   - Correção crítica: admins agora podem reatribuir tarefas durante exclusão

**Componentes criados/modificados**:
- `components/team/InviteMemberModal.tsx`: modal de convite (novo)
- `components/team/TeamManagementView.tsx`: integração do modal
- `components/auth/LoginPage.tsx`: lógica de primeiro admin e processamento de convites
- `components/ui/Icons.tsx`: ícones `UserIcon` e `UserPlusIcon`
- `App.tsx`: logout automático ao detectar convite
- `services/api/invites.service.ts`: CRUD de convites (novo)
- `services/api/index.ts`: export de `InvitesService` e `InviteRow`
- `types/database.types.ts`: tipos da tabela `user_invites`

**Scripts SQL necessários**:
- `supabase_create_invites_table.sql`: criação da tabela e RLS policies
- `supabase_fix_admin_permissions.sql`: correção de permissões de UPDATE

**Fluxo completo**:
1. Admin acessa página Equipe → clica "+ Novo Membro"
2. Preenche nome, email e seleciona perfil (Supervisor/Engenheiro)
3. Clica "Gerar Convite" → sistema cria registro no banco
4. Admin copia link ou envia por email (botão "Enviar por E-mail")
5. Convidado recebe email e clica no link
6. Se convidado está logado, sistema faz logout automático
7. Tela de cadastro exibe mensagem: "Você foi convidado(a)..."
8. Campos pré-preenchidos e bloqueados (nome, email, perfil)
9. Convidado cria senha e clica "Cadastrar"
10. Sistema marca convite como 'accepted'
11. Email de confirmação enviado (Supabase Auth)
12. Convidado confirma email e pode fazer login

**Validações de segurança**:
- Apenas admins podem criar convites
- Convites expiram em 7 dias
- Token único e não reutilizável
- Status verificado antes do uso
- Cadastro direto bloqueado após criação do admin
- Logout forçado ao processar convite (evita confusão de contas)

**Mensagens de erro amigáveis**:
- "Convite inválido ou expirado"
- "Este convite já foi utilizado ou expirou"
- "Este convite expirou"
- "Novos cadastros só podem ser feitos via convite do administrador"

**Resultados**:
- Controle total de acesso à aplicação
- Apenas um administrador por sistema
- Cadastros apenas via convite autorizado
- Perfis pré-definidos pelo admin
- Expiração automática de convites
- Fluxo de cadastro simplificado e seguro
- UX clara com mensagens informativas

**Arquivos de documentação**:
- `docs/overview.md`: atualizado com sistema de convites (este documento)

### Sistema de Anotações do Projeto (Nov 2025)

**Implementação**: Sistema completo de anotações por projeto com histórico temporal para rastreamento de condições, decisões e progresso.

**Motivação**: Permitir que a equipe registre o estágio atual de cada projeto, observações importantes, decisões tomadas e atualizações de status de forma organizada e rastreável ao longo do tempo.

**Funcionalidades implementadas**:

1. **Ícone de Anotações nos Cards de Projeto** (`ProjectList.tsx`):
   - Novo ícone 📄 (DocumentTextIcon) adicionado aos cards de projeto
   - Posicionado entre "Upload" e "Gerenciar Equipe"
   - Cor: amarelo âmbar (hover: amber-600)
   - Tooltip: "Condição do Projeto / Anotações"
   - Disponível tanto na visualização em **cards** quanto em **lista**

2. **Modal de Anotações do Projeto** (`ProjectConditionModal.tsx`):
   - Interface completa para gerenciar anotações de projeto
   - Seletor de projeto (pré-selecionado ao abrir via card)
   - Campo de texto para nova anotação com placeholder descritivo
   - Histórico de anotações em ordem cronológica reversa (mais recente primeiro)
   - Informações por anotação:
     - Nome do usuário que criou
     - Data e hora de criação (formato DD/MM/YYYY HH:MM)
     - Texto completo da anotação
   - Suporte a texto multilinha preservando formatação

3. **Tabela `project_notes`** (Supabase):
   - Estrutura:
     - `id` (uuid, PK): Identificador único
     - `project_id` (uuid, FK): Referência ao projeto
     - `note_text` (text): Conteúdo da anotação
     - `created_at` (timestamp): Data de criação
     - `created_by` (uuid, FK): Usuário que criou
   - Índices para performance:
     - `idx_project_notes_project_id`: busca por projeto
     - `idx_project_notes_created_at`: ordenação por data
     - `idx_project_notes_project_created`: busca composta
   - RLS Policies:
     - SELECT: todos os usuários autenticados podem visualizar
     - INSERT: usuários autenticados podem criar (validação de `created_by`)
     - UPDATE: usuários podem editar suas próprias anotações
     - DELETE: admins podem deletar qualquer anotação, usuários podem deletar as próprias

4. **Tratamento de Erros e Logs** (`ProjectConditionModal.tsx`):
   - Logs detalhados no console para debug:
     - `[ProjectConditionModal] Carregando notas para projeto: [ID]`
     - `[ProjectConditionModal] Encontradas X notas`
     - `[ProjectConditionModal] Erro na query de notas: [ERRO]`
   - Mensagens de erro específicas:
     - "A tabela de anotações não existe no banco de dados. Execute o script SQL de criação."
     - "Sem permissão para acessar as anotações. Verifique as políticas RLS no Supabase."
     - `Erro ao carregar anotações: [mensagem]`
   - Loading state com spinner enquanto carrega anotações
   - Mensagem amigável quando não há anotações: "Nenhuma anotação registrada ainda"

5. **Scripts SQL** (Supabase):
   - `supabase_create_project_notes.sql`: criação da tabela com políticas RLS completas
   - `supabase_allow_select_notes.sql`: permite leitura para usuários autenticados
   - `supabase_setup_project_notes_complete.sql`: script consolidado com:
     - Criação da tabela
     - Índices para performance
     - Todas as políticas RLS (SELECT, INSERT, UPDATE, DELETE)
     - Comentários de documentação
     - Queries de verificação

6. **Documentação** (`INSTRUCOES_CORRIGIR_ANOTACOES.md`):
   - Guia passo a passo para configurar a tabela no Supabase
   - Instruções para debug via console do navegador
   - Troubleshooting de problemas comuns
   - Verificação de resultados esperados

**Arquivos criados/modificados**:
- `components/tasks/ProjectConditionModal.tsx`: modal de anotações (já existia, melhorado)
- `components/projects/ProjectList.tsx`: ícone e integração do modal
- `components/ui/Icons.tsx`: import de `DocumentTextIcon`
- `supabase_setup_project_notes_complete.sql`: script SQL consolidado
- `INSTRUCOES_CORRIGIR_ANOTACOES.md`: documentação de setup

**Fluxo de uso**:
1. Usuário acessa página de Projetos
2. Clica no ícone 📄 (Anotações) em um card de projeto
3. Modal abre com o projeto pré-selecionado
4. Histórico de anotações é carregado automaticamente
5. Usuário digita nova anotação no campo de texto
6. Clica "+ Adicionar Anotação"
7. Anotação é salva no banco com autor e timestamp
8. Lista é atualizada instantaneamente
9. Modal pode ser fechado a qualquer momento

**Casos de uso**:
- Registrar estágio atual da homologação (aguardando documentos, em análise, aprovado)
- Anotar decisões técnicas tomadas (mudança de prazo, adição de requisito)
- Documentar comunicações importantes com cliente
- Rastrear evolução do projeto ao longo do tempo
- Facilitar handoff entre membros da equipe

**Validações de segurança**:
- Apenas usuários autenticados podem criar anotações
- Campo `created_by` validado contra usuário autenticado no banco
- RLS garante isolamento entre projetos
- Admins podem deletar qualquer anotação (moderação)
- Usuários normais só podem deletar suas próprias anotações

**Resultados**:
- ✅ Histórico completo e rastreável de condições do projeto
- ✅ Melhor comunicação entre membros da equipe
- ✅ Facilita handoff e onboarding em projetos em andamento
- ✅ Documentação automática de decisões e mudanças
- ✅ Interface intuitiva e de fácil acesso
- ✅ Logs detalhados para troubleshooting
- ✅ Tratamento robusto de erros com mensagens claras
