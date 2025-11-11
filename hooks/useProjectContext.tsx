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

  const fetchProjects = async () => {
    // Queries are made explicit to tell Supabase exactly how tables are related, avoiding ambiguity.
    const { data, error } = await supabase.from('projects').select(`
        id, name, description, startDate, endDate, status, projectType, budget, actualCost, clientName, clientEmail, lastEmailNotification, lastWhatsappNotification,
        project_team!project_id(users!user_id(id, name, avatar)),
        tasks!project_id(*, assignee:users!assignee_id(id, name, avatar)),
        files:attachments!project_id(*)
      `).order('startDate', { ascending: false });
      
      if (error) {
        handleError(error, 'fetchProjects');
        return [];
      }
      
      // Mapping is made more robust to handle cases where related data might be null.
      return data.map((p: any) => {
        const { project_team, ...rest } = p;
        return {
          ...rest,
          team: project_team ? project_team.map((pt: any) => pt.users).filter(Boolean) : [],
          tasks: p.tasks || [],
          files: p.files || [],
        };
      });
  };
  
  const fetchInitialData = async () => {
    setState(s => ({ ...s, loading: true }));
    const [projectsData, usersData, messagesData] = await Promise.all([
      fetchProjects(),
      supabase.from('users').select('*').order('name'),
      supabase.from('messages').select('*, sender:users!sender_id(*)').order('timestamp')
    ]);

    if (usersData.error) handleError(usersData.error, 'fetchUsers');
    if (messagesData.error) handleError(messagesData.error, 'fetchMessages');
    
    setState({
        projects: projectsData || [],
        users: usersData.data || [],
        messages: (messagesData.data || []).map((m: any) => ({...m, sender: m.sender || null })),
        loading: false
    });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const refreshProjects = async () => {
      const projectsData = await fetchProjects();
      setState(s => ({ ...s, projects: projectsData }));
  };

  const logNotification = async (projectId: string, type: 'email' | 'whatsapp') => {
    const fieldToUpdate = type === 'email' ? 'lastEmailNotification' : 'lastWhatsappNotification';
    const { error } = await supabase
      .from('projects')
      .update({ [fieldToUpdate]: new Date().toISOString() })
      .eq('id', projectId);
    
    if (error) handleError(error, 'logNotification');
    else await refreshProjects();
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    const { team, ...projectData } = project;
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
        const defaultTasks = taskNames.map(name => ({
            name, status: TaskStatus.ToDo, priority: TaskPriority.Medium, dueDate: newProject.endDate, duration: 1, project_id: newProject.id,
            description: '', assignee_id: null, dependencies: [], comments: [], attachments: [],
        }));
        const { error: tasksError } = await supabase.from('tasks').insert(defaultTasks);
        if (tasksError) handleError(tasksError, 'addProject tasks');
    }

    await refreshProjects();
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
     await refreshProjects();
  };

  const deleteProject = async (projectId: string) => {
    // Supabase cascade delete should handle related items (tasks, team, files)
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) handleError(error, 'deleteProject');
    else setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== projectId) }));
  };
  
  const addTask = async (projectId: string, task: Omit<Task, 'id'>) => {
    const { assignee, ...taskData } = task;
    const { error } = await supabase.from('tasks').insert({ ...taskData, project_id: projectId, assignee_id: assignee?.id || null });
    if(error) handleError(error, 'addTask');
    else await refreshProjects();
  };

  const updateTask = async (projectId: string, updatedTask: Task) => {
    const { assignee, ...taskData } = updatedTask;
    const { error } = await supabase.from('tasks').update({ ...taskData, assignee_id: assignee?.id || null }).eq('id', updatedTask.id);
    if(error) handleError(error, 'updateTask');
    else await refreshProjects();
  };

  const deleteTask = async (projectId: string, taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if(error) handleError(error, 'deleteTask');
    else await refreshProjects();
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    const { error } = await supabase.from('users').insert(user);
    if(error) handleError(error, 'addUser');
    else {
        const {data} = await supabase.from('users').select('*').order('name');
        setState(s => ({ ...s, users: data || s.users }));
    }
  };

  const updateUser = async (updatedUser: User) => {
    const { error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    if(error) handleError(error, 'updateUser');
    else await fetchInitialData(); // refetch all to update relations
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if(error) handleError(error, 'deleteUser');
    else await fetchInitialData();
  };

  const addFile = async (projectId: string, file: Omit<Attachment, 'id'>) => {
    // In a real app, this would upload to Supabase Storage and save the URL.
    // For now, we just save the metadata.
    const { error } = await supabase.from('attachments').insert({ ...file, project_id: projectId });
    if (error) handleError(error, 'addFile');
    else await refreshProjects();
  };

  const deleteFile = async (projectId: string, fileId: string) => {
    const { error } = await supabase.from('attachments').delete().eq('id', fileId);
    if (error) handleError(error, 'deleteFile');
    else await refreshProjects();
  };

  const addMessage = async (message: Omit<Message, 'id' | 'isRead'>) => {
    const { sender, ...messageData } = message;
    const { error } = await supabase.from('messages').insert({ ...messageData, sender_id: sender.id, isRead: false });
    if (error) handleError(error, 'addMessage');
    else {
        // Optimistic update for better UX
        const newMessage = { ...message, id: `temp-${Date.now()}`, isRead: true };
        setState(s => ({ ...s, messages: [...s.messages, newMessage]}));
        // Could refetch messages here for consistency if needed
    }
  };

  const markAllMessagesAsRead = async () => {
    const unreadIds = state.messages.filter(m => !m.isRead).map(m => m.id);
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