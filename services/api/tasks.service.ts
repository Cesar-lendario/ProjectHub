import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const TasksService = {
  // Buscar todas as tarefas
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Buscar tarefas por projeto
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (*)
      `)
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar tarefa por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar nova tarefa
  async create(task: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar tarefa
  async update(id: string, task: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...task, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar tarefa
  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Criar múltiplas tarefas (útil para tarefas padrão) usando fetch direto
  async createBulk(tasks: TaskInsert[]) {
    console.log('TasksService.createBulk - Criando', tasks.length, 'tarefas...');
    
    try {
      const supabaseUrl = 'https://siujbzskkmjxipcablao.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWpienNra21qeGlwY2FibGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTUyNjgsImV4cCI6MjA3ODM5MTI2OH0.TVJ_7RHPOQhZBQkykHcZOzCF5MQj7pIY-_rxxJ9XqGI';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(tasks)
      });

      console.log('TasksService.createBulk - Fetch concluído, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TasksService.createBulk - Erro HTTP:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('TasksService.createBulk - Tarefas criadas:', data.length);
      
      return data;
    } catch (err) {
      console.error('TasksService.createBulk - ERRO:', err);
      throw err;
    }
  },
};

