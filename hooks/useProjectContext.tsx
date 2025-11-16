import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Project, User, Task, Message, TeamMember, Attachment, ProjectStatus, TaskStatus, TaskPriority, ProjectType, GlobalRole, PermissionsByRole, PermissionAction } from '../types';
import { HOMOLOGACAO_TASK_NAMES, RENOVACAO_CCT_TASK_NAMES, DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Importar serviços do Supabase
import { ProjectsService, TasksService, UsersService, TeamService, AttachmentsService, MessagesService } from '../services/api';
import { mapProject, mapTask, mapUser, mapMessage, mapAttachment, unmapProjectStatus, unmapProjectType, unmapTaskStatus, unmapTaskPriority, unmapGlobalRole } from '../services/api/mappers';

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
  deleteUser: (userId: string, reassignToUserId?: string | null) => Promise<void>;
  
  addUserToProject: (projectId: string, userId: string, role: TeamMember['role']) => Promise<void>;
  removeUserFromProject: (projectId: string, userId: string) => Promise<void>;
  updateTeamMemberRole: (projectId: string, userId: string, role: TeamMember['role']) => Promise<void>;

  addFile: (projectId: string, file: File) => Promise<void>;
  deleteFile: (fileId: string, projectId: string) => Promise<void>;
  addMessage: (messageData: Omit<Message, 'id' | 'sender' | 'isRead'>) => Promise<void>;
  logNotification: (projectId: string, type: 'email' | 'whatsapp') => Promise<void>;
  refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionsByRole>(DEFAULT_ROLE_PERMISSIONS);
  const hasAdmin = useMemo(() => users.some(u => u.role === GlobalRole.Admin), [users]);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

  // Carregar dados iniciais do Supabase
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando carregamento de dados...');

      // Carregar usuários
      const dbUsers = await UsersService.getAll();
      console.log('👥 Usuários carregados:', dbUsers.length);
      const mappedUsers = dbUsers.map(mapUser);
      setUsers(mappedUsers);

      // Carregar projetos com equipes
      const dbProjects = await ProjectsService.getAll();
      console.log('📁 Projetos carregados do banco:', dbProjects.length);
      console.log('📁 Dados dos projetos:', dbProjects);
      
      // Para cada projeto, carregar tarefas e arquivos
      const projectsWithDetails = await Promise.all(
        dbProjects.map(async (dbProject) => {
          const project = mapProject(dbProject);
          
          // Carregar tarefas do projeto
          const dbTasks = await TasksService.getByProject(project.id);
          project.tasks = dbTasks.map(mapTask);

          // Carregar arquivos do projeto
          const dbFiles = await AttachmentsService.getByProject(project.id);
          project.files = dbFiles.map(mapAttachment);

          return project;
        })
      );

      console.log('✅ Projetos processados:', projectsWithDetails.length);
      console.log('✅ Projetos com detalhes:', projectsWithDetails);
      setProjects(projectsWithDetails);

      // Carregar mensagens
      const dbMessages = await MessagesService.getAll();
      const mappedMessages = dbMessages.map(mapMessage);
      setMessages(mappedMessages);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sincronizar/mesclar perfil do usuário logado na lista de usuários
  useEffect(() => {
    if (profile) {
      setUsers(prev => {
        const index = prev.findIndex(u => u.id === profile.id);
        if (index === -1) {
          return [...prev, profile];
        }
        const updated = [...prev];
        updated[index] = { ...updated[index], ...profile };
        return updated;
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
    try {
      setLoading(true);
      
      // Criar projeto no Supabase
      const dbProject = await ProjectsService.create({
        name: projectData.name,
        description: projectData.description,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        status: unmapProjectStatus(projectData.status),
        project_type: unmapProjectType(projectData.projectType),
        client_name: projectData.clientName,
        cliente_email: projectData.clientEmail,
        created_by: profile?.id || null,
      });

      console.log('addProject - Projeto criado no Supabase:', dbProject);
      
      const newProject = mapProject(dbProject);
      newProject.tasks = [];
      newProject.files = [];
      newProject.team = [];

      console.log('addProject - Projeto mapeado:', newProject);

      // Criar tarefas padrão baseadas no tipo de projeto
      let taskNames: string[] = [];
      if (projectData.projectType === ProjectType.Homologacao) {
        taskNames = HOMOLOGACAO_TASK_NAMES;
      } else if (projectData.projectType === ProjectType.RenovacaoCCT) {
        taskNames = RENOVACAO_CCT_TASK_NAMES;
      }

      console.log('addProject - Tarefas a criar:', taskNames.length);

      if (taskNames.length > 0) {
        const tasksToCreate = taskNames.map((name) => ({
          project_id: newProject.id,
          name,
          description: `Descrição para ${name}`,
          status: 'todo' as const, // Tarefas criadas com status "A Fazer"
          priority: 'medium' as const,
          due_date: new Date().toISOString().split('T')[0],
          duration: 1,
          dependencies: [],
        }));

        console.log('addProject - Criando tarefas...');
        const dbTasks = await TasksService.createBulk(tasksToCreate);
        console.log('addProject - Tarefas criadas:', dbTasks.length);
        newProject.tasks = dbTasks.map(mapTask);
      }

      console.log('addProject - Adicionando projeto ao estado...');
      setProjects(prev => [...prev, newProject]);
      console.log('addProject - Projeto adicionado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectData: Project) => {
    try {
      setLoading(true);
      
      await ProjectsService.update(projectData.id, {
        name: projectData.name,
        description: projectData.description,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        status: unmapProjectStatus(projectData.status),
        project_type: unmapProjectType(projectData.projectType),
        client_name: projectData.clientName,
        cliente_email: projectData.clientEmail,
        // NÃO enviar created_by no update - esse campo só é definido na criação
      });

      // Preservar as tarefas, equipe e arquivos existentes ao atualizar o projeto no estado
      setProjects(prev => prev.map(p => {
        if (p.id === projectData.id) {
          return {
            ...projectData,
            tasks: p.tasks,        // Preservar tarefas existentes
            team: p.team,          // Preservar equipe existente
            files: p.files         // Preservar arquivos existentes
          };
        }
        return p;
      }));
      
      console.log('Projeto atualizado com sucesso:', projectData.name);
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      await ProjectsService.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Erro ao deletar projeto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'assignee' | 'comments' | 'attachments'>) => {
    try {
      setLoading(true);
      
      const dbTask = await TasksService.create({
        project_id: taskData.project_id,
        name: taskData.name,
        description: taskData.description,
        status: unmapTaskStatus(taskData.status),
        priority: unmapTaskPriority(taskData.priority),
        due_date: taskData.dueDate,
        assignee_id: taskData.assignee_id || null,
        duration: taskData.duration,
        dependencies: taskData.dependencies,
      });

      const assignee = users.find(u => u.id === taskData.assignee_id) || null;
      const newTask: Task = {
        ...mapTask(dbTask),
        assignee,
        comments: [],
        attachments: [],
      };

      setProjects(prev => prev.map(p => {
        if (p.id === newTask.project_id) {
          return { ...p, tasks: [...p.tasks, newTask] };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users]);
  
  const updateTask = useCallback(async (taskData: Task) => {
    try {
      setLoading(true);
      
      // Buscar a tarefa anterior para verificar se o status mudou
      let finalTaskData = { ...taskData };
      const previousTask = projects.flatMap(p => p.tasks).find(t => t.id === taskData.id);
      
      // Se o status mudou, atualizar a data de início para hoje
      if (previousTask && previousTask.status !== taskData.status) {
        finalTaskData.dueDate = new Date().toISOString().split('T')[0];
      }
      
      await TasksService.update(finalTaskData.id, {
        name: finalTaskData.name,
        description: finalTaskData.description,
        status: unmapTaskStatus(finalTaskData.status),
        priority: unmapTaskPriority(finalTaskData.priority),
        due_date: finalTaskData.dueDate,
        assignee_id: finalTaskData.assignee_id || null,
        duration: finalTaskData.duration,
        dependencies: finalTaskData.dependencies,
      });

      const assignee = users.find(u => u.id === finalTaskData.assignee_id) || null;
      const consistentTaskData = { ...finalTaskData, assignee };

      setProjects(prev => prev.map(p => {
        if (p.id === consistentTaskData.project_id) {
          return { ...p, tasks: p.tasks.map(t => t.id === consistentTaskData.id ? consistentTaskData : t) };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, projects]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      await TasksService.delete(taskId);
      setProjects(prev => prev.map(p => ({
        ...p,
        tasks: p.tasks.filter(t => t.id !== taskId),
      })));
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      throw err;
    } finally {
      setLoading(false);
    }
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

    try {
      setLoading(true);
      
      // IMPORTANTE: A tabela 'users' não tem coluna 'email'
      // O email será gerenciado pelo Supabase Auth quando o usuário fizer login
      const dbUser = await UsersService.create({
        id: uuidv4(),
        // email não é enviado para o banco (não existe na tabela users)
        name: userData.name,
        avatar: userData.avatar,
        function: userData.function,
        role: unmapGlobalRole(userData.role),
        auth_id: null, // Será preenchido quando o usuário fizer login
      });

      // Manter o email no objeto retornado para o frontend
      const newUser = { ...mapUser(dbUser), email: normalizedEmail };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users]);

  const updateUser = useCallback(async (userData: User) => {
    try {
      setLoading(true);
      
      // IMPORTANTE: A tabela 'users' não tem coluna 'email'
      // O email vem do Supabase Auth e não pode ser alterado aqui
      const updatedDbUser = await UsersService.update(userData.id, {
        name: userData.name,
        avatar: userData.avatar,
        function: userData.function,
        role: unmapGlobalRole(userData.role),
      });

      // Mapear o usuário retornado do banco e manter o email do userData original
      const updatedUser = { ...mapUser(updatedDbUser), email: userData.email };

      setUsers(prev => prev.map(u => u.id === userData.id ? updatedUser : u));
      setProjects(prevProjects => prevProjects.map(p => ({
        ...p,
        team: p.team.map(tm => tm.user.id === userData.id ? { ...tm, user: updatedUser } : tm),
        tasks: p.tasks.map(t => t.assignee?.id === userData.id ? { ...t, assignee: updatedUser } : t)
      })));

      // Se for o próprio usuário logado, atualizar também o profile no AuthContext
      if (profile?.id === userData.id) {
        updateProfile(updatedUser);
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile, updateProfile]);

  const deleteUser = useCallback(async (userId: string, reassignToUserId?: string | null) => {
    try {
      setLoading(true);
      
      // Buscar informações do usuário antes de excluir (para logs)
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) throw new Error('Usuário não encontrado');

      // ===== VERIFICAÇÕES DE SEGURANÇA =====
      
      // 1. Não pode excluir a si mesmo
      if (profile?.id === userId) {
        throw new Error('Você não pode excluir seu próprio perfil.');
      }

      // 2. Não pode excluir o único administrador
      if (userToDelete.role === GlobalRole.Admin) {
        const adminCount = users.filter(u => u.role === GlobalRole.Admin).length;
        if (adminCount <= 1) {
          throw new Error('Não é possível excluir o único administrador do sistema. Promova outro usuário a administrador primeiro.');
        }
      }

      // 3. Validar usuário de reatribuição se fornecido
      if (reassignToUserId && !users.find(u => u.id === reassignToUserId)) {
        throw new Error('Usuário para reatribuição não encontrado.');
      }

      // 4. Validar permissão (apenas admins podem excluir)
      if (profile?.role !== GlobalRole.Admin) {
        throw new Error('Apenas administradores podem excluir usuários.');
      }

      // Log de auditoria (registrar exclusão)
      console.log('🗑️ [AUDIT] Exclusão de usuário:', {
        userId: userToDelete.id,
        userName: userToDelete.name,
        userEmail: userToDelete.email,
        userRole: userToDelete.role,
        deletedAt: new Date().toISOString(),
        deletedBy: profile?.id || 'unknown',
        reassignTo: reassignToUserId || 'none',
      });

      // Se houver usuário para reatribuir
      let reassignToUser: User | null = null;
      if (reassignToUserId) {
        reassignToUser = users.find(u => u.id === reassignToUserId) || null;
        console.log('🔄 [AUDIT] Reatribuindo tarefas para:', {
          newAssigneeId: reassignToUser?.id,
          newAssigneeName: reassignToUser?.name,
        });
      }

      // Calcular impacto (para logs)
      const affectedProjects = projects.filter(p =>
        p.team.some(tm => tm.user.id === userId)
      );
      const affectedTasks = projects.flatMap(p =>
        p.tasks.filter(t => t.assignee?.id === userId)
      );

      console.log('📊 [AUDIT] Impacto da exclusão:', {
        projectsAffected: affectedProjects.length,
        tasksAffected: affectedTasks.length,
        taskIds: affectedTasks.map(t => t.id),
      });

      // Reatribuir tarefas no banco (se necessário)
      if (affectedTasks.length > 0) {
        for (const task of affectedTasks) {
          await TasksService.update(task.id, {
            assignee_id: reassignToUserId || null,
          });
        }
      }

      // Excluir usuário do banco
      await UsersService.delete(userId);
      
      // Atualizar estado local
      setUsers(prev => prev.filter(u => u.id !== userId));
      setProjects(prevProjects => prevProjects.map(p => ({
        ...p,
        team: p.team.filter(tm => tm.user.id !== userId),
        tasks: p.tasks.map(t => 
          t.assignee?.id === userId 
            ? { ...t, assignee: reassignToUser, assignee_id: reassignToUserId || null }
            : t
        )
      })));

      console.log('✅ [AUDIT] Usuário excluído com sucesso');
    } catch (err) {
      console.error('❌ [AUDIT] Erro ao deletar usuário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users, projects, profile]);

  const addUserToProject = useCallback(async (projectId: string, userId: string, role: TeamMember['role']) => {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    try {
      setLoading(true);
      await TeamService.addMember({ project_id: projectId, user_id: userId, role });
      
      setProjects(prev => prev.map(p => {
        if (p.id === projectId && !p.team.some(tm => tm.user.id === userId)) {
          return { ...p, team: [...p.team, { user, role }] };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao adicionar usuário ao projeto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users]);

  const removeUserFromProject = useCallback(async (projectId: string, userId: string) => {
    try {
      setLoading(true);
      await TeamService.removeMember(projectId, userId);
      
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, team: p.team.filter(tm => tm.user.id !== userId) };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao remover usuário do projeto:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTeamMemberRole = useCallback(async (projectId: string, userId: string, role: TeamMember['role']) => {
    try {
      setLoading(true);
      await TeamService.updateMemberRole(projectId, userId, role);
      
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, team: p.team.map(tm => tm.user.id === userId ? { ...tm, role } : tm) };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao atualizar role do membro:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFile = useCallback(async (projectId: string, file: File) => {
    try {
      setLoading(true);
      
      // Upload do arquivo para o Supabase Storage
      const fileUrl = await AttachmentsService.uploadFile('project-files', file, projectId);
      
      // Criar registro no banco
      const dbAttachment = await AttachmentsService.create({
        project_id: projectId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploaded_by: profile?.id || '',
      });

      const newFile = mapAttachment(dbAttachment);

      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, files: [...p.files, newFile] };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao adicionar arquivo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const deleteFile = useCallback(async (fileId: string, projectId: string) => {
    try {
      setLoading(true);
      
      // Deletar do Supabase Storage e banco
      await AttachmentsService.delete(fileId);

      // Atualizar estado local
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, files: p.files.filter(f => f.id !== fileId) };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao deletar arquivo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = useCallback(async (messageData: Omit<Message, 'id' | 'sender' | 'isRead'>) => {
    const sender = users.find(u => u.id === messageData.sender_id);
    if (!sender) throw new Error("Sender not found");
    
    try {
      setLoading(true);
      
      const dbMessage = await MessagesService.create({
        sender_id: messageData.sender_id,
        channel: messageData.channel,
        content: messageData.content,
      });

      const newMessage: Message = {
        ...mapMessage(dbMessage),
        sender,
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('Erro ao adicionar mensagem:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [users]);

  const logNotification = useCallback(async (projectId: string, type: 'email' | 'whatsapp') => {
    try {
      if (type === 'email') {
        await ProjectsService.updateEmailNotification(projectId);
      } else {
        await ProjectsService.updateWhatsappNotification(projectId);
      }

      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const now = new Date().toISOString();
          if (type === 'email') return { ...p, lastEmailNotification: now };
          if (type === 'whatsapp') return { ...p, lastWhatsappNotification: now };
        }
        return p;
      }));
    } catch (err) {
      console.error('Erro ao registrar notificação:', err);
      throw err;
    }
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
    // Módulos que são apenas de visualização (sem funcionalidade de edição)
    const VIEW_ONLY_MODULES = ['dashboard', 'schedule', 'reports', 'notifications'];
    
    setRolePermissions(prev => {
      const updated = { ...prev[role] };
      PERMISSION_MODULES.forEach(module => {
        const isViewOnly = VIEW_ONLY_MODULES.includes(module.id);
        
        if (selection === 'todos') {
          // Para módulos VIEW_ONLY, adiciona apenas visualizar
          updated[module.id] = isViewOnly ? ['visualizar'] : ['visualizar', 'editar'];
        } else if (selection === 'nenhum') {
          updated[module.id] = [];
        } else if (selection === 'editar') {
          // Para módulos VIEW_ONLY, adiciona apenas visualizar
          updated[module.id] = isViewOnly ? ['visualizar'] : ['visualizar', 'editar'];
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

      // Atualizar no banco de dados
      UsersService.update(userId, { role: unmapGlobalRole(role) }).catch(err => {
        console.error('Erro ao atualizar role do usuário:', err);
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
    deleteFile,
    addMessage,
    logNotification,
    refreshData,
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

