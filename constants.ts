import { User, Project, Task, TaskStatus, TaskPriority, ProjectStatus, Attachment, Message, ProjectType } from './types';

// Fix: Added the required 'role' property to each user object to match the 'User' type.
export const USERS: User[] = [
  { id: 'user-1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice', function: 'Gerente de Projetos', role: 'admin' },
  { id: 'user-2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob', function: 'Designer UI/UX', role: 'member' },
  { id: 'user-3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=charlie', function: 'Desenvolvedor Frontend', role: 'member' },
  { id: 'user-4', name: 'Diana', avatar: 'https://i.pravatar.cc/150?u=diana', function: 'Desenvolvedora Backend', role: 'member' },
  { id: 'user-5', name: 'Ethan', avatar: 'https://i.pravatar.cc/150?u=ethan', function: 'Engenheiro de QA', role: 'member' },
];

const MOCK_FILES: Attachment[] = [
    { id: 'file-1', name: 'Requisitos do Projeto.pdf', type: 'application/pdf', size: 1200000, url: '#', lastModified: new Date(2023, 10, 15).toISOString() },
    { id: 'file-2', name: 'Design Mockup v2.png', type: 'image/png', size: 2500000, url: '#', lastModified: new Date(2023, 10, 20).toISOString() },
];

const MOCK_TASKS: Task[] = [
    { id: 'task-1', name: 'Planejamento e Pesquisa', description: 'Definir escopo e requisitos.', status: TaskStatus.Done, priority: TaskPriority.High, dueDate: '2024-07-20', assignee: USERS[0], dependencies: [], comments: [], attachments: [], duration: 5 },
    { id: 'task-2', name: 'Design da UI/UX', description: 'Criar wireframes e mockups.', status: TaskStatus.InProgress, priority: TaskPriority.High, dueDate: '2024-08-01', assignee: USERS[1], dependencies: ['task-1'], comments: [], attachments: [], duration: 10 },
    { id: 'task-3', name: 'Desenvolvimento do Frontend', description: 'Implementar a interface do usuário.', status: TaskStatus.Pending, priority: TaskPriority.High, dueDate: '2024-08-15', assignee: USERS[2], dependencies: ['task-2'], comments: [], attachments: [], duration: 15 },
    { id: 'task-4', name: 'Desenvolvimento do Backend', description: 'Configurar servidor e banco de dados.', status: TaskStatus.Pending, priority: TaskPriority.High, dueDate: '2024-08-15', assignee: USERS[3], dependencies: ['task-2'], comments: [], attachments: [], duration: 15 },
    { id: 'task-5', name: 'Testes e QA', description: 'Garantir a qualidade do software.', status: TaskStatus.ToDo, priority: TaskPriority.Medium, dueDate: '2024-08-25', assignee: USERS[4], dependencies: ['task-3', 'task-4'], comments: [], attachments: [], duration: 8 },
    { id: 'task-6', name: 'Lançamento', description: 'Implantar a aplicação em produção.', status: TaskStatus.ToDo, priority: TaskPriority.High, dueDate: '2024-09-01', assignee: USERS[0], dependencies: ['task-5'], comments: [], attachments: [], duration: 2 },
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
    budget: 50000,
    actualCost: 25000,
    clientName: 'Alice Martins',
    clientEmail: 'alice.m@clientecorp.com',
    team: [USERS[0], USERS[1], USERS[2]],
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
    budget: 75000,
    actualCost: 15000,
    clientName: 'Roberto Souza',
    clientEmail: 'roberto.s@fitapp.com',
    team: [USERS[0], USERS[3], USERS[4]],
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
    budget: 120000,
    actualCost: 60000,
    clientName: 'Carla Dias',
    clientEmail: 'carla.d@infrasolutions.com',
    team: [USERS[1], USERS[3]],
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

export const MESSAGES: Message[] = [
    { id: 'msg-1', sender: USERS[1], channel: '#geral', content: 'Bom dia equipe! Vamos fazer uma ótima semana.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), isRead: true },
    { id: 'msg-2', sender: USERS[0], channel: '#geral', content: 'Bom dia, Bob! Com certeza. Alguma atualização sobre o novo site?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), isRead: true },
    { id: 'msg-3', sender: USERS[2], channel: 'proj-1', content: 'O componente de checkout está quase pronto.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false },
    { id: 'msg-4', sender: USERS[1], channel: '#geral', content: 'Ótimo! Qualquer impedimento me avisem.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false },
];


export const KPI_MESSAGES = {
  loading: "Analisando dados... Por favor, aguarde.",
  error: "Não foi possível carregar os insights da IA no momento. Tente novamente mais tarde.",
};

export const CRITICAL_PATH_MESSAGES = {
  loading: "Calculando caminho crítico e gerando insights...",
  error: "Ocorreu um erro ao analisar o caminho crítico.",
};