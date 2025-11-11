import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Project, User, Task, Message, Attachment, TeamMember } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

interface AppState {
  projects: Project[];
  users: User[];
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  projects: [],
  users: [],
  messages: [],
  loading: true,
  error: null,
};

interface ProjectContextType extends AppState {
  fetchAllData: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'team' | 'tasks' | 'files' | 'actualCost'>) => Promise<void>;
  updateProject: (project: Omit<Project, 'team' | 'tasks' | 'files'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id'|'assignee'|'comments'|'attachments'>) => Promise<void>;
  updateTask: (task: Omit<Task, 'assignee'|'comments'|'attachments'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addUserToProject: (projectId: string, userId: string, role: TeamMember['role']) => Promise<void>;
  removeUserFromProject: (projectId: string, userId: string) => Promise<void>;
  updateTeamMemberRole: (projectId: string, userId: string, role: TeamMember['role']) => Promise<void>;
  getProjectRole: (projectId: string) => TeamMember['role'] | null;
  addMessage: (message: Omit<Message, 'id' | 'sender' | 'isRead'>) => Promise<void>;
  markAllMessagesAsRead: () => void;
  addFile: (projectId: string, file: File) => Promise<void>;
  logNotification: (projectId: string, type: 'email' | 'whatsapp') => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const { session, profile } = useAuth();

  const fetchAllData = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [
        { data: users, error: usersError },
        { data: projectsData, error: projectsError },
        { data: tasksData, error: tasksError },
        { data: filesData, error: filesError },
        { data: teamData, error: teamError },
        { data: messagesData, error: messagesError }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('attachments').select('*'),
        supabase.from('project_team').select('*'),
        supabase.from('messages').select('*')
      ]);

      if (usersError) throw usersError;
      if (projectsError) throw projectsError;
      if (tasksError) throw tasksError;
      if (filesError) throw filesError;
      if (teamError) throw teamError;
      if (messagesError) throw messagesError;
      
      const usersMap = new Map(users.map(u => [u.id, u]));

      const projects: Project[] = projectsData.map((p: any) => ({
        ...p,
        tasks: tasksData
          .filter(t => t.project_id === p.id)
          .map((t: any) => ({
            ...t,
            assignee: t.assignee_id ? usersMap.get(t.assignee_id) : null,
          })),
        files: filesData.filter(f => f.project_id === p.id),
        team: teamData
          .filter(pt => pt.project_id === p.id)
          .map((pt: any) => ({
            user: usersMap.get(pt.user_id),
            role: pt.role,
          }))
          .filter(tm => tm.user), // Filter out entries where user might be missing
      }));

      const messages: Message[] = messagesData.map((m: any) => ({
        ...m,
        sender: m.sender_id ? usersMap.get(m.sender_id) : null,
      }));

      setState({
        projects,
        users,
        messages,
        loading: false,
        error: null,
      });

    } catch (err: any) {
      console.error("Failed to fetch data", err);
      let displayError = 'Ocorreu um erro desconhecido ao buscar os dados.';
      if (err && typeof err === 'object') {
          if ('message' in err) displayError = err.message as string;
          if ('details' in err && err.details) displayError += ` (${err.details})`;
      } else if (typeof err === 'string') {
          displayError = err;
      }
      setState(s => ({ ...s, loading: false, error: `Erro ao carregar dados: ${displayError}` }));
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAllData();
    } else {
      setState(initialState);
    }
  }, [session, fetchAllData]);

  const addProject = async (project: Omit<Project, 'id' | 'team' | 'tasks' | 'files' | 'actualCost'>) => {
    const { data, error } = await supabase.from('projects').insert([project]).select();
    if (error) throw error;
    if (data && profile) {
      // Add creator as project admin
      await addUserToProject(data[0].id, profile.id, 'admin');
    }
    await fetchAllData();
  };

  const updateProject = async (project: Omit<Project, 'team' | 'tasks' | 'files'>) => {
    const { error } = await supabase.from('projects').update(project).eq('id', project.id);
    if (error) throw error;
    await fetchAllData();
  };
  
  const addTask = async (task: Omit<Task, 'id'|'assignee'|'comments'|'attachments'>) => {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
    await fetchAllData();
  };

  const updateTask = async (task: Omit<Task, 'assignee'|'comments'|'attachments'>) => {
    const { id, ...updateData } = task;
    const { error } = await supabase.from('tasks').update(updateData).eq('id', id);
    if (error) throw error;
    await fetchAllData();
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
    await fetchAllData();
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    // This is for global admins managing users. Signup is separate.
    const { error } = await supabase.from('users').insert([user]);
    if (error) throw error;
    await fetchAllData();
  };

  const updateUser = async (user: User) => {
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) throw error;
    await fetchAllData();
  };

  const deleteUser = async (userId: string) => {
    // This should be an admin function that calls a Supabase Edge Function to delete auth user.
    // For now, we only delete from public.users table for simplicity.
    console.warn("Apenas o perfil do usuário foi excluído, não o usuário de autenticação. Implemente uma Edge Function para exclusão completa.");
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    await fetchAllData();
  };

  const addUserToProject = async (projectId: string, userId: string, role: TeamMember['role']) => {
    const { error } = await supabase.from('project_team').insert([{ project_id: projectId, user_id: userId, role }]);
    if (error) throw error;
    await fetchAllData();
  };

  const removeUserFromProject = async (projectId: string, userId: string) => {
    const { error } = await supabase.from('project_team').delete().match({ project_id: projectId, user_id: userId });
    if (error) throw error;
    await fetchAllData();
  };

  const updateTeamMemberRole = async (projectId: string, userId: string, role: TeamMember['role']) => {
    const { error } = await supabase.from('project_team').update({ role }).match({ project_id: projectId, user_id: userId });
    if (error) throw error;
    await fetchAllData();
  };

  const getProjectRole = (projectId: string): TeamMember['role'] | null => {
    if (!profile) return null;
    const project = state.projects.find(p => p.id === projectId);
    const teamMember = project?.team.find(tm => tm.user.id === profile.id);
    return teamMember?.role || null;
  };
  
  const addMessage = async (message: Omit<Message, 'id' | 'sender' | 'isRead'>) => {
    const { error } = await supabase.from('messages').insert([message]);
    if (error) throw error;
    await fetchAllData();
  };

  const markAllMessagesAsRead = () => {
    // This is a client-side mock for immediate UI feedback. 
    // A full implementation would update the backend as well.
    setState(s => ({
        ...s,
        messages: s.messages.map(m => ({ ...m, isRead: true }))
    }));
  };

  const addFile = async (projectId: string, file: File) => {
    if (!projectId) throw new Error("O ID do projeto é necessário para o upload do arquivo.");
    // Bucket name is 'attachments', as per SQL policies.
    const bucketName = 'attachments'; 

    const filePath = `${projectId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);
    if (uploadError) throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    const attachmentData = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: urlData.publicUrl,
        lastModified: new Date().toISOString(),
        project_id: projectId
    };

    const { error: insertError } = await supabase.from('attachments').insert([attachmentData]);
    if (insertError) throw insertError;
    
    await fetchAllData();
  };

  const logNotification = async (projectId: string, type: 'email' | 'whatsapp') => {
    const fieldToUpdate = type === 'email' ? 'lastEmailNotification' : 'lastWhatsappNotification';
    const { error } = await supabase
      .from('projects')
      .update({ [fieldToUpdate]: new Date().toISOString() })
      .eq('id', projectId);
    if (error) throw error;
    await fetchAllData();
  };


  const value = {
    ...state,
    fetchAllData,
    addProject,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    addUser,
    updateUser,
    deleteUser,
    addUserToProject,
    removeUserFromProject,
    updateTeamMemberRole,
    getProjectRole,
    addMessage,
    markAllMessagesAsRead,
    addFile,
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
