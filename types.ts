export interface User {
  id: string;
  name: string;
  avatar: string;
  function: string;
  role: 'admin' | 'member';
  auth_id?: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  lastModified: string;
}

export enum TaskStatus {
  Pending = 'Pendente',
  ToDo = 'A Fazer',
  InProgress = 'Em Andamento',
  Done = 'Concluído',
}

export enum TaskPriority {
  Low = 'Baixa',
  Medium = 'Média',
  High = 'Alta',
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: User | null;
  dependencies: string[]; // array of task IDs
  comments: Comment[];
  attachments: Attachment[];
  duration: number; // in days
  position?: number;
}

export enum ProjectStatus {
  InProgress = 'Em Andamento',
  Completed = 'Concluído',
  OnHold = 'Em Espera',
}

export enum ProjectType {
    HomologacaoMMV = 'Homologação MMV',
    HomologacaoCE = 'Homologação CE',
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
  budget: number;
  actualCost: number;
  clientName: string;
  clientEmail: string;
  team: User[];
  tasks: Task[];
  files: Attachment[];
  lastEmailNotification?: string;
  lastWhatsappNotification?: string;
}

export interface CriticalPathResult {
  path: string[];
  duration: number;
}

export interface Message {
  id: string;
  sender: User;
  channel: string; // e.g., '#geral' or a project ID
  content: string;
  timestamp: string;
  isRead: boolean;
}