import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';
import { authenticatedFetch } from './authHelper';

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
    console.log('[TasksService.create] 🔄 Iniciando criação de tarefa...', { task });
    
    try {
      // Verificar token antes de fazer requisição
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[TasksService.create] ❌ Nenhuma sessão encontrada');
        throw new Error('Sessão expirada. Por favor, recarregue a página.');
      }
      
      const expiresIn = session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 0;
      console.log('[TasksService.create] 🔑 Token válido, expira em:', expiresIn, 'segundos');
      
      // Se token próximo de expirar, fazer refresh preventivo
      if (expiresIn < 300 && expiresIn > 0) {
        console.log('[TasksService.create] 🔄 Token próximo de expirar, fazendo refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('[TasksService.create] ❌ Erro ao fazer refresh:', refreshError);
        } else if (refreshedSession) {
          console.log('[TasksService.create] ✅ Token atualizado');
        }
      }
      
      const startTime = Date.now();
      console.log('[TasksService.create] 📤 Enviando requisição ao Supabase...');
      
      // Criar uma Promise com timeout
      const createPromise = supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      // Timeout de 25 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: A requisição demorou mais de 25 segundos. Verifique sua conexão.'));
        }, 25000);
      });
      
      const { data, error } = await Promise.race([createPromise, timeoutPromise]) as any;
      
      const duration = Date.now() - startTime;
      console.log('[TasksService.create] ⏱️ Requisição concluída em', duration, 'ms');
      
      if (error) {
        console.error('[TasksService.create] ❌ Erro do Supabase:', error);
        
        // Tratamento específico para erros de autenticação
        if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('expired')) {
          throw new Error('Sessão expirada. Por favor, recarregue a página.');
        }
        
        throw error;
      }
      
      console.log('[TasksService.create] ✅ Tarefa criada com sucesso');
      return data;
    } catch (err) {
      console.error('[TasksService.create] ❌ ERRO CRÍTICO:', err);
      throw err;
    }
  },

  // Atualizar tarefa
  async update(id: string, task: TaskUpdate) {
    console.log('[TasksService.update] 🔄 Iniciando atualização de tarefa...', { id, task });
    
    try {
      // Verificar token antes de fazer requisição
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[TasksService.update] ❌ Nenhuma sessão encontrada');
        throw new Error('Sessão expirada. Por favor, recarregue a página.');
      }
      
      const expiresIn = session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 0;
      console.log('[TasksService.update] 🔑 Token válido, expira em:', expiresIn, 'segundos');
      
      // Se token próximo de expirar, fazer refresh preventivo
      if (expiresIn < 300 && expiresIn > 0) {
        console.log('[TasksService.update] 🔄 Token próximo de expirar, fazendo refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('[TasksService.update] ❌ Erro ao fazer refresh:', refreshError);
        } else if (refreshedSession) {
          console.log('[TasksService.update] ✅ Token atualizado');
        }
      }
      
      const startTime = Date.now();
      console.log('[TasksService.update] 📤 Enviando requisição ao Supabase...');
      
      // Criar uma Promise com timeout
      const updatePromise = supabase
        .from('tasks')
        .update({ ...task, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      // Timeout de 25 segundos (menor que o timeout do TaskForm de 30s)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: A requisição demorou mais de 25 segundos. Verifique sua conexão.'));
        }, 25000);
      });
      
      const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;
      
      const duration = Date.now() - startTime;
      console.log('[TasksService.update] ⏱️ Requisição concluída em', duration, 'ms');
      
      if (error) {
        console.error('[TasksService.update] ❌ Erro do Supabase:', error);
        
        // Tratamento específico para erros de autenticação
        if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('expired')) {
          throw new Error('Sessão expirada. Por favor, recarregue a página.');
        }
        
        throw error;
      }
      
      console.log('[TasksService.update] ✅ Tarefa atualizada com sucesso');
      return data;
    } catch (err) {
      console.error('[TasksService.update] ❌ ERRO CRÍTICO:', err);
      throw err;
    }
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
    console.log('[TasksService.createBulk] 📝 Criando', tasks.length, 'tarefas...');
    
    try {
      const supabaseUrl = 'https://siujbzskkmjxipcablao.supabase.co';
      
      const response = await authenticatedFetch(`${supabaseUrl}/rest/v1/tasks`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(tasks)
      });

      console.log('[TasksService.createBulk] ✅ Fetch concluído, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TasksService.createBulk] ❌ Erro HTTP:', response.status, errorText);
        
        // Tratamento específico para erros de autenticação
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, recarregue a página.');
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[TasksService.createBulk] ✅ Tarefas criadas:', data.length);
      
      return data;
    } catch (err) {
      console.error('[TasksService.createBulk] ❌ ERRO:', err);
      throw err;
    }
  },
};

