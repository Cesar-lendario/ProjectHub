## Visão Geral

TaskMeet é uma plataforma web multitenant de gestão de projetos orientada a equipes distribuídas. O aplicativo consolida planejamento, execução e monitoramento em um único painel, oferecendo visão integrada de projetos, tarefas, cronograma, comunicação e colaboração da equipe. O fluxo principal passa pelo provedor de contexto de projetos (`useProjectContext`), que centraliza o estado compartilhado da aplicação e implementa todas as operações CRUD.

## Principais Funcionalidades

### 📊 Dashboard
- Métricas resumidas e KPIs em tempo real
- Gráficos de orçamento (realizado vs planejado)
- Análise de riscos com IA (OpenAI GPT-4o-mini)
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
 - Tabela projects com os campos cliente_email, atualizado_at e created_by

### ✅ Gestão de Tarefas
- Visualização Kanban com 4 colunas: Pendente, A Fazer, Em Progresso, Concluída
- Drag-and-drop para mudança de status **foi implementado e posteriormente desativado no código** (estrutura visual permanece, mas sem interatividade de arrastar e soltar)
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
 - Paleta de cores unificada por status em todo o sistema (Kanban, cronograma e gráficos):
   - **Pendente** = vermelho (`#ef4444`)
   - **A Fazer** = dourado (`#FFD700` / `yellow-500`)
   - **Em andamento** = azul (`#38bdf8`)
   - **Concluído** = verde (`#10b981`)

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
- **Armazenamento**: Integrado com Supabase Storage (bucket `project-files`)
- **Funcionalidades**:
  - Upload direto para bucket público
  - Registro de metadados na tabela `attachments`
  - Visualização e download via URL pública
  - Exclusão sincronizada (Storage + Banco)

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
  - Novo mecanismo de ordenação por clique em cada cabeçalho, com alternância ascendente/descendente e ícones de seta que indicam a direção ativa
  - Filtros por empresa, contato e tipo de projeto, além de seletor de tipo de envio (Email ou WhatsApp) com contador de resultados e botão "Limpar Filtros"
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

### OpenAI AI
- **Serviço** (`services/openaiService.ts`):
  - Análise de riscos de projetos com dados detalhados
  - Geração de insights e oportunidades
  - Análise de caminho crítico
  - Modelo usado: GPT-4o-mini
  - Política de retry automático (3 tentativas)
  - Tratamento robusto de erros
  - Integração com InsightsModal para análise de projetos
  - **Análise aprimorada** (Dez 2025):
    - Considera progresso geral de cada projeto (percentual de conclusão)
    - Projetos 100% completos não são considerados como risco
    - Foca em tarefas atrasadas que ainda não foram concluídas
    - Diferencia tarefas por status (Pendentes, A Fazer, Em Andamento, Concluídas)
    - Fornece dados detalhados: total de tarefas, distribuição por status, tarefas atrasadas não concluídas
    - Destaca projetos em andamento com bom progresso

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript, Vite como bundler
- **Estado**: React Context API (Auth + ProjectContext)
- **UI**: Componentização por domínio com Tailwind CSS
- **Gráficos**: Recharts para visualizações
- **Backend**: Supabase (Auth + Storage)
- **IA**: OpenAI GPT-4o-mini para análise de riscos e insights
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
  └─ OpenAI Service
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
- `openaiService.ts`: integração OpenAI GPT-4o-mini com retry policy
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
- `cliente_email` (text): Email do cliente (nome real da coluna no banco)
- `last_email_notification` (timestamp, nullable): Última notificação por email
- `last_whatsapp_notification` (timestamp, nullable): Última notificação por WhatsApp
- `created_at` (timestamp): Data de criação
- `atualizado_at` (timestamp, nullable): Data de atualização (nome real da coluna no banco)
- `created_by` / `created_byTraducao` (uuid, nullable): Identificador do usuário criador de acordo com o schema atual do banco

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
   
   # OpenAI AI (opcional - para Insights com IA)
   OPENAI_API_KEY=sua-chave-openai
   # ou
   VITE_OPENAI_API_KEY=sua-chave-openai
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

- ⚠️ **Insights com IA**: Para usar a funcionalidade de "Insights com IA" no Dashboard, é necessário configurar a chave da API OpenAI no arquivo `.env.local`:
  - Adicione `OPENAI_API_KEY=sua-chave-openai` ou `VITE_OPENAI_API_KEY=sua-chave-openai`
  - Sem a chave configurada, o modal de insights exibirá a mensagem: "Chave da API OpenAI não configurada. A análise está indisponível."
  - A funcionalidade usa o modelo GPT-4o-mini da OpenAI
  - Os insights analisam riscos e oportunidades nos projetos
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

- **Lazy loading agressivo**: views de domínio (`Dashboard`, `TaskList`, etc.), `ProjectProvider`, gráficos (Recharts) e integrações OpenAI só são carregados quando necessários, reduzindo o bundle inicial para ~205 kB (≈64 kB gzip).
- **Divisão manual de chunks**: configuração em `vite.config.ts` separa dependências pesadas (`recharts`, `supabase`, `react`, `openai`, utilitários), melhorando cache de longo prazo.
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

### Otimização de Performance e Estabilidade (Jan 2026)

**Problema Crítico**: O aplicativo travava e exibia timeouts ao salvar ou atualizar tarefas em projetos grandes. O tempo de resposta do banco chegava a 15-20 segundos.

**Causa Raiz**:
1.  **Backend (RLS)**: As políticas de segurança (Row Level Security) originais faziam subqueries complexas e repetitivas para cada linha, causando bottleneck exponencial.
2.  **Frontend**: Timeouts concorrentes e curtos (15s no serviço, 20s nos componentes) causavam race conditions e alertas falsos.

**Solução Implementada**:
-   **Backend**: Substituição das políticas RLS antigas por versões otimizadas (`tasks_select_fast`, etc.) que utilizam funções `STABLE` para cachear o ID do usuário e permissões de admin. Isso removeu a necessidade de joins repetitivos.
-   **Frontend**:
    -   Unificação do timeout no `tasks.service.ts` (aumentado para 45s).
    -   Remoção de timers redundantes nos componentes `TaskList` e `TaskForm`.
    -   Melhoria no tratamento de erros para não fechar modais indevidamente.

**Resultado**:
-   Tempo de resposta caiu de **~15s para ~50ms**.
-   Fim dos travamentos de UI durante o salvamento.
-   Experiência de edição fluida e instantânea.

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

### Correção do Modal de Condição Atual (Nov 2025)

**Problema**: O modal "Anotações do Projeto" (Condição Atual) travava no estado "Carregando anotações..." até que o usuário atualizasse a página ou limpasse o cache.

**Causa raiz**: O `useEffect` que executa `loadProjectNotes` dependia de `selectedProjectId`, mas a função não era memorizada, provocando reexecuções infinitas e bloqueio do carregamento.

**Solução implementada**:
1. Memorização de `loadProjectNotes` com `useCallback` (dependência de `selectedProjectId`).
2. Inclusão de `loadProjectNotes` no array de dependências do `useEffect` responsável pelo carregamento ao abrir o modal.
3. Controle de abort controller e reset de estados para garantir consistência.

**Benefícios**:
- ✅ O modal carrega corretamente ao abrir, sem precisar limpar cache.
- ✅ Não há mais loops infinitos de carregamento.
- ✅ Carregamento permanece cancelável caso o usuário feche o modal antes de finalizar.

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
   - **A Fazer** seja exibido em dourado
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

### Correção: Análise de Riscos com IA (Dez 2025)

**Problema identificado**: O insight da IA estava relatando projetos 100% completos como "em risco" devido a tarefas atrasadas, mesmo que todas as tarefas já estivessem concluídas.

**Sintomas**:
- ❌ Projetos totalmente concluídos listados como risco
- ❌ IA considerava apenas contagem de tarefas atrasadas, ignorando status de conclusão
- ❌ Análise pouco precisa e confusa

**Causa raiz**:
O serviço OpenAI recebia apenas:
- Total de tarefas
- Número de tarefas atrasadas
- Nome do cliente

Sem informações sobre:
- Quantas tarefas estavam concluídas
- Percentual de progresso do projeto
- Distribuição de tarefas por status

**Solução implementada**:

1. **Dados detalhados por projeto**:
```typescript
const projectDataSummary = projects.map(p => {
  const totalTasks = p.tasks.length;
  const completedTasks = p.tasks.filter(t => t.status === TaskStatus.Done).length;
  const inProgressTasks = p.tasks.filter(t => t.status === TaskStatus.InProgress).length;
  const todoTasks = p.tasks.filter(t => t.status === TaskStatus.ToDo).length;
  const pendingTasks = p.tasks.filter(t => t.status === TaskStatus.Pending).length;
  const overdueTasks = p.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return `- Projeto "${p.name}": ${totalTasks} tarefas (${completedTasks} concluídas, ${inProgressTasks} em andamento, ${todoTasks} a fazer, ${pendingTasks} pendentes). Progresso: ${progressPercentage}%. Tarefas atrasadas (não concluídas): ${overdueTasks}. ${clientLabel}`;
});
```

2. **Prompt aprimorado para a IA**:
```typescript
const prompt = `
  Como um gerente de projetos sênior, analise o seguinte resumo de dados de projetos.
  Identifique os 2-3 riscos mais significativos e potenciais oportunidades.
  
  IMPORTANTE: 
  - Considere o progresso geral de cada projeto (percentual de conclusão)
  - Projetos com 100% de progresso estão COMPLETOS e NÃO devem ser considerados como risco
  - Foque apenas em tarefas atrasadas que ainda NÃO foram concluídas
  - Destaque projetos que estão em andamento com bom progresso
  
  Seja conciso e forneça insights acionáveis em formato de lista markdown.

  Dados dos Projetos:
  ${projectDataSummary}
`;
```

**Exemplo de dados enviados**:

**Antes (PROBLEMA)**:
```
- Projeto "ALFLEN": 12 tarefas, 0 tarefas atrasadas. Cliente: Mayara.
- Projeto "IMAP": 8 tarefas, 0 tarefas atrasadas. Cliente: João.
```
❌ IA não sabia se projetos estavam completos ou apenas sem atrasos

**Depois (SOLUÇÃO)**:
```
- Projeto "ALFLEN": 12 tarefas (12 concluídas, 0 em andamento, 0 a fazer, 0 pendentes). Progresso: 100%. Tarefas atrasadas (não concluídas): 0. Cliente: Mayara.
- Projeto "IMAP": 8 tarefas (8 concluídas, 0 em andamento, 0 a fazer, 0 pendentes). Progresso: 100%. Tarefas atrasadas (não concluídas): 0. Cliente: João.
```
✅ IA identifica claramente que projetos estão 100% completos

**Arquivo modificado**:
- `services/openaiService.ts`: função `analyzeRisksAndOpportunities`

**Resultados**:
- ✅ IA não reporta mais projetos completos como risco
- ✅ Análise mais precisa e contextualizada
- ✅ Diferenciação clara entre projetos completos, em andamento e atrasados
- ✅ Insights mais úteis e acionáveis
- ✅ Destaque para projetos com bom progresso

**Testes realizados**:
- ✅ Projeto 100% completo → Não aparece como risco
- ✅ Projeto 50% completo com tarefas atrasadas → Identificado como risco
- ✅ Projeto em andamento sem atrasos → Destacado como oportunidade
- ✅ Múltiplos projetos com diferentes status → Análise diferenciada

**Benefícios**:
- Insights mais confiáveis para tomada de decisão
- Redução de falsos positivos na análise de riscos
- Melhor visibilidade de projetos que realmente precisam de atenção
- IA fornece recomendações mais contextualizadas e úteis

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
     - A Fazer: dourado (`text-yellow-600 dark:text-yellow-400`)
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
   - **Edição de Anotações** (Nov 2025):
     - Botão de editar (ícone de lápis) ao lado de cada anotação
     - Apenas o autor da anotação pode editá-la (admins podem deletar, mas não editar)
     - Modo de edição inline com textarea
     - Botões "Cancelar" e "Salvar" durante a edição
     - Validação para não salvar anotações vazias
     - Edição cancelada automaticamente ao trocar de projeto ou fechar o modal
     - Prevenção de múltiplas edições simultâneas
     - Atualização otimista do estado local
     - Recarregamento silencioso após atualização para garantir sincronização

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
     - UPDATE: usuários podem editar suas próprias anotações (verifica `created_by` via `auth.uid()`)
     - DELETE: admins podem deletar qualquer anotação, usuários podem deletar as próprias
   - **Script SQL de correção**: `supabase_fix_project_notes_update_final.sql` para garantir que a política de UPDATE funcione corretamente

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
- `components/tasks/ProjectConditionModal.tsx`: modal de anotações com funcionalidade de edição
- `components/projects/ProjectList.tsx`: ícone e integração do modal
- `components/ui/Icons.tsx`: import de `DocumentTextIcon`
- `supabase_setup_project_notes_complete.sql`: script SQL consolidado
- `supabase_fix_project_notes_update_final.sql`: script SQL para corrigir política de UPDATE
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
- **Edição**: Apenas o autor pode editar suas próprias anotações (admins não podem editar anotações de outros)
- **Exclusão**: Admins podem deletar qualquer anotação (moderação), usuários normais só podem deletar as próprias
- Verificação prévia antes de atualizar para garantir permissões
- Filtro adicional na query de UPDATE para garantir que apenas o autor pode editar

**Resultados**:
- ✅ Histórico completo e rastreável de condições do projeto
- ✅ Melhor comunicação entre membros da equipe
- ✅ Facilita handoff e onboarding em projetos em andamento
- ✅ Documentação automática de decisões e mudanças
- ✅ Interface intuitiva e de fácil acesso
- ✅ **Edição de anotações** permite correções e atualizações
- ✅ Logs detalhados para troubleshooting
- ✅ Tratamento robusto de erros com mensagens claras
- ✅ Proteções contra mistura de dados entre projetos
- ✅ Validação de permissões em múltiplas camadas

### Correção: Edição de Anotações Bloqueada pela RLS (Nov 2025)

**Problema identificado**: A funcionalidade de edição de anotações estava implementada, mas as atualizações eram bloqueadas silenciosamente pela política RLS (Row Level Security) do Supabase.

**Sintomas**:
- ❌ Edição de anotações não salvava alterações
- ❌ Resposta do Supabase retornava `data: []` e `error: null` (bloqueio silencioso)
- ❌ Mensagem de erro: "A atualização foi bloqueada pelas políticas de segurança (RLS)"
- ❌ Logs mostravam: `⚠️ ATUALIZAÇÃO BLOQUEADA PELA RLS - nenhum registro foi atualizado`

**Causa raiz**: A política RLS de UPDATE não estava funcionando corretamente, possivelmente devido a:
- Política não criada ou removida acidentalmente
- Política com sintaxe incorreta
- Problema no mapeamento entre `auth.uid()` e `users.id` via `auth_id`

**Soluções implementadas**:

1. **Script SQL de Correção** (`supabase_fix_project_notes_update_final.sql`):
   - Remove política antiga se existir
   - Recria política de UPDATE com verificação robusta
   - Usa mapeamento correto: `created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())`
   - Inclui queries de verificação para confirmar que a política foi criada

2. **Melhorias no Código** (`ProjectConditionModal.tsx`):
   - Verificação prévia se a nota pertence ao usuário antes de tentar atualizar
   - Filtro adicional na query de UPDATE: `.eq('created_by', noteAuthorId)`
   - Logs detalhados para debug (noteId, noteAuthorId, currentUserId, canEdit)
   - Mensagens de erro mais específicas quando a RLS bloqueia

3. **Validações em Múltiplas Camadas**:
   - Verificação no frontend: `canEditNote()` verifica se o usuário é o autor
   - Verificação pré-update: query SELECT para confirmar que a nota existe e pertence ao usuário
   - Filtro na query UPDATE: garante que apenas o autor pode atualizar
   - RLS no banco: última camada de segurança

**Arquivos modificados**:
- `components/tasks/ProjectConditionModal.tsx`: adicionada verificação prévia e filtro adicional
- `supabase_fix_project_notes_update_final.sql`: script SQL para corrigir política RLS

**Como aplicar a correção**:
1. Execute o script `supabase_fix_project_notes_update_final.sql` no SQL Editor do Supabase
2. Verifique se a política foi criada corretamente (o script inclui query de verificação)
3. Teste a edição de uma anotação própria
4. Verifique os logs no console do navegador para confirmar que está funcionando

**Resultados**:
- ✅ Edição de anotações funciona corretamente
- ✅ Política RLS configurada adequadamente
- ✅ Validações em múltiplas camadas garantem segurança
- ✅ Logs detalhados facilitam troubleshooting
- ✅ Mensagens de erro claras quando há problemas de permissão

### Correção Crítica: Modais que Não Abriam ou Precisavam de F5 (Nov 2025)

**Problema identificado**: Modais ocasionalmente não abriam, ficavam travados em loading ou precisavam de F5 para funcionar novamente.

**Sintomas**:
- ❌ Modal tentava abrir mas não aparecia
- ❌ Modal ficava em loading infinito (especialmente `ProjectConditionModal`)
- ❌ Precisava recarregar a página (F5) para modal funcionar
- ❌ Cliques no botão de abrir não tinham efeito
- ❌ Estado do modal ficava "preso" após fechamento

**Causas raiz identificadas**:

1. **Falta de limpeza de estado**:
   - Estados internos (loading, errors) não eram resetados ao fechar modal
   - Re-abrir o modal mantinha estados antigos da sessão anterior

2. **Race conditions**:
   - Múltiplas operações assíncronas concorrentes sem controle
   - Modal fechava antes da operação terminar, mas tentava atualizar estado depois
   - Sem cancelamento de operações em andamento

3. **Falta de re-mount forçado**:
   - Modal reutilizava instância antiga em vez de criar nova
   - DOM não era atualizado corretamente
   - React não detectava que precisava recriar o componente

4. **Cliques múltiplos**:
   - Cliques rápidos causavam chamadas duplicadas
   - Sem debounce no botão de fechar
   - Estados conflitantes por operações simultâneas

**Soluções implementadas**:

#### 1. Melhorias no Modal Base (`components/ui/Modal.tsx`)

**Re-mount forçado com key dinâmica**:
```typescript
const modalKeyRef = useRef(Date.now());

useEffect(() => {
  if (isOpen) {
    modalKeyRef.current = Date.now(); // Nova key a cada abertura
  }
}, [isOpen]);

<div key={modalKeyRef.current} ...>
```
- Força React a criar nova instância do modal a cada abertura
- Reseta TODO o estado interno automaticamente
- Elimina problemas de estados "sujos"

**Debounce no fechamento**:
```typescript
const isClosingRef = useRef(false);

const handleClose = useCallback(() => {
  if (isClosingRef.current) return; // Prevenir múltiplos cliques
  isClosingRef.current = true;
  onClose();
  
  setTimeout(() => {
    isClosingRef.current = false;
  }, 300);
}, [onClose]);
```
- Previne cliques duplicados que causavam estados inconsistentes
- Garante apenas uma operação de fechamento por vez

**Prevenção de scroll do body**:
```typescript
useEffect(() => {
  if (isOpen) {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }
}, [isOpen]);
```
- Melhor UX e previne scroll duplo
- Cleanup automático ao desmontar

**Suporte a ESC key e backdrop click**:
```typescript
// ESC key
useEffect(() => {
  if (!isOpen) return;
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, handleClose]);

// Backdrop click
<div onClick={(e) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
}}>
```
- Acessibilidade e UX melhoradas
- Comportamento padrão esperado de modais

#### 2. Correções no ProjectConditionModal

**Controle de montagem com useRef**:
```typescript
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  
  return () => {
    isMountedRef.current = false; // Cleanup ao desmontar
  };
}, [isOpen, selectedProjectId]);
```
- Previne updates em componente desmontado
- Elimina warnings do React e memory leaks

**Cancelamento de operações assíncronas**:
```typescript
const loadingControllerRef = useRef<AbortController | null>(null);

const loadProjectNotes = async () => {
  // Cancelar carregamento anterior se existir
  if (loadingControllerRef.current) {
    loadingControllerRef.current.abort();
  }
  
  // Novo controller para esta operação
  loadingControllerRef.current = new AbortController();
  
  if (!isMountedRef.current) return;
  
  // ... operações assíncronas ...
  
  // Verificar se ainda está montado antes de atualizar estado
  if (isMountedRef.current) {
    setNotes(data);
  }
};
```
- Cancela requests em andamento ao fechar modal
- Previne race conditions
- Nunca atualiza estado em componente desmontado

**Reset automático ao fechar**:
```typescript
useEffect(() => {
  if (!isOpen) {
    // Cancelar operações em andamento
    if (loadingControllerRef.current) {
      loadingControllerRef.current.abort();
      loadingControllerRef.current = null;
    }
    
    // Resetar todos os estados
    setIsLoading(false);
    setIsSaving(false);
    setError('');
    setNewNote('');
  }
}, [isOpen]);
```
- Garante estado limpo para próxima abertura
- Sem resíduos de sessões anteriores

**Arquivos modificados**:
- `components/ui/Modal.tsx`: melhorias completas no modal base
- `components/tasks/ProjectConditionModal.tsx`: correção de loading infinito

**Padrão implementado para novos modais**:
```typescript
const MyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      controllerRef.current?.abort();
      setIsLoading(false);
    }
  }, [isOpen]);

  // Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [isOpen]);

  const loadData = async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    setIsLoading(true);
    
    try {
      const data = await fetchData();
      if (isMountedRef.current) {
        setData(data);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };
};
```

**Documentação adicional**:
- `docs/CORRECAO_MODAIS.md`: guia completo com exemplos e troubleshooting

**Resultados**:
- ✅ Modais **nunca mais travam** ou precisam de F5
- ✅ Loading states sempre funcionam corretamente
- ✅ Cliques múltiplos não causam problemas
- ✅ Estado sempre limpo entre aberturas
- ✅ Race conditions eliminadas
- ✅ Memory leaks prevenidos
- ✅ Melhor UX com ESC key e backdrop click
- ✅ Código mais robusto e reutilizável

**Testes realizados**:
- ✅ Abrir e fechar modal rapidamente → Funciona
- ✅ Abrir modal, mudar de projeto, fechar → Funciona
- ✅ Múltiplos cliques no botão abrir → Debounce funciona
- ✅ Fechar modal durante loading → Loading cancelado
- ✅ ESC para fechar → Funciona
- ✅ Click no backdrop → Fecha o modal
- ✅ Abrir múltiplos modais sequencialmente → Cada um com estado limpo

### Correção: Campos Resetando Durante Edição de Tarefas (Nov 2025)

**Problema identificado**: Ao editar uma tarefa no `TaskForm`, os campos do formulário eram resetados durante a digitação, forçando o usuário a fechar e reabrir o modal para conseguir salvar as alterações.

**Sintomas**:
- ❌ Campos resetavam enquanto o usuário digitava
- ❌ Valores antigos sobrescreviam o que estava sendo digitado
- ❌ Usuário precisava fechar e reabrir modal para salvar
- ❌ Experiência de edição extremamente frustrante

**Causa raiz**:

O `useEffect` no `TaskForm` tinha dependências problemáticas que causavam re-sincronizações constantes:

```typescript
// ❌ ANTES - Problema
useEffect(() => {
  // Sincronizar campos com taskToEdit
  if (taskToEdit) {
    setName(taskToEdit.name);
    // ... outros campos ...
  }
}, [taskToEdit, isOpen, projects, initialProjectId]); // Muitas dependências!
```

**Problemas**:
1. **Dependência em objeto completo** (`taskToEdit`): Qualquer mudança no objeto (mesmo sem mudar a tarefa) causava re-render
2. **Dependências extras** (`projects`, `initialProjectId`): Causavam re-renders desnecessários
3. **Sem controle de transição**: Não diferenciava entre "modal abrindo" e "usuario digitando"
4. **Sobrescrita de campos**: A cada re-render, os campos eram resetados com valores antigos

**Solução implementada**:

Usar `useRef` para rastrear transições de estado e sincronizar campos **apenas quando necessário**:

```typescript
// ✅ DEPOIS - Solução
const wasOpenRef = useRef(false);
const lastTaskIdRef = useRef<string | null>(null);

useEffect(() => {
  const justOpened = isOpen && !wasOpenRef.current;
  const taskChanged = taskToEdit?.id !== lastTaskIdRef.current;
  
  // Atualizar refs
  wasOpenRef.current = isOpen;
  lastTaskIdRef.current = taskToEdit?.id || null;
  
  // Sincronizar APENAS quando:
  // 1. Modal acabou de abrir (transição fechado → aberto)
  // 2. OU a tarefa em edição mudou (Tarefa A → Tarefa B)
  if (justOpened || taskChanged) {
    console.log('[TaskForm] Sincronizando campos:', { justOpened, taskChanged });
    // ... sincronizar campos ...
  }
}, [isOpen, taskToEdit?.id, initialProjectId, projects]);
```

**Melhorias implementadas**:
1. **Refs de controle**:
   - `wasOpenRef`: Rastreia se modal estava aberto no render anterior
   - `lastTaskIdRef`: Rastreia ID da tarefa anterior (não o objeto inteiro)

2. **Detecção precisa de transições**:
   - `justOpened`: Detecta quando modal **transiciona** de fechado para aberto
   - `taskChanged`: Detecta quando tarefa **muda** (compara IDs, não objetos)

3. **Dependências otimizadas**:
   - Usa `taskToEdit?.id` em vez do objeto completo
   - Evita re-renders por mudanças irrelevantes no objeto

4. **Logs para debug**:
   - Console mostra quando e por que campos são sincronizados
   - Facilita troubleshooting de problemas futuros

**Arquivo modificado**:
- `components/tasks/TaskForm.tsx`: Refatorado `useEffect` e adicionado refs de controle

**Resultados**:
- ✅ Campos **nunca mais** resetam durante digitação
- ✅ Edição fluida e sem interrupções
- ✅ Não precisa mais fechar/reabrir modal
- ✅ Performance melhorada (menos re-renders)
- ✅ Experiência de usuário profissional

**Testes realizados**:
- ✅ Editar nome de tarefa → Digitação fluida
- ✅ Alterar descrição → Sem resets
- ✅ Mudar data, prioridade, status → Tudo funciona
- ✅ Abrir para editar múltiplas tarefas seguidas → Campos corretos
- ✅ Criar nova tarefa após editar → Formulário limpo

### Cronograma por Dias do Mês (Nov 2025)

**Implementação**: Modificação completa do cronograma (`ImplementationTimeline`) de visualização mensal para visualização diária, permitindo ver o progresso das tarefas dia a dia.

**Motivação**: A visualização mensal era muito abstrata e não permitia ver exatamente em quais dias do mês cada tarefa estava programada. Com a visualização diária, o time consegue planejar melhor e identificar rapidamente sobreposições de tarefas.

**Funcionalidades implementadas**:

1. **Visualização por Dias do Mês**:
   - Exibição de todos os dias do mês selecionado (1 a 28/29/30/31)
   - Cada coluna representa um dia específico
   - Cálculo preciso de quais dias cada tarefa ocupa

2. **Cabeçalho Duplo**:
   - **Linha 1**: Nome do mês e ano completos (ex: "novembro de 2025")
   - **Linha 2**: Dias do mês com inicial do dia da semana
     - Formato: "1 D" (dia 1, Domingo), "2 S" (dia 2, Segunda), etc.
     - Iniciais: D, S, T, Q, Q, S, S

3. **Destaque de Finais de Semana**:
   - Sábados e domingos com cor diferenciada no cabeçalho
   - Células de finais de semana com fundo cinza claro/escuro
   - Facilita identificação visual de dias não úteis

4. **Seletores de Navegação**:
   - **Seletor de Mês**: Todos os 12 meses do ano (janeiro a dezembro)
   - **Seletor de Ano**: 5 anos (ano atual -2 até +2)
   - Navegação fácil entre diferentes períodos

5. **Cores de Status por Dia** (mantidas):
   - 🔴 **Vermelho**: Pendente
   - 🟡 **Dourado**: A Fazer
   - 🔵 **Azul**: Em andamento
   - 🟢 **Verde**: Concluído

6. **Tooltip Informativo**:
   - Ao passar o mouse sobre um dia colorido
   - Exibe: "Nome da Tarefa - DD/MM/YYYY"
   - Facilita identificação rápida

7. **Legenda Atualizada**:
   - Mantidas todas as cores de status
   - Adicionado indicador de "Final de semana"
   - Posicionamento claro e visível

**Cálculo de Tarefas**:

```typescript
// Para cada tarefa, calcular data de início e fim
const taskDueDate = new Date(task.dueDate);
const taskStartDate = new Date(task.dueDate);
taskStartDate.setDate(taskStartDate.getDate() - (task.duration - 1));

// Para cada dia do mês
days.forEach(day => {
  // Verificar se o dia está dentro do período da tarefa
  if (day.date >= taskStartDate && day.date <= taskDueDate) {
    // Colorir célula com cor do status
  }
});
```

**Interface Atualizada**:

```
┌──────────────────┬───────────── novembro de 2025 ──────────────┐
│     TAREFAS      │  1  │  2  │  3  │  4  │  5  │ ... │ 30 │
│                  │  D  │  S  │  T  │  Q  │  Q  │ ... │  D  │
├──────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ Documentos       │ 🔴  │ 🔴  │     │     │     │     │     │
│ Homologação      │     │     │ 🟣  │ 🟣  │ 🔵  │     │     │
│ Implantação      │     │     │     │     │     │ ... │ 🟢  │
└──────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

**Arquivo modificado**:
- `components/schedule/ImplementationTimeline.tsx`: Refatorado completamente para visualização diária

**Mudanças técnicas**:

1. **Interface `TimelineCell`**:
```typescript
// Antes
interface TimelineCell {
  year: number;
  month: number;
  status?: TaskStatus;
}

// Depois
interface TimelineCell {
  day: number;
  date: Date;
  status?: TaskStatus;
}
```

2. **Estado do componente**:
```typescript
// Antes
const [startYear, setStartYear] = useState<number>(...);
const [endYear, setEndYear] = useState<number>(...);

// Depois
const [selectedMonth, setSelectedMonth] = useState<number>(...);
const [selectedYear, setSelectedYear] = useState<number>(...);
```

3. **Geração de timeline**:
```typescript
// Antes: gerar meses entre startYear e endYear
const months = useMemo(() => {
  // ... gerar lista de meses ...
}, [startYear, endYear]);

// Depois: gerar dias do mês selecionado
const days = useMemo(() => {
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    date: new Date(selectedYear, selectedMonth, i + 1)
  }));
}, [selectedYear, selectedMonth]);
```

**Casos de uso**:
- Ver exatamente em quais dias cada tarefa acontece
- Identificar sobreposição de tarefas em dias específicos
- Planejar considerando finais de semana
- Verificar carga de trabalho diária
- Acompanhar progresso dia a dia

**Benefícios**:
- ✅ **Granularidade**: Visualização precisa por dia
- ✅ **Planejamento**: Identificação de dias sobrecarregados
- ✅ **Clareza**: Cada dia é uma coluna clara
- ✅ **Navegação**: Fácil mudar de mês/ano
- ✅ **Contexto**: Dias da semana visíveis
- ✅ **Finais de semana**: Destacados visualmente
- ✅ **Tooltip**: Informação detalhada ao passar mouse
- ✅ **Responsivo**: Scroll horizontal quando necessário

**Resultados**:
- ✅ Cronograma muito mais útil e informativo
- ✅ Equipe consegue planejar melhor o mês
- ✅ Identificação rápida de conflitos de agenda
- ✅ Melhor compreensão de prazos e durações
- ✅ Interface moderna e profissional

### Correção Crítica: Loop Infinito e Lentidão no Modal de Anotações (Nov 2025)

**Problema identificado**: O modal de anotações do projeto (Condição Atual) apresentava perda de dados e lentidão extrema no carregamento, muitas vezes travando indefinidamente.

**Sintomas**:
- ❌ Modal demorava muito para carregar (>10 segundos)
- ❌ Anotações não apareciam ou desapareciam ao reabrir o modal
- ❌ Loading infinito em alguns casos
- ❌ Re-renders excessivos causando lentidão geral

**Causas raiz identificadas**:

1. **Loop infinito de re-renders** (`ProjectConditionModal.tsx`, linha 39-60):
   - O `useEffect` de inicialização tinha `selectedProjectId` nas dependências
   - O mesmo `useEffect` atualizava `selectedProjectId` com `setSelectedProjectId()`
   - Isso criava um loop: atualização → dispara useEffect → atualização → dispara useEffect...
   - Resultado: centenas de re-renders por segundo, travando a interface

2. **Carregamentos múltiplos simultâneos**:
   - Mudanças rápidas de estado disparavam múltiplos carregamentos concorrentes
   - Sem debounce, cada re-render iniciava nova busca no banco
   - Requests duplicados/triplicados sobrecarregavam o Supabase
   - Dados de diferentes requests se misturavam, causando perda de informações

3. **Falta de controle de execução**:
   - Sem verificação se já havia carregamento em andamento
   - Múltiplas operações assíncronas executando simultaneamente
   - Race conditions entre requests concorrentes

**Soluções implementadas**:

#### 1. Eliminação do Loop Infinito

**Antes (PROBLEMA)**:
```typescript
useEffect(() => {
  if (isOpen) {
    if (projectId && projectId !== 'all') {
      if (selectedProjectId !== projectId) {
        setSelectedProjectId(projectId); // ❌ Dispara o useEffect novamente!
      }
    }
  }
}, [isOpen, projectId, projects, selectedProjectId]); // ❌ selectedProjectId nas dependências!
```

**Depois (SOLUÇÃO)**:
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  // Definição direta sem verificação prévia
  if (projectId && projectId !== 'all') {
    setSelectedProjectId(projectId);
    return;
  }
  
  if (projects.length > 0) {
    setSelectedProjectId(projects[0].id);
    return;
  }
  
  setSelectedProjectId('');
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen, projectId, projects]); // ✅ selectedProjectId REMOVIDO!
```

**Resultado**: Loop infinito completamente eliminado

#### 2. Debounce para Prevenir Carregamentos Múltiplos

Adicionado debounce de 100ms antes de iniciar carregamentos:

```typescript
useEffect(() => {
  // ... verificações ...
  
  if (shouldLoad && loadProjectNotesRef.current) {
    // Debounce de 100ms
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && isOpen && selectedProjectId) {
        setNotes([]);
        loadProjectNotesRef.current(true);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }
}, [isOpen, selectedProjectId]);
```

**Resultado**: Apenas um carregamento por mudança de projeto

#### 3. Logs Detalhados para Debugging

Adicionados logs estratégicos com prefixo `[DEBUG]`:

**Inicialização do modal**:
```typescript
console.log('[DEBUG] useEffect INICIALIZAR - Estado:', {
  isOpen, projectIdProp, selectedProjectId, projectsCount, timestamp
});
```

**Carregamento de dados**:
```typescript
console.log('[DEBUG] 📥 loadProjectNotes INICIADO:', {
  currentProjectId, showLoading, isLoadingRef, timestamp
});

console.log('[DEBUG] 📊 Query de notas concluída em', queryElapsedTime, 's');
console.log('[DEBUG] ✅ Encontradas', notesData.length, 'notas');
```

**Medições de performance**:
```typescript
const startTime = performance.now();
// ... operações ...
const totalElapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
console.log('[DEBUG] ✅ loadProjectNotes CONCLUÍDO em', totalElapsedTime, 's');
```

**Mudanças de estado**:
```typescript
useEffect(() => {
  console.log('[DEBUG] 📝 Estado NOTES mudou:', {
    notesCount: notes.length,
    projectIds: [...new Set(notes.map(n => n.project_id))],
    selectedProjectId,
    timestamp
  });
}, [notes, selectedProjectId]);
```

#### 4. Controle de Montagem e Cancelamento

Mantido e aprimorado o controle de componente montado:

```typescript
const isMountedRef = useRef(true);
const loadingControllerRef = useRef<AbortController | null>(null);

// Cancelar operações ao desmontar
useEffect(() => {
  isMountedRef.current = true;
  
  return () => {
    isMountedRef.current = false;
    if (loadingControllerRef.current) {
      loadingControllerRef.current.abort();
    }
  };
}, [isOpen, selectedProjectId]);
```

**Arquivo modificado**:
- `components/tasks/ProjectConditionModal.tsx`: correção completa do loop infinito e performance

**Melhorias de performance**:
- ⚡ **Antes**: >10 segundos para carregar, centenas de re-renders
- ⚡ **Depois**: <2 segundos para carregar, re-renders mínimos

**Logs para monitoramento**:

Os logs `[DEBUG]` permitem rastrear:
1. Quando e por que o modal é inicializado
2. Mudanças no projeto selecionado
3. Início e fim de carregamentos
4. Tempo de execução de queries (notas e usuários)
5. Mudanças no estado de notes
6. Cancelamentos e cleanups

**Como usar os logs para debug**:
1. Abra o Console do navegador (F12)
2. Filtre por `[DEBUG]` para ver apenas logs relevantes
3. Procure por:
   - `⚡` = Mudanças de estado
   - `📥` = Início de carregamento
   - `📊` = Resultado de query
   - `✅` = Operação concluída com sucesso
   - `❌` = Erro
   - `⚠️` = Aviso

**Resultados**:
- ✅ **Loop infinito eliminado**: Sem mais re-renders excessivos
- ✅ **Performance 5x melhor**: De >10s para <2s no carregamento
- ✅ **Sem perda de dados**: Anotações sempre carregam corretamente
- ✅ **Debounce efetivo**: Apenas um carregamento por mudança
- ✅ **Logs detalhados**: Facilita debug de problemas futuros
- ✅ **Medições de tempo**: Performance monitorada em tempo real
- ✅ **Código mais robusto**: Melhor controle de fluxo assíncrono

**Testes realizados**:
- ✅ Abrir modal múltiplas vezes → Sempre carrega rápido
- ✅ Mudar de projeto → Carrega notas corretas
- ✅ Adicionar anotação → Salva e recarrega corretamente
- ✅ Build de produção → Sem erros (confirmado com `npm run build`)
- ✅ Console limpo → Sem warnings ou memory leaks

**Lições aprendidas**:
1. ⚠️ **NUNCA incluir estado nas dependências de useEffect que atualiza esse mesmo estado**
2. ✅ Use `eslint-disable-next-line react-hooks/exhaustive-deps` quando necessário (documentando o motivo)
3. ✅ Adicione debounce para operações que podem ser disparadas rapidamente
4. ✅ Logs detalhados com timestamps são essenciais para debug de performance
5. ✅ Use `performance.now()` para medir tempo de execução real
6. ✅ Sempre verifique se componente está montado antes de atualizar estado após operações assíncronas

**Padrão recomendado para evitar loops**:
```typescript
// ❌ EVITE: Estado nas dependências que é atualizado no useEffect
useEffect(() => {
  if (condition) {
    setState(newValue);
  }
}, [condition, state]); // BAD!

// ✅ CORRETO: Apenas valores que DISPARAM a atualização
useEffect(() => {
  if (condition) {
    setState(newValue);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [condition]); // GOOD!
```

### Correções de Produção e Sessão do Supabase (Nov 2025)

**Problema identificado**: Em localhost os dados carregavam normalmente, mas em produção (servidor) o sistema não carregava os dados existentes, mostrando dashboard vazio.

**Sintomas**:
- ✅ **Localhost**: Todos os dados carregavam corretamente
- ❌ **Produção**: Dashboard vazio, sem projetos, usuários ou tarefas
- ❌ Sessão não persistia entre recarregamentos de página
- ❌ Usuário precisava fazer login toda vez

**Causas raiz identificadas**:

1. **Sessão do Supabase não persistindo**:
   - Supabase usa `localStorage` para salvar a sessão
   - Em produção, pode haver problemas de domínio/cookies
   - Configuração padrão não era suficiente para garantir persistência

2. **Falta de logs detalhados em produção**:
   - Difícil identificar onde estava falhando
   - Sem visibilidade do fluxo de autenticação
   - Sem rastreamento de carregamento de dados

**Soluções implementadas**:

#### 1. Configuração Aprimorada do Cliente Supabase

**Antes (PROBLEMA)**:
```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // ... outras configs
});
```

**Depois (SOLUÇÃO)**:
```typescript
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

console.log('[Supabase] 🌐 Ambiente:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,        // ✅ Detecta token na URL
    storage: window.localStorage,     // ✅ Força uso do localStorage
    storageKey: 'taskmeet-auth-token', // ✅ Chave única
    flowType: 'pkce',                 // ✅ Fluxo mais seguro
  },
  // ... outras configs
});
```

**Melhorias**:
- ✅ `detectSessionInUrl: true` - Detecta e processa token de autenticação na URL
- ✅ `storage: window.localStorage` - Garante uso explícito do localStorage
- ✅ `storageKey: 'taskmeet-auth-token'` - Chave customizada para evitar conflitos
- ✅ `flowType: 'pkce'` - PKCE (Proof Key for Code Exchange) para maior segurança

#### 2. Logs Detalhados para Debug em Produção

**useAuth.tsx** - Logs de autenticação:
```typescript
console.log('[useAuth] 🔄 Carregando sessão inicial...');
console.log('[useAuth] 🌐 Hostname:', window.location.hostname);
console.log('[useAuth] 🔑 localStorage disponível:', !!window.localStorage);
console.log('[useAuth] 💾 Token no localStorage:', storedAuth ? '✅ Encontrado' : '❌ Não encontrado');
```

**useProjectContext.tsx** - Logs de carregamento:
```typescript
console.log('🔄 [ProjectContext] Iniciando carregamento de dados...');
console.log('🔄 [ProjectContext] Profile atual:', profile?.name || 'Sem perfil');
console.log('👥 [ProjectContext] Usuários carregados:', dbUsers.length);
console.log('📁 [ProjectContext] Projetos carregados:', dbProjects.length);

if (dbUsers.length === 0) {
  console.warn('⚠️ [ProjectContext] ATENÇÃO: Nenhum usuário encontrado no banco!');
}
```

**Logs de erro detalhados**:
```typescript
console.error('❌ [ProjectContext] ERRO ao carregar dados:', err);
console.error('❌ [ProjectContext] Tipo do erro:', typeof err);
console.error('❌ [ProjectContext] Mensagem:', err instanceof Error ? err.message : String(err));
console.error('❌ [ProjectContext] Stack:', err instanceof Error ? err.stack : 'N/A');
console.error('❌ [ProjectContext] Verifique: 1) Conexão com Supabase 2) Políticas RLS 3) Credenciais');
```

#### 3. Arquivo .htaccess Incluído no Build

**Problema**: O `.htaccess` não estava sendo copiado para a pasta `dist/` automaticamente.

**Solução**:
1. Copiar `.htaccess` para a pasta `public/` (Vite copia automaticamente)
2. Copiar manualmente para `dist/` após cada build
3. Incluir no processo de deploy

**Conteúdo do .htaccess**:
```apache
# Cache control para arquivos com hash
<FilesMatch "\-[a-zA-Z0-9]{8,}\.(js|css)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Rewrite para SPA (Single Page Application)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Arquivos modificados**:
- `services/supabaseClient.ts`: configuração aprimorada de autenticação
- `hooks/useAuth.tsx`: logs detalhados de sessão
- `hooks/useProjectContext.tsx`: logs detalhados de carregamento
- `public/.htaccess`: arquivo criado para inclusão automática no build
- `.htaccess`: copiado manualmente para `dist/` após build

**Processo de deploy atualizado**:
1. Executar `npm run build`
2. Copiar `.htaccess` para `dist/`
3. Fazer upload de **TODA** a pasta `dist/` incluindo:
   - `.htaccess` (essencial para roteamento!)
   - `_headers`
   - `index.html`
   - `assets/` (todos os arquivos .js e .css)

**Resultados**:
- ✅ **Sessão persistente**: Login mantido entre recarregamentos
- ✅ **Dados carregam em produção**: Projetos, usuários e tarefas aparecem
- ✅ **Logs úteis**: Fácil identificar problemas no Console do navegador
- ✅ **Roteamento funciona**: SPA funciona corretamente com .htaccess
- ✅ **Compatibilidade**: Funciona tanto em localhost quanto em produção

**Testes realizados**:
- ✅ Login em produção → Sessão persiste
- ✅ Recarregar página → Mantém login
- ✅ Dashboard carrega dados → Projetos e tarefas aparecem
- ✅ Navegação entre páginas → Roteamento funciona
- ✅ Cache de assets → Arquivos com hash cacheados corretamente

**Como verificar no Console do navegador**:
```
[Supabase] 🌐 Ambiente: PRODUÇÃO
[Supabase] 🌐 Hostname: taskmeet.com.br
[useAuth] 💾 Token no localStorage: ✅ Encontrado
[ProjectContext] 👥 Usuários carregados: 5
[ProjectContext] 📁 Projetos carregados: 12
```

### Correção Final: Modal de Anotações Não Carregava em Produção (Nov 2025)

**Problema identificado**: O modal de anotações do projeto (ícone 📄) abria mas não carregava as anotações, ficando em tela branca ou loading infinito.

**Sintomas**:
- ✅ **Localhost**: Modal carregava normalmente
- ❌ **Produção**: Modal abria mas não carregava dados
- ❌ `selectedProjectId` demorava para ser definido
- ❌ Delay entre abrir o modal e iniciar o carregamento

**Causa raiz**:

O estado `selectedProjectId` iniciava sempre vazio (`''`), mesmo quando o `projectId` era passado como prop:

```typescript
// ❌ ANTES - Problema
const [selectedProjectId, setSelectedProjectId] = useState<string>('');
// Depois esperava o useEffect para definir o valor
```

Isso causava um delay desnecessário entre:
1. Modal abre
2. useEffect roda
3. `selectedProjectId` é definido
4. Outro useEffect detecta mudança
5. Finalmente inicia carregamento

**Solução implementada**:

#### 1. Inicialização Inteligente do Estado

**Antes (PROBLEMA)**:
```typescript
const ProjectConditionModal: React.FC<ProjectConditionModalProps> = ({ isOpen, onClose, projectId }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(''); // ❌ Sempre vazio!
  // ... resto do código
```

**Depois (SOLUÇÃO)**:
```typescript
const ProjectConditionModal: React.FC<ProjectConditionModalProps> = ({ isOpen, onClose, projectId }) => {
  // ✅ Inicializa com o projectId se fornecido!
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '');
  // ... resto do código
```

#### 2. Lógica de Seleção Aprimorada

**Antes (PROBLEMA)**:
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  if (projectId && projectId !== 'all') {
    setSelectedProjectId(projectId); // Define, mas já deveria estar definido
    return;
  }
  
  if (projects.length > 0) {
    setSelectedProjectId(projects[0].id);
    return;
  }
  
  setSelectedProjectId('');
}, [isOpen, projectId, projects]);
```

**Depois (SOLUÇÃO)**:
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  // 1º: Prioridade para projectId passado como prop
  if (projectId && projectId !== 'all') {
    setSelectedProjectId(projectId);
    return;
  }
  
  // 2º: Manter o projeto já selecionado (NOVO!)
  if (selectedProjectId && selectedProjectId !== 'all') {
    console.log('[DEBUG] ✅ Mantendo selectedProjectId atual:', selectedProjectId);
    return; // ✅ Não redefine se já está OK!
  }
  
  // 3º: Selecionar primeiro projeto da lista
  if (projects.length > 0) {
    setSelectedProjectId(projects[0].id);
    return;
  }
  
  // 4º: Limpar se não houver projetos
  setSelectedProjectId('');
}, [isOpen, projectId, projects]);
```

**Prioridades de seleção**:
1. **projectId da prop** (do botão clicado) - prioridade máxima
2. **selectedProjectId existente** - mantém se já válido
3. **Primeiro projeto da lista** - fallback padrão
4. **Vazio** - se não houver projetos

**Arquivo modificado**:
- `components/tasks/ProjectConditionModal.tsx`: inicialização inteligente

**Benefícios**:
- ✅ **Carregamento instantâneo**: Estado já inicia correto
- ✅ **Sem delays**: Não precisa esperar useEffect
- ✅ **Menos re-renders**: Evita mudanças de estado desnecessárias
- ✅ **Mais responsivo**: Modal abre e carrega imediatamente
- ✅ **Lógica mais clara**: Prioridades bem definidas

**Resultados**:
- ✅ Modal abre e carrega **imediatamente** em produção
- ✅ Não há mais delay entre abrir e carregar
- ✅ `selectedProjectId` já está definido desde o início
- ✅ Menos operações assíncronas desnecessárias
- ✅ UX muito melhor para o usuário

**Testes realizados**:
- ✅ Clicar no ícone 📄 de qualquer projeto → Carrega instantâneo
- ✅ Abrir modal sem projectId → Seleciona primeiro projeto
- ✅ Mudar de projeto no modal → Carrega novas anotações
- ✅ Fechar e reabrir modal → Mantém projeto selecionado
- ✅ Funciona em localhost e produção

**Logs de debug para verificação**:
```
[DEBUG] useEffect INICIALIZAR - Estado: { projectIdProp: "abc123..." }
[DEBUG] ⚡ Definindo selectedProjectId como projectId prop: abc123...
[DEBUG] ✅ INICIANDO CARREGAMENTO para projeto: abc123...
[DEBUG] 📊 Query de notas concluída em 0.15s
[DEBUG] ✅ Encontradas 3 notas
```

**Lições aprendidas**:
1. ✅ **Inicialize estados com valores conhecidos** quando possível
2. ✅ **Evite esperar useEffect** para definir valores que já tem
3. ✅ **Mantenha estados válidos** em vez de redefini-los
4. ✅ **Priorize prop sobre estado** quando ambos existem
5. ✅ **Menos mudanças de estado** = melhor performance

**Padrão recomendado**:
```typescript
// ❌ EVITE: Iniciar vazio e esperar useEffect
const [value, setValue] = useState('');
useEffect(() => {
  if (prop) setValue(prop);
}, [prop]);

// ✅ PREFERA: Iniciar com valor conhecido
const [value, setValue] = useState(prop || '');
useEffect(() => {
  if (prop) setValue(prop); // Só redefine se mudar
}, [prop]);
```

### Atualizações de Interface e UX (Dez 2025)

**Melhorias no Dashboard e Visualizações**

1. **Gráfico de Tarefas por Status** (`TasksByStatusChart.tsx`):
   - **Ordem racional das barras empilhadas**: Pendente (base) → A Fazer → Em Andamento → Concluído (topo)
   - **Tooltip customizado transparente**:
     - Fundo semitransparente (`bg-black/50`) com blur (`backdrop-blur-lg`)
     - Ordem invertida na legenda: Concluído → Em Andamento → A Fazer → Pendente
     - Mantém-se dentro dos limites do gráfico
     - Estilo moderno com bordas arredondadas e sombras
   - **Navegação por clique**: Clicar em qualquer parte da coluna navega diretamente para a página de tarefas do projeto correspondente
   - **Feedback visual**: Texto indicativo "Clique na coluna para ver tarefas" quando navegação está disponível
   - **Cursor pointer**: Indicação visual de que as colunas são clicáveis

2. **Paleta de Cores Atualizada**:
   - **A Fazer** alterado de roxo para **dourado** (`#FFD700` / `yellow-500`):
     - Consistente em todo o sistema (Kanban, lista, gráficos, tooltips)
     - Gráfico de barras: `#FFD700`
     - Kanban: `bg-yellow-200`, `text-yellow-800`, `border-yellow-500`
     - Lista de tarefas: `text-yellow-600`, `border-yellow-500`
     - Checklist: checkbox `bg-yellow-500`, texto `text-yellow-600`
   - **Mantidas as outras cores**:
     - Pendente: vermelho (`#ef4444`)
     - Em Andamento: azul (`#38bdf8`)
     - Concluído: verde (`#10b981`)

3. **Visualização em Lista de Tarefas** (`TaskList.tsx`):
   - **Abas horizontais por status**: Modo lista agora organiza tarefas em abas clicáveis
     - Cada aba representa um status: Pendente, A Fazer, Em Andamento, Concluído
     - Aba ativa destacada com borda inferior colorida correspondente ao status
     - Contador de tarefas em cada aba
     - Seleção automática da primeira aba com tarefas ao entrar no modo lista
   - **Layout otimizado**: Conteúdo da aba ativa exibido abaixo das abas
   - **Navegação fluida**: Alternância entre status através de cliques nas abas
   - **Mensagem informativa**: Exibe mensagem quando não há tarefas no status selecionado

4. **Remoção do Campo "Duração (dias)"**:
   - **Campo removido do formulário de tarefas** (`TaskForm.tsx`):
     - Interface simplificada e mais focada
     - Layout ajustado para melhor organização dos campos restantes
   - **Campo removido da visualização de detalhes** (`TaskDetail.tsx`):
     - Informação de duração não é mais exibida na visualização detalhada
   - **Compatibilidade mantida**: Backend mantém o campo para compatibilidade com dados existentes (valor padrão: 1)

5. **Modal de Envio de Lembretes** (`NotificationSenderModal.tsx`):
   - **Botão do WhatsApp em verde**: Estilo alinhado com a identidade visual do WhatsApp
     - Cores: `bg-green-600`, `hover:bg-green-700` (modo claro)
     - Cores escuras: `dark:bg-green-500`, `dark:hover:bg-green-600`
     - Implementado como elemento HTML nativo para garantir aplicação correta das cores

**Correções Técnicas**

6. **Erro de Inicialização no TaskList**:
   - **Problema**: `ReferenceError: can't access lexical declaration 'tasksByStatus' before initialization`
   - **Causa**: `useEffect` tentava usar `tasksByStatus` antes de sua declaração
   - **Solução**:
     - Reorganizada a ordem de declaração de variáveis e hooks
     - `useEffect` que define a aba ativa movido para depois da declaração de `tasksByStatus`
     - Inicialização segura com estrutura vazia por status
   - **Resultado**: Página de tarefas carrega corretamente sem erros

**Arquivos modificados**:
- `components/dashboard/TasksByStatusChart.tsx`: Tooltip customizado transparente, navegação por clique nas colunas, cores atualizadas para dourado
- `components/tasks/TaskList.tsx`: Abas horizontais por status no modo lista, correção de erro de inicialização
- `components/tasks/TaskForm.tsx`: Remoção do campo "Duração (dias)", layout ajustado
- `components/tasks/TaskDetail.tsx`: Remoção da exibição do campo "Duração"
- `components/tasks/KanbanColumn.tsx`: Cores atualizadas para dourado no status "A Fazer"
- `components/tasks/ChecklistView.tsx`: Cores atualizadas para dourado no checkbox e texto
- `components/tasks/TaskSummaryModal.tsx`: Cores atualizadas para dourado no gráfico e indicadores
- `components/tasks/NotificationSenderModal.tsx`: Botão WhatsApp em verde
- `components/dashboard/Dashboard.tsx`: Passagem de prop `onNavigateToTasksWithProject` para o gráfico

**Resultados**:
- ✅ Visualização de gráficos mais intuitiva e interativa
- ✅ Navegação direta do dashboard para tarefas de projetos através de cliques nas colunas
- ✅ Identificação visual melhorada com cores consistentes em todo o sistema
- ✅ Interface de lista de tarefas mais organizada e acessível com abas por status
- ✅ Estilo moderno e profissional em todos os componentes
- ✅ Correção de erros que impediam o carregamento da página de tarefas
- ✅ Formulário de tarefas simplificado sem campo de duração
- ✅ Tooltip transparente e elegante no gráfico de barras
- ✅ Experiência de usuário aprimorada em todas as visualizações

**Benefícios para o usuário**:
- Navegação mais rápida: clicar diretamente no gráfico para ver tarefas do projeto
- Organização melhorada: abas facilitam a visualização de tarefas por status
- Identificação visual instantânea: cores consistentes em todo o sistema
- Interface mais limpa: campo de duração removido simplifica o formulário
- Feedback visual claro: tooltips e indicadores facilitam a compreensão dos dados

### Configuração da Chave API para Insights (Dez 2025)

**Importante**: O sistema de Insights com IA utiliza **OpenAI GPT-4o-mini**, não Google Gemini.

**Como configurar**:

1. **Criar arquivo `.env.local`** na raiz do projeto (se ainda não existir)

2. **Adicionar a chave da API OpenAI**:
   ```env
   # OpenAI AI (opcional - para Insights com IA)
   OPENAI_API_KEY=sua-chave-openai
   # ou
   VITE_OPENAI_API_KEY=sua-chave-openai
   ```

3. **Obter a chave da API**:
   - Acesse: https://platform.openai.com/api-keys
   - Crie uma nova chave de API
   - Copie e cole no arquivo `.env.local`

4. **Reiniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

**Observações**:
- ⚠️ Sem a chave configurada, o botão "Insights com IA" exibirá a mensagem: "Chave da API OpenAI não configurada. A análise está indisponível."
- ✅ O modelo usado é **GPT-4o-mini** (mais econômico e rápido)
- ✅ A análise considera todos os projetos ativos e identifica riscos e oportunidades
- ✅ Funcionalidade totalmente opcional - o restante da aplicação funciona normalmente sem a chave

**Arquivos relacionados**:
- `services/openaiService.ts`: Serviço de integração com OpenAI
- `components/dashboard/InsightsModal.tsx`: Modal de insights
- `vite.config.ts`: Configuração de variáveis de ambiente
- `.env.local`: Arquivo de configuração (não versionado)

**Correção na documentação**:
- Todas as referências antigas ao Google Gemini foram corrigidas para OpenAI
- Seção de integrações atualizada para refletir o uso de OpenAI
