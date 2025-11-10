import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, User, Task, Attachment, Message, ProjectType, TaskStatus, TaskPriority } from '../types';
import { PROJECTS, USERS, MESSAGES, HOMOLOGACAO_TASK_NAMES, RENOVACAO_CCT_TASK_NAMES } from '../constants';

interface AppState {
  projects: Project[];
  users: User[];
  messages: Message[];
}

interface ProjectContextType extends AppState {
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (projectId: string, task: Task) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addFile: (projectId: string, file: Omit<Attachment, 'id'>) => void;
  deleteFile: (projectId: string, fileId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'isRead'>) => void;
  markAllMessagesAsRead: () => void;
  logNotification: (projectId: string, type: 'email' | 'whatsapp') => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    projects: PROJECTS,
    users: USERS,
    messages: MESSAGES,
  });

  const logNotification = (projectId: string, type: 'email' | 'whatsapp') => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === projectId) {
          if (type === 'email') {
            return { ...p, lastEmailNotification: new Date().toISOString() };
          } else {
            return { ...p, lastWhatsappNotification: new Date().toISOString() };
          }
        }
        return p;
      })
    }));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: `proj-${Date.now()}` };
    let taskNames: string[] = [];

    if (project.projectType === ProjectType.HomologacaoMMV || project.projectType === ProjectType.HomologacaoCE) {
        taskNames = HOMOLOGACAO_TASK_NAMES;
    } else if (project.projectType === ProjectType.RenovacaoCCT) {
        taskNames = RENOVACAO_CCT_TASK_NAMES;
    }

    if (taskNames.length > 0) {
        const defaultTasks: Task[] = taskNames.map((name, index) => ({
            id: `task-${Date.now()}-${index}`,
            name,
            description: '',
            status: TaskStatus.ToDo,
            priority: TaskPriority.Medium,
            dueDate: newProject.endDate,
            assignee: null,
            dependencies: [],
            comments: [],
            attachments: [],
            duration: 1,
        }));
        newProject.tasks = [...(newProject.tasks || []), ...defaultTasks];
    }

    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (updatedProject: Project) => {
    setState(prev => {
      const originalProject = prev.projects.find(p => p.id === updatedProject.id);
      let projectWithPotentialNewTasks = { ...updatedProject };

      const newType = updatedProject.projectType;
      const oldType = originalProject?.projectType;

      if (newType !== oldType) {
        let taskNamesToCreate: string[] = [];

        if (newType === ProjectType.HomologacaoMMV || newType === ProjectType.HomologacaoCE) {
            taskNamesToCreate = HOMOLOGACAO_TASK_NAMES;
        } else if (newType === ProjectType.RenovacaoCCT) {
            taskNamesToCreate = RENOVACAO_CCT_TASK_NAMES;
        }
        
        if (taskNamesToCreate.length > 0) {
            const existingTaskNames = new Set(updatedProject.tasks.map(t => t.name));
            
            const tasksToCreate = taskNamesToCreate
              .filter(name => !existingTaskNames.has(name))
              .map((name, index) => ({
                id: `task-${Date.now()}-${index}`,
                name,
                description: '',
                status: TaskStatus.ToDo,
                priority: TaskPriority.Medium,
                dueDate: updatedProject.endDate,
                assignee: null,
                dependencies: [],
                comments: [],
                attachments: [],
                duration: 1,
            }));
            
            if (tasksToCreate.length > 0) {
                projectWithPotentialNewTasks.tasks = [...updatedProject.tasks, ...tasksToCreate];
            }
        }
      }

      return {
        ...prev,
        projects: prev.projects.map(p => p.id === updatedProject.id ? projectWithPotentialNewTasks : p)
      };
    });
  };

  const deleteProject = (projectId: string) => {
    setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== projectId) }));
  };
  
  const addTask = (projectId: string, task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: `task-${Date.now()}` };
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p)
    }));
  };

  const updateTask = (projectId: string, updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) } : p)
    }));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p)
    }));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const updateUser = (updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      projects: prev.projects.map(p => ({
        ...p,
        team: p.team.map(member => member.id === updatedUser.id ? updatedUser : member),
        tasks: p.tasks.map(t => t.assignee?.id === updatedUser.id ? { ...t, assignee: updatedUser } : t)
      }))
    }));
  };

  const deleteUser = (userId: string) => {
    setState(prev => {
      const newUsers = prev.users.filter(u => u.id !== userId);
      const newProjects = prev.projects.map(p => ({
          ...p,
          team: p.team.filter(member => member.id !== userId),
          tasks: p.tasks.map(t => t.assignee?.id === userId ? { ...t, assignee: null } : t)
      }));
      return { ...prev, users: newUsers, projects: newProjects };
    });
  };

  const addFile = (projectId: string, file: Omit<Attachment, 'id'>) => {
    const newFile = { ...file, id: `file-${Date.now()}` };
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, files: [...(p.files || []), newFile] } : p)
    }));
  };

  const deleteFile = (projectId: string, fileId: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, files: (p.files || []).filter(f => f.id !== fileId) } : p)
    }));
  };

  const addMessage = (message: Omit<Message, 'id' | 'isRead'>) => {
    const newMessage = { ...message, id: `msg-${Date.now()}`, isRead: false };
    setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
  };

  const markAllMessagesAsRead = () => {
    setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => ({ ...m, isRead: true }))
    }));
  };

  const value = {
    ...state,
    addProject, updateProject, deleteProject, 
    addTask, updateTask, deleteTask, 
    addUser, updateUser, deleteUser, 
    addFile, deleteFile, addMessage,
    markAllMessagesAsRead,
    logNotification
  };


  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};