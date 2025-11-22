import { User, Project, Task, TaskStatus, TaskPriority, ProjectStatus, Attachment, Message, ProjectType, GlobalRole, PermissionsByRole, PermissionAction } from './types';

// Fix: Added the required 'role' property to each user object to match the 'User' type.
export const USERS: User[] = [
  { id: 'user-1', name: 'Cesar A Bressiani', email: 'cat@caterg.com.br', avatar: 'https://i.pravatar.cc/150?u=cesar', function: 'Diretor de Operações', role: GlobalRole.Admin },
  { id: 'user-2', name: 'Alice', email: 'alice@taskmeet.com', avatar: 'https://i.pravatar.cc/150?u=alice', function: 'Gerente de Projetos', role: GlobalRole.Supervisor },
  { id: 'user-3', name: 'Bob', email: 'bob@taskmeet.com', avatar: 'https://i.pravatar.cc/150?u=bob', function: 'Designer UI/UX', role: GlobalRole.Engineer },
  { id: 'user-4', name: 'Charlie', email: 'charlie@taskmeet.com', avatar: 'https://i.pravatar.cc/150?u=charlie', function: 'Desenvolvedor Frontend', role: GlobalRole.Engineer },
  { id: 'user-5', name: 'Diana', email: 'diana@taskmeet.com', avatar: 'https://i.pravatar.cc/150?u=diana', function: 'Desenvolvedora Backend', role: GlobalRole.Engineer },
  { id: 'user-6', name: 'Ethan', email: 'ethan@taskmeet.com', avatar: 'https://i.pravatar.cc/150?u=ethan', function: 'Engenheiro de QA', role: GlobalRole.Engineer },
];

const MOCK_FILES: Attachment[] = [
    { id: 'file-1', name: 'Requisitos do Projeto.pdf', type: 'application/pdf', size: 1200000, url: '#', lastModified: new Date(2023, 10, 15).toISOString() },
    { id: 'file-2', name: 'Design Mockup v2.png', type: 'image/png', size: 2500000, url: '#', lastModified: new Date(2023, 10, 20).toISOString() },
];

// Fix: Added the required 'project_id' property to each task object to match the 'Task' type.
const MOCK_TASKS: Task[] = [
    { id: 'task-1', name: 'Planejamento e Pesquisa', description: 'Definir escopo e requisitos.', status: TaskStatus.Done, priority: TaskPriority.High, dueDate: '2024-07-20', assignee: USERS[1], dependencies: [], comments: [], attachments: [], duration: 5, project_id: 'proj-1' },
    { id: 'task-2', name: 'Design da UI/UX', description: 'Criar wireframes e mockups.', status: TaskStatus.InProgress, priority: TaskPriority.High, dueDate: '2024-08-01', assignee: USERS[2], dependencies: ['task-1'], comments: [], attachments: [], duration: 10, project_id: 'proj-1' },
    { id: 'task-3', name: 'Desenvolvimento do Frontend', description: 'Implementar a interface do usuário.', status: TaskStatus.Pending, priority: TaskPriority.High, dueDate: '2024-08-15', assignee: USERS[3], dependencies: ['task-2'], comments: [], attachments: [], duration: 15, project_id: 'proj-1' },
    { id: 'task-4', name: 'Desenvolvimento do Backend', description: 'Configurar servidor e banco de dados.', status: TaskStatus.Pending, priority: TaskPriority.High, dueDate: '2024-08-15', assignee: USERS[4], dependencies: ['task-2'], comments: [], attachments: [], duration: 15, project_id: 'proj-2' },
    { id: 'task-5', name: 'Testes e QA', description: 'Garantir a qualidade do software.', status: TaskStatus.ToDo, priority: TaskPriority.Medium, dueDate: '2024-08-25', assignee: USERS[5], dependencies: ['task-3', 'task-4'], comments: [], attachments: [], duration: 8, project_id: 'proj-2' },
    { id: 'task-6', name: 'Lançamento', description: 'Implantar a aplicação em produção.', status: TaskStatus.ToDo, priority: TaskPriority.High, dueDate: '2024-09-01', assignee: USERS[0], dependencies: ['task-5'], comments: [], attachments: [], duration: 2, project_id: 'proj-2' },
];

export const PROJECTS: Project[] = [
  { 
    id: 'proj-1', 
    name: 'Cliente Corp S.A.', 
    description: 'Projeto: Lançamento do Novo Site. Desenvolvimento completo e lançamento de um novo site corporativo com funcionalidades de e-commerce.',
    startDate: '2024-07-01',
    endDate: '2024-09-01',
    status: ProjectStatus.InProgress,
    projectType: ProjectType.Outros,
    clientName: 'Alice Martins',
    clientEmail: 'alice.m@clientecorp.com',
    // Fix: Converted the 'team' array from User[] to TeamMember[] by wrapping each user in an object with a role.
    team: [
      { user: USERS[0], role: 'admin' },
      { user: USERS[1], role: 'editor' },
      { user: USERS[2], role: 'viewer' },
    ],
    tasks: MOCK_TASKS.slice(0, 3),
    files: MOCK_FILES
  },
  { 
    id: 'proj-2', 
    name: 'FitApp Inc.', 
    description: 'Projeto: Aplicativo Móvel de Fitness. Criar um aplicativo móvel para iOS e Android para rastreamento de atividades físicas e planos de dieta.',
    startDate: '2024-08-01',
    endDate: '2024-12-01',
    status: ProjectStatus.InProgress,
    projectType: ProjectType.Outros,
    clientName: 'Roberto Souza',
    clientEmail: 'roberto.s@fitapp.com',
    // Fix: Converted the 'team' array from User[] to TeamMember[] by wrapping each user in an object with a role.
    team: [
      { user: USERS[0], role: 'admin' },
      { user: USERS[3], role: 'editor' },
      { user: USERS[4], role: 'viewer' },
    ],
    tasks: MOCK_TASKS.slice(3, 6),
    files: []
  },
  { 
    id: 'proj-3', 
    name: 'Infra Solutions', 
    description: 'Projeto: Migração para Nuvem. Migrar toda a infraestrutura on-premise para uma solução baseada em nuvem para melhorar a escalabilidade.',
    startDate: '2024-06-15',
    endDate: '2024-08-15',
    status: ProjectStatus.OnHold,
    projectType: ProjectType.Outros,
    clientName: 'Carla Dias',
    clientEmail: 'carla.d@infrasolutions.com',
    // Fix: Converted the 'team' array from User[] to TeamMember[] by wrapping each user in an object with a role.
    team: [
      { user: USERS[1], role: 'admin' },
      { user: USERS[3], role: 'viewer' },
    ],
    tasks: [],
    files: []
  },
];

export const HOMOLOGACAO_TASK_NAMES: string[] = [
    'DOCUMENTOS DA EMPRESA',
    'CCT',
    'NF/ IDENTIFICAÇÃO MMV/ CARROCERIA',
    'ANEXOS IV, VII',
    'LCVM',
    'INSPEÇÃO',
    'FOTOGRAFIAS',
    'FUNSET',
    'DADOS TÉCNICOS',
    'PROJETO',
    'ENSAIOS',
    'DECLARAÇÃO DE NÍVEL',
];

export const RENOVACAO_CCT_TASK_NAMES: string[] = [
    'DOCUMENTAÇÃO',
    'INSPEÇÃO',
];

// Fix: Added the required 'sender_id' property to each message object to match the 'Message' type.
export const MESSAGES: Message[] = [
    { id: 'msg-1', sender: USERS[1], sender_id: USERS[1].id, channel: '#geral', content: 'Bom dia equipe! Vamos fazer uma ótima semana.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), isRead: true },
    { id: 'msg-2', sender: USERS[0], sender_id: USERS[0].id, channel: '#geral', content: 'Bom dia, Bob! Com certeza. Alguma atualização sobre o novo site?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), isRead: true },
    { id: 'msg-3', sender: USERS[2], sender_id: USERS[2].id, channel: 'proj-1', content: 'O componente de checkout está quase pronto.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false },
    { id: 'msg-4', sender: USERS[1], sender_id: USERS[1].id, channel: '#geral', content: 'Ótimo! Qualquer impedimento me avisem.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false },
];


export const KPI_MESSAGES = {
  loading: "Analisando dados... Por favor, aguarde.",
  error: "Não foi possível carregar os insights da IA no momento. Tente novamente mais tarde.",
};

export const CRITICAL_PATH_MESSAGES = {
  loading: "Calculando caminho crítico e gerando insights...",
  error: "Ocorreu um erro ao analisar o caminho crítico.",
};

export const PERMISSION_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projetos' },
  { id: 'tasks', label: 'Tarefas' },
  { id: 'schedule', label: 'Cronograma' },
  { id: 'team', label: 'Equipe' },
  { id: 'files', label: 'Arquivos' },
  { id: 'communication', label: 'Comunicação' },
  { id: 'notifications', label: 'Histórico de Cobranças' },
];

const ALL_PERMISSIONS: PermissionAction[] = ['visualizar', 'editar'];

export const DEFAULT_ROLE_PERMISSIONS: PermissionsByRole = {
  [GlobalRole.Admin]: PERMISSION_MODULES.reduce((acc, module) => {
    acc[module.id] = [...ALL_PERMISSIONS];
    return acc;
  }, {} as PermissionsByRole[GlobalRole.Admin]),
  [GlobalRole.Supervisor]: PERMISSION_MODULES.reduce((acc, module) => {
    acc[module.id] = module.id === 'notifications' ? ['visualizar'] : [...ALL_PERMISSIONS];
    return acc;
  }, {} as PermissionsByRole[GlobalRole.Supervisor]),
  [GlobalRole.Engineer]: PERMISSION_MODULES.reduce((acc, module) => {
    acc[module.id] = ['visualizar'];
    return acc;
  }, {} as PermissionsByRole[GlobalRole.Engineer]),
};