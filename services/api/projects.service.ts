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
      .order('atualizado_at', { ascending: false });

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

  // Criar novo projeto usando fetch direto (contorna bug do Supabase JS)
  async create(project: ProjectInsert) {
    console.log('ProjectsService.create - Dados enviados:', project);
    console.log('ProjectsService.create - Tamanho do email:', project.cliente_email?.length || 0);
    console.log('ProjectsService.create - Usando fetch direto...');
    
    try {
      const supabaseUrl = 'https://siujbzskkmjxipcablao.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWpienNra21qeGlwY2FibGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTUyNjgsImV4cCI6MjA3ODM5MTI2OH0.TVJ_7RHPOQhZBQkykHcZOzCF5MQj7pIY-_rxxJ9XqGI';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          p_name: project.name,
          p_description: project.description,
          p_start_date: project.start_date,
          p_end_date: project.end_date,
          p_status: project.status || 'planning',
          p_project_type: project.project_type,
          p_client_name: project.client_name,
          p_cliente_email: project.cliente_email,
          p_created_by: project.created_by
        })
      });

      console.log('ProjectsService.create - Fetch concluído, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ProjectsService.create - Erro HTTP:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('ProjectsService.create - Data:', data);

      // RPC retorna array, pegar o primeiro item
      const projectData = Array.isArray(data) ? data[0] : data;
      
      console.log('ProjectsService.create - Projeto criado com sucesso!');
      return projectData;
    } catch (err) {
      console.error('ProjectsService.create - ERRO:', err);
      throw err;
    }
  },

  // Atualizar projeto usando RPC (contorna bug do Supabase JS com emails longos)
  async update(id: string, project: ProjectUpdate) {
    console.log('ProjectsService.update - ID:', id);
    console.log('ProjectsService.update - Dados enviados:', project);
    console.log('ProjectsService.update - Tamanho do email:', project.cliente_email?.length || 0);
    console.log('ProjectsService.update - Usando RPC para atualizar projeto...');
    
    try {
      const supabaseUrl = 'https://siujbzskkmjxipcablao.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWpienNra21qeGlwY2FibGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTUyNjgsImV4cCI6MjA3ODM5MTI2OH0.TVJ_7RHPOQhZBQkykHcZOzCF5MQj7pIY-_rxxJ9XqGI';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/update_project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          p_id: id,
          p_name: project.name!,
          p_description: project.description!,
          p_start_date: project.start_date!,
          p_end_date: project.end_date!,
          p_status: project.status!,
          p_project_type: project.project_type!,
          p_client_name: project.client_name!,
          p_cliente_email: project.cliente_email!
        })
      });

      console.log('ProjectsService.update - RPC concluído');
      console.log('ProjectsService.update - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ProjectsService.update - Erro HTTP:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('ProjectsService.update - Data:', data);
      
      // RPC retorna array, pegar o primeiro item
      const projectData = Array.isArray(data) ? data[0] : data;
      
      console.log('ProjectsService.update - Projeto atualizado com sucesso!');
      return projectData;
    } catch (err) {
      console.error('ProjectsService.update - ERRO:', err);
      throw err;
    }
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
        last_email_notification: new Date().toISOString()
        // atualizado_at é atualizado automaticamente pelo trigger
      })
      .eq('id', projectId);

    if (error) throw error;
  },

  // Atualizar última notificação de WhatsApp
  async updateWhatsappNotification(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .update({ 
        last_whatsapp_notification: new Date().toISOString()
        // atualizado_at é atualizado automaticamente pelo trigger
      })
      .eq('id', projectId);

    if (error) throw error;
  },
};

