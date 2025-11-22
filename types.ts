// Fix: Created the types.ts file to define all the data structures used throughout the application.

// New enum for global user roles
export enum GlobalRole {
  Admin = 'Administrador',
  Supervisor = 'Supervisor',
  Engineer = 'Engenheiro',
}

export type PermissionAction = 'visualizar' | 'editar';

export type RolePermissionSettings = Record<string, PermissionAction[]>;

export type PermissionsByRole = Record<GlobalRole, RolePermissionSettings>;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  function: string;
  role: GlobalRole; // Updated to use the enum
  auth_id?: string;
}

export interface TeamMember {
  user: User;
  role: 'admin' | 'editor' | 'viewer';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  lastModified: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
}

export enum TaskStatus {
  Pending = 'Pendente',
  ToDo = 'A Fazer',
  InProgress = 'Em Andamento',
  Done = 'Concluído',
}

export enum TaskPriority {
  High = 'Alta',
  Medium = 'Média',
  Low = 'Baixa',
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: User | null;
  assignee_id?: string | null;
  dependencies: string[];
  comments: Comment[];
  attachments: Attachment[];
  duration: number;
  project_id: string;
}

export enum ProjectStatus {
  InProgress = 'Em Andamento',
  OnHold = 'Em Espera',
  ToDo = 'A Fazer',
  Completed = 'Concluído',
  Canceled = 'Cancelado',
}

export enum ProjectType {
    Homologacao = 'Homologação',
    RenovacaoCCT = 'Renovação CCT',
    Outros = 'Outros',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  projectType: ProjectType;
  clientName: string;
  clientEmail: string;
  team: TeamMember[];
  tasks: Task[];
  files: Attachment[];
  lastEmailNotification?: string;
  lastWhatsappNotification?: string;
  createdBy?: string;
}

export interface Message {
  id: string;
  sender: User | null;
  sender_id: string | null;
  channel: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface CriticalPathResult {
  path: string[];
  duration: number;
}