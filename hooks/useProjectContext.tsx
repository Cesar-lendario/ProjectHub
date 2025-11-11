import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, User, Task, Attachment, Message, ProjectType, TaskStatus, TaskPriority } from '../types';
import { supabase } from '../services/supabaseClient';
import { HOMOLOGACAO_TASK_NAMES, RENOVACAO_CCT_TASK_NAMES } from '../constants';

interface AppState {
  projects: Project[];
  users: User[];
  messages: Message[];
  loading: boolean;
}

interface ProjectContextType extends AppState {
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addTask: (projectId: string, task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (projectId: string, task: Task) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addFile: (projectId: string, file: Omit<Attachment, 'id'>) => Promise<void>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'isRead'>) => Promise<void>;
  markAllMessagesAsRead: () => Promise<void>;
  logNotification: (projectId: string, type: 'email' | 'whatsapp') => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    projects: [],
    users: [],
    messages: [],
    loading: true,
  });

  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    if (typeof error === 'object' && error !== null) {
      console.error(`[Detailed Error in ${context}]: Message: ${error.message}, Details: ${error.details}, Hint: ${error.hint}`);
    }
  };

  const fetchAllData = async () => {
    const [
        projectsRes, usersRes, messagesRes, 
        tasksRes, teamRes, attachmentsRes
    ] = await Promise.all([
        supabase.from('projects').select('*').order('startDate', { ascending: false }),
        supabase.from('users').select('*').order('name'),
        supabase.from('messages').select('*').order('timestamp'),
        supabase.from('tasks').select('*').order('position', { ascending: true, nullsFirst: false }),
        supabase.from('project_team').select('*'),
        supabase.from('attachments').select('*')
    ]);

    if (projectsRes.error) handleError(projectsRes.error, 'fetchProjects');
    if (usersRes.error) handleError(usersRes.error, 'fetchUsers');
    if (messagesRes.error) handleError(messagesRes.error, 'fetchMessages');
    if (tasksRes.error) handleError(tasksRes.error, 'fetchTasks');
    if (teamRes.error) handleError(teamRes.error, 'fetchProjectTeam');
    if (attachmentsRes.error) handleError(attachmentsRes.error, 'fetchAttachments');
    
    const projectsData = projectsRes.data || [];
    const usersData = usersRes.data || [];
    const messagesData = messagesRes.data || [];
    const tasksData = tasksRes.data || [];
    const projectTeamLinks = teamRes.data || [];
    const attachmentsData = attachmentsRes.data || [];
    
    const userMap = new Map(usersData.map(u => [u.id, u as User]));

    const tasksByProjectId = tasksData.reduce((acc, task) => {
        const projectId = (task as any).project_id;
        if (!projectId) return acc;
        if (!acc[projectId]) acc[projectId] = [];
        acc[projectId].push({
            ...(task as Task),
            assignee: (task as any).assignee_id ? userMap.get((task as any).assignee_id) || null : null,
        });
        return acc;
    }, {} as Record<string, Task[]>);

    const teamByProjectId = projectTeamLinks.reduce((acc, link) => {
        const projectId = (link as any).project_id;
        if (!projectId) return acc;
        if (!acc[projectId]) acc[projectId] = [];
        const user = userMap.get((link as any).user_id);
        if (user) acc[projectId].push(user);
        return acc;
    }, {} as Record<string, User[]>);
    
    const attachmentsByProjectId = attachmentsData.reduce((acc, file) => {
        const projectId = (file as any).project_id;
        if (!projectId) return acc;
        if (!acc[projectId]) acc[projectId] = [];
        acc[projectId].push(file as Attachment);
        return acc;
    }, {} as Record<string, Attachment[]>);

    const processedProjects = projectsData.map(p => ({
        ...(p as Project),
        team: teamByProjectId[p.id] || [],
        tasks: tasksByProjectId[p.id] || [],
        files: attachmentsByProjectId[p.id] || [],
    }));

    const processedMessages = messagesData.map(m => ({
        ...(m as Message),
        sender: (m as any).sender_id ? userMap.get((m as any).sender_id) || null : null,
    }));

    setState({
        projects: processedProjects,
        users: usersData as User[],
        messages: processedMessages,
        loading: false
    });
  };

  useEffect(() => {
    setState(s => ({ ...s, loading: true }));
    fetchAllData();
  }, []);

  const logNotification = async (projectId: string, type: 'email' | 'whatsapp') => {
    const fieldToUpdate = type === 'email' ? 'lastEmailNotification' : 'lastWhatsappNotification';
    const { error } = await supabase
      .from('projects')
      .update({ [fieldToUpdate]: new Date().toISOString() })
      .eq('id', projectId);
    
    if (error) handleError(error, 'logNotification');
    else await fetchAllData();
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    const { team, tasks, files, ...projectData } = project;
    const { data: newProject, error } = await supabase.from('projects').insert(projectData).select().single();
    if (error || !newProject) return handleError(error, 'addProject insert');

    if(team.length > 0) {
        const teamLinks = team.map(user => ({ project_id: newProject.id, user_id: user.id }));
        const { error: teamError } = await supabase.from('project_team').insert(teamLinks);
        if (teamError) handleError(teamError, 'addProject team');
    }
    
    let taskNames: string[] = [];
    if (project.projectType === ProjectType.HomologacaoMMV || project.projectType === ProjectType.HomologacaoCE) {
        taskNames = HOMOLOGACAO_TASK_NAMES;
    } else if (project.projectType === ProjectType.RenovacaoCCT) {
        taskNames = RENOVACAO_CCT_TASK_NAMES;
    }
    if (taskNames.length > 0) {
        const defaultTasks = taskNames.map((name, index) => ({
            name,
            description: '',
            status: TaskStatus.ToDo,
            priority: TaskPriority.Medium,
            dueDate: newProject.endDate,
            duration: 1,
            project_id: newProject.id,
            assignee_id: null,
            position: (index + 1) * 1000,
        }));
        const { error: tasksError } = await supabase.from('tasks').insert(defaultTasks);
        if (tasksError) handleError(tasksError, 'addProject tasks');
    }

    await fetchAllData();
  };

  const updateProject = async (updatedProject: Project) => {
     const { team, tasks, files, ...projectData } = updatedProject;
     const { error } = await supabase.from('projects').update(projectData).eq('id', updatedProject.id);
     if (error) return handleError(error, 'updateProject');

     const { error: deleteTeamError } = await supabase.from('project_team').delete().eq('project_id', updatedProject.id);
     if(deleteTeamError) return handleError(deleteTeamError, 'updateProject delete team');

     if (team.length > 0) {
         const teamLinks = team.map(user => ({ project_id: updatedProject.id, user_id: user.id }));
         const { error: insertTeamError } = await supabase.from('project_team').insert(teamLinks);
         if(insertTeamError) handleError(insertTeamError, 'updateProject insert team');
     }
     await fetchAllData();
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) handleError(error, 'deleteProject');
    else await fetchAllData();
  };
  
  const addTask = async (projectId: string, task: Omit<Task, 'id'>) => {
    const { assignee, comments, attachments, ...taskData } = task;
    
    const { data: tasksInColumn } = await supabase.from('tasks').select('position').eq('project_id', projectId).eq('status', task.status).order('position', { ascending: false }).limit(1);
    const maxPosition = tasksInColumn?.[0]?.position || 0;
    const newPosition = maxPosition + 1000;

    const { error } = await supabase.from('tasks').insert({ ...taskData, project_id: projectId, assignee_id: assignee?.id || null, position: newPosition });
    if(error) handleError(error, 'addTask');
    else await fetchAllData();
  };

  const updateTask = async (projectId: string, updatedTask: Task) => {
    const originalProjects = state.projects;

    const newProjects = state.projects.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            };
        }
        return p;
    });
    setState(s => ({ ...s, projects: newProjects }));

    const { assignee, comments, attachments, ...taskData } = updatedTask;

    const { error } = await supabase
        .from('tasks')
        .update({ ...taskData, assignee_id: assignee?.id || null })
        .eq('id', updatedTask.id);

    if (error) {
        handleError(error, 'updateTask');
        setState(s => ({ ...s, projects: originalProjects }));
        alert('Falha ao atualizar a tarefa. A alteração foi desfeita.');
    }
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if(error) handleError(error, 'deleteTask');
    else await fetchAllData();
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    const { error } = await supabase.from('users').insert(user);
    if(error) handleError(error, 'addUser');
    else await fetchAllData();
  };

  const updateUser = async (updatedUser: User) => {
    const { error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    if(error) handleError(error, 'updateUser');
    else await fetchAllData();
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if(error) handleError(error, 'deleteUser');
    else await fetchAllData();
  };

  const addFile = async (projectId: string, file: Omit<Attachment, 'id'>) => {
    const { error } = await supabase.from('attachments').insert({ ...file, project_id: projectId });
    if (error) handleError(error, 'addFile');
    else await fetchAllData();
  };

  const deleteFile = async (projectId: string, fileId: string) => {
    const { error } = await supabase.from('attachments').delete().eq('id', fileId);
    if (error) handleError(error, 'deleteFile');
    else await fetchAllData();
  };

  const addMessage = async (message: Omit<Message, 'id' | 'isRead'>) => {
    const { sender, ...messageData } = message;
    const { error } = await supabase.from('messages').insert({ ...messageData, sender_id: sender.id, isRead: false });
    if (error) handleError(error, 'addMessage');
    else {
        const newMessage: Message = { ...message, id: `temp-${Date.now()}`, isRead: true, sender };
        setState(s => ({ ...s, messages: [...s.messages, newMessage]}));
    }
  };

  const markAllMessagesAsRead = async () => {
    const unreadIds = state.messages.filter(m => !m.isRead && !m.id.startsWith('temp-')).map(m => m.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase.from('messages').update({ isRead: true }).in('id', unreadIds);
    if(error) handleError(error, 'markAllMessagesAsRead');
    else setState(prev => ({ ...prev, messages: prev.messages.map(m => ({ ...m, isRead: true })) }));
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
