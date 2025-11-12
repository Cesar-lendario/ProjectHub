import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Project, User, Task, Message, TeamMember, Attachment, ProjectStatus, TaskStatus, TaskPriority, ProjectType, GlobalRole, PermissionsByRole, PermissionAction } from '../types';
import { PROJECTS, USERS, MESSAGES, HOMOLOGACAO_TASK_NAMES, RENOVACAO_CCT_TASK_NAMES, DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// NOTE: This context uses mock data for simplicity. In a real application,
// all `useCallback` functions would make API calls to a backend to persist changes.

interface ProjectContextType {
  projects: Project[];
  users: User[];
  messages: Message[];
  loading: boolean;
  error: Error | null;
  profile: User | null;
  getProjectRole: (projectId: string) => TeamMember['role'] | undefined;
  rolePermissions: PermissionsByRole;
  updateRolePermission: (role: GlobalRole, moduleId: string, actions: PermissionAction[]) => void;
  setBulkPermissions: (role: GlobalRole, selection: PermissionAction | 'todos' | 'nenhum') => void;
  changeUserRole: (userId: string, role: GlobalRole) => void;
  hasAdmin: boolean;
  focusedUserId: string | null;
  setFocusedUserId: (userId: string | null) => void;

  addProject: (projectData: Omit<Project, 'id' | 'tasks' | 'team' | 'files'>) => Promise<void>;
  updateProject: (projectData: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  addTask: (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => Promise<void>;
  updateTask: (taskData: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  reorderTasks: (projectId: string, status: TaskStatus, orderedTasks: Task[]) => void;

  addUser: (userData: Omit<User, 'id'>) => Promise<User>;
  updateUser: (userData: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  addUserToProject: (projectId: string, userId: string, role: TeamMember['role']) => Promise<void>;
  removeUserFromProject: (projectId: string, userId: string) => Promise<void>;
  updateTeamMemberRole: (projectId: string, userId: string, role: TeamMember['role']) => Promise<void>;

  addFile: (projectId: string, file: File) => Promise<void>;
  addMessage: (messageData: Omit<Message, 'id' | 'sender' | 'isRead'>) => Promise<void>;
  logNotification: (projectId: string, type: 'email' | 'whatsapp') => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionsByRole>(DEFAULT_ROLE_PERMISSIONS);
  const hasAdmin = useMemo(() => users.some(u => u.role === GlobalRole.Admin), [users]);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsers(prev => {
        const exists = prev.some(u => u.id === profile.id);
        if (exists) return prev;
        return [...prev, profile];
      });
    }
  }, [profile]);

  const getProjectRole = useCallback((projectId: string): TeamMember['role'] | undefined => {
    if (!profile) return undefined;
    const project = projects.find(p => p.id === projectId);
    if (!project) return undefined;
    const teamMember = project.team.find(tm => tm.user.id === profile.id);
    return teamMember?.role;
  }, [projects, profile]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'tasks' | 'team' | 'files'>) => {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      tasks: [],
      team: [],
      files: [],
    };
    
    let taskNames: string[] = [];
    if (projectData.projectType === ProjectType.Homologacao) {
      taskNames = HOMOLOGACAO_TASK_NAMES;
    } else if (projectData.projectType === ProjectType.RenovacaoCCT) {
      taskNames = RENOVACAO_CCT_TASK_NAMES;
    }

    if (taskNames.length > 0) {
      const defaultTasks: Task[] = taskNames.map((name) => ({
        id: uuidv4(),
        name,
        description: `Descrição para ${name}`,
        status: TaskStatus.Pending,
        priority: TaskPriority.Medium,
        dueDate: new Date().toISOString().split('T')[0],
        assignee: null,
        dependencies: [],
        comments: [],
        attachments: [],
        duration: 1,
        project_id: newProject.id,
      }));
      newProject.tasks = defaultTasks;
    }
    
    setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback(async (projectData: Project) => {
    setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } : p));
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => {
    const assignee = users.find(u => u.id === taskData.assignee_id) || null;
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      assignee: assignee,
      comments: [],
      attachments: [],
    };
    setProjects(prev => prev.map(p => {
      if (p.id === newTask.project_id) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    }));
  }, [users]);
  
  const updateTask = useCallback(async (taskData: Task) => {
    // Fix: Ensure assignee object is updated when assignee_id changes.
    const assignee = users.find(u => u.id === taskData.assignee_id) || null;
    const consistentTaskData = { ...taskData, assignee };

    setProjects(prev => prev.map(p => {
      if (p.id === consistentTaskData.project_id) {
        return { ...p, tasks: p.tasks.map(t => t.id === consistentTaskData.id ? consistentTaskData : t) };
      }
      return p;
    }));
  }, [users]);

  const deleteTask = useCallback(async (taskId: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      tasks: p.tasks.filter(t => t.id !== taskId),
    })));
  }, []);

  const reorderTasks = useCallback((projectId: string, status: TaskStatus, orderedTasks: Task[]) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== projectId) return project;

        const orderedMap = new Map(orderedTasks.map(task => [task.id, task]));
        const untouched = project.tasks.filter(task => !orderedMap.has(task.id));

        const reordered = orderedTasks.map(task => {
          const existing = project.tasks.find(t => t.id === task.id);
          return existing ? { ...existing, ...task } : task;
        });

        return {
          ...project,
          tasks: [...untouched, ...reordered],
        };
      })
    );
  }, []);

  const addUser = useCallback(async (userData: Omit<User, 'id'>) => {
      const normalizedEmail = userData.email.trim().toLowerCase();
      const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
          throw new Error('Já existe um membro com este e-mail.');
      }

      const newUser: User = {
          id: uuidv4(),
          ...userData,
          role: userData.role ?? GlobalRole.Engineer,
          email: normalizedEmail,
      };

      setUsers(prev => [...prev, newUser]);
      return newUser;
  }, [users]);

  const updateUser = useCallback(async (userData: User) => {
      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
      setProjects(prevProjects => prevProjects.map(p => ({
          ...p,
          team: p.team.map(tm => tm.user.id === userData.id ? { ...tm, user: userData } : tm),
          tasks: p.tasks.map(t => t.assignee?.id === userData.id ? { ...t, assignee: userData } : t)
      })));
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setProjects(prevProjects => prevProjects.map(p => ({
          ...p,
          team: p.team.filter(tm => tm.user.id !== userId),
          tasks: p.tasks.map(t => t.assignee?.id === userId ? { ...t, assignee: null, assignee_id: null } : t)
      })));
  }, []);

  const addUserToProject = useCallback(async (projectId: string, userId: string, role: TeamMember['role']) => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && !p.team.some(tm => tm.user.id === userId)) {
        return { ...p, team: [...p.team, { user, role }] };
      }
      return p;
    }));
  }, [users]);

  const removeUserFromProject = useCallback(async (projectId: string, userId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, team: p.team.filter(tm => tm.user.id !== userId) };
      }
      return p;
    }));
  }, []);

  const updateTeamMemberRole = useCallback(async (projectId: string, userId: string, role: TeamMember['role']) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, team: p.team.map(tm => tm.user.id === userId ? { ...tm, role } : tm) };
      }
      return p;
    }));
  }, []);

  const addFile = useCallback(async (projectId: string, file: File) => {
    const newFile: Attachment = {
        id: uuidv4(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // Temporary URL for preview
        lastModified: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            return { ...p, files: [...p.files, newFile] };
        }
        return p;
    }));
  }, []);

  const addMessage = useCallback(async (messageData: Omit<Message, 'id' | 'sender' | 'isRead'>) => {
      const sender = users.find(u => u.id === messageData.sender_id);
      if (!sender) throw new Error("Sender not found");
      const newMessage: Message = {
          ...messageData,
          id: uuidv4(),
          sender,
          isRead: false
      };
      setMessages(prev => [...prev, newMessage]);
  }, [users]);

  const logNotification = useCallback(async (projectId: string, type: 'email' | 'whatsapp') => {
      setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
              const now = new Date().toISOString();
              if (type === 'email') return { ...p, lastEmailNotification: now };
              if (type === 'whatsapp') return { ...p, lastWhatsappNotification: now };
          }
          return p;
      }));
  }, []);

  const updateRolePermission = useCallback((role: GlobalRole, moduleId: string, actions: PermissionAction[]) => {
      setRolePermissions(prev => ({
          ...prev,
          [role]: {
              ...prev[role],
              [moduleId]: actions,
          },
      }));
  }, []);

  const setBulkPermissions = useCallback((role: GlobalRole, selection: PermissionAction | 'todos' | 'nenhum') => {
      setRolePermissions(prev => {
          const updated = { ...prev[role] };
          PERMISSION_MODULES.forEach(module => {
              if (selection === 'todos') {
                  updated[module.id] = ['visualizar', 'editar'];
              } else if (selection === 'nenhum') {
                  updated[module.id] = [];
              } else if (selection === 'editar') {
                  updated[module.id] = ['visualizar', 'editar'];
              } else if (selection === 'visualizar') {
                  updated[module.id] = ['visualizar'];
              }
          });
          return {
              ...prev,
              [role]: updated,
          };
      });
  }, []);

  const changeUserRole = useCallback((userId: string, role: GlobalRole) => {
      setUsers(prev => {
          const targetUser = prev.find(u => u.id === userId);
          if (!targetUser) return prev;

          const updatedUsers = prev.map(u => {
              if (u.id === userId) {
                  return { ...u, role };
              }
              if (role === GlobalRole.Admin && u.role === GlobalRole.Admin && u.id !== userId) {
                  return { ...u, role: GlobalRole.Supervisor };
              }
              return u;
          });

          setProjects(prevProjects => prevProjects.map(p => ({
              ...p,
              team: p.team.map(tm => {
                  const updatedUser = updatedUsers.find(u => u.id === tm.user.id);
                  return updatedUser ? { ...tm, user: updatedUser } : tm;
              }),
              tasks: p.tasks.map(t => {
                  const updatedUser = t.assignee ? updatedUsers.find(u => u.id === t.assignee?.id) : null;
                  return updatedUser ? { ...t, assignee: updatedUser } : t;
              }),
          })));

          return updatedUsers;
      });
  }, []);

  const value = {
    projects,
    users,
    messages,
    loading,
    error,
    profile,
    getProjectRole,
    rolePermissions,
    updateRolePermission,
    setBulkPermissions,
    changeUserRole,
    hasAdmin,
    focusedUserId,
    setFocusedUserId,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    addUser,
    updateUser,
    deleteUser,
    addUserToProject,
    removeUserFromProject,
    updateTeamMemberRole,
    addFile,
    addMessage,
    logNotification,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};