import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export const ProjectsService = {
  // Buscar todos os projetos com suas equipes
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_team (
          role,
          user_id,
          user:user_id (*)
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Buscar projeto por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_team (
          role,
          user_id,
          user:user_id (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar novo projeto
  async create(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar projeto
  async update(id: string, project: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...project, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar projeto
  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Atualizar última notificação de email
  async updateEmailNotification(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .update({ 
        last_email_notification: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  },

  // Atualizar última notificação de WhatsApp
  async updateWhatsappNotification(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .update({ 
        last_whatsapp_notification: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  },
};

