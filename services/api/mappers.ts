// Mappers para converter dados do Supabase para os tipos da aplicação
import { Project, Task, User, Message, Attachment, TeamMember, ProjectStatus, TaskStatus, TaskPriority, ProjectType, GlobalRole } from '../../types';

// Mapeamento de status do projeto
const mapProjectStatus = (status: string): ProjectStatus => {
  const statusMap: Record<string, ProjectStatus> = {
    'planning': ProjectStatus.InProgress,
    'in_progress': ProjectStatus.InProgress,
    'on_hold': ProjectStatus.OnHold,
    'todo': ProjectStatus.ToDo,
    'completed': ProjectStatus.Completed,
    'cancelled': ProjectStatus.Canceled,
  };
  return statusMap[status] || ProjectStatus.InProgress;
};

// Mapeamento de tipo de projeto
const mapProjectType = (type: string): ProjectType => {
  const typeMap: Record<string, ProjectType> = {
    'homologacao': ProjectType.Homologacao,
    'renovacao_cct': ProjectType.RenovacaoCCT,
    'outros': ProjectType.Outros,
  };
  return typeMap[type] || ProjectType.Outros;
};

// Mapeamento de status da tarefa
const mapTaskStatus = (status: string): TaskStatus => {
  const statusMap: Record<string, TaskStatus> = {
    'pending': TaskStatus.Pending,
    'todo': TaskStatus.ToDo,
    'in_progress': TaskStatus.InProgress,
    'done': TaskStatus.Done,
  };
  return statusMap[status] || TaskStatus.Pending;
};

// Mapeamento de prioridade da tarefa
const mapTaskPriority = (priority: string): TaskPriority => {
  const priorityMap: Record<string, TaskPriority> = {
    'low': TaskPriority.Low,
    'medium': TaskPriority.Medium,
    'high': TaskPriority.High,
  };
  return priorityMap[priority] || TaskPriority.Medium;
};

// Mapeamento de role global
const mapGlobalRole = (role: string): GlobalRole => {
  const roleMap: Record<string, GlobalRole> = {
    'admin': GlobalRole.Admin,
    'supervisor': GlobalRole.Supervisor,
    'engineer': GlobalRole.Engineer,
  };
  return roleMap[role] || GlobalRole.Engineer;
};

// Converter usuário do Supabase para tipo da aplicação
export const mapUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email || 'sem-email@sistema.com',  // Tabela users não tem email obrigatório
  name: dbUser.name,
  avatar: dbUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.name}`,
  function: dbUser.function || 'Membro da Equipe',
  role: mapGlobalRole(dbUser.role),
});

// Converter tarefa do Supabase para tipo da aplicação
export const mapTask = (dbTask: any): Task => ({
  id: dbTask.id,
  name: dbTask.name,
  description: dbTask.description,
  status: mapTaskStatus(dbTask.status),
  priority: mapTaskPriority(dbTask.priority),
  dueDate: dbTask.due_date,
  assignee: dbTask.assignee ? mapUser(dbTask.assignee) : null,
  assignee_id: dbTask.assignee_id,
  dependencies: dbTask.dependencies || [],
  comments: [], // Comentários não estão no banco ainda
  attachments: [], // Anexos serão carregados separadamente
  duration: dbTask.duration || 1,
  project_id: dbTask.project_id,
});

// Converter anexo do Supabase para tipo da aplicação
export const mapAttachment = (dbAttachment: any): Attachment => ({
  id: dbAttachment.id,
  name: dbAttachment.name,
  type: dbAttachment.type,
  size: dbAttachment.size,
  url: dbAttachment.url,
  lastModified: dbAttachment.created_at,
});

// Converter membro da equipe do Supabase para tipo da aplicação
export const mapTeamMember = (dbTeamMember: any): TeamMember => ({
  user: mapUser(dbTeamMember.user),
  role: dbTeamMember.role as 'admin' | 'editor' | 'viewer',
});

// Converter projeto do Supabase para tipo da aplicação
export const mapProject = (dbProject: any): Project => ({
  id: dbProject.id,
  name: dbProject.name,
  description: dbProject.description,
  startDate: dbProject.start_date,
  endDate: dbProject.end_date,
  status: mapProjectStatus(dbProject.status),
  projectType: mapProjectType(dbProject.project_type),
  clientName: dbProject.client_name,
  clientEmail: dbProject.cliente_email,
  team: dbProject.project_team ? dbProject.project_team.map(mapTeamMember) : [],
  tasks: [], // Tarefas serão carregadas separadamente
  files: [], // Arquivos serão carregados separadamente
  lastEmailNotification: dbProject.last_email_notification,
  lastWhatsappNotification: dbProject.last_whatsapp_notification,
  createdBy: dbProject.created_by,
});

// Converter mensagem do Supabase para tipo da aplicação
export const mapMessage = (dbMessage: any): Message => ({
  id: dbMessage.id,
  sender: dbMessage.sender ? mapUser(dbMessage.sender) : null,
  sender_id: dbMessage.sender_id,
  channel: dbMessage.channel,
  content: dbMessage.content,
  timestamp: dbMessage.created_at,
  isRead: dbMessage.is_read,
});

// Funções inversas - converter tipos da aplicação para Supabase

export const unmapProjectStatus = (status: ProjectStatus): 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'todo' => {
  const statusMap: Record<ProjectStatus, 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'todo'> = {
    [ProjectStatus.InProgress]: 'in_progress',
    [ProjectStatus.OnHold]: 'on_hold',
    [ProjectStatus.ToDo]: 'todo',
    [ProjectStatus.Completed]: 'completed',
    [ProjectStatus.Canceled]: 'cancelled',
  };
  return statusMap[status] || 'in_progress';
};

export const unmapProjectType = (type: ProjectType): 'homologacao' | 'renovacao_cct' | 'outros' => {
  const typeMap: Record<ProjectType, 'homologacao' | 'renovacao_cct' | 'outros'> = {
    [ProjectType.Homologacao]: 'homologacao',
    [ProjectType.RenovacaoCCT]: 'renovacao_cct',
    [ProjectType.Outros]: 'outros',
  };
  return typeMap[type] || 'outros';
};

export const unmapTaskStatus = (status: TaskStatus): 'pending' | 'todo' | 'in_progress' | 'done' => {
  const statusMap: Record<TaskStatus, 'pending' | 'todo' | 'in_progress' | 'done'> = {
    [TaskStatus.Pending]: 'pending',
    [TaskStatus.ToDo]: 'todo',
    [TaskStatus.InProgress]: 'in_progress',
    [TaskStatus.Done]: 'done',
  };
  return statusMap[status] || 'pending';
};

export const unmapTaskPriority = (priority: TaskPriority): 'low' | 'medium' | 'high' => {
  const priorityMap: Record<TaskPriority, 'low' | 'medium' | 'high'> = {
    [TaskPriority.Low]: 'low',
    [TaskPriority.Medium]: 'medium',
    [TaskPriority.High]: 'high',
  };
  return priorityMap[priority] || 'medium';
};

export const unmapGlobalRole = (role: GlobalRole): 'admin' | 'supervisor' | 'engineer' => {
  const roleMap: Record<GlobalRole, 'admin' | 'supervisor' | 'engineer'> = {
    [GlobalRole.Admin]: 'admin',
    [GlobalRole.Supervisor]: 'supervisor',
    [GlobalRole.Engineer]: 'engineer',
  };
  return roleMap[role] || 'engineer';
};

