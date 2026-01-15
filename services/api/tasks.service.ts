import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';
import { authenticatedFetch } from './authHelper';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Helper para timeout de promessas
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};

export const TasksService = {
  // ... (métodos de busca mantidos iguais) ...

  // Criar nova tarefa
  async create(task: TaskInsert) {
    console.log('[TasksService.create] 🔄 Iniciando criação de tarefa...', { task });

    try {
      // Verificar token com timeout de 5s
      console.log('[TasksService.create] 🔐 Verificando sessão (timeout 5s)...');
      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await withTimeout(
        sessionPromise,
        5000,
        'Timeout ao verificar sessão. Conexão lenta.'
      );

      if (!session) {
        console.error('[TasksService.create] ❌ Nenhuma sessão encontrada');
        throw new Error('Sessão expirada. Por favor, recarregue a página.');
      }

      const expiresIn = session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 0;
      console.log('[TasksService.create] 🔑 Token válido, expira em:', expiresIn, 'segundos');

      // Se token próximo de expirar, fazer refresh preventivo (timeout 5s)
      if (expiresIn < 300 && expiresIn > 0) {
        console.log('[TasksService.create] 🔄 Token próximo de expirar, fazendo refresh (timeout 5s)...');
        try {
          const refreshPromise = supabase.auth.refreshSession();
          const { data: { session: refreshedSession }, error: refreshError } = await withTimeout(
            refreshPromise,
            5000,
            'Timeout ao renovar sessão.'
          );

          if (refreshError) {
            console.error('[TasksService.create] ❌ Erro ao fazer refresh:', refreshError);
            // Não falhar aqui, tentar usar o token atual
          } else if (refreshedSession) {
            console.log('[TasksService.create] ✅ Token atualizado');
          }
        } catch (err) {
          console.warn('[TasksService.create] ⚠️ Timeout/Erro no refresh preventivo (ignorando):', err);
          // Ignorar erro de refresh e tentar prosseguir com o token atual
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

      // Usar a função auxiliar com timeout de 15s para a query do banco
      const { data, error } = await withTimeout(
        createPromise as any,
        15000,
        'Timeout: A requisição demorou mais de 15 segundos. Possíveis causas:\n\n• Conexão lenta com internet\n• Servidor Supabase sobrecarregado\n• Problema nas regras RLS do banco\n\nTente recarregar a página (Ctrl+Shift+R).'
      ) as any;

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
      // Verificar token com timeout de 5s
      console.log('[TasksService.update] 🔐 Verificando sessão (timeout 5s)...');
      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await withTimeout(
        sessionPromise,
        5000,
        'Timeout ao verificar sessão. Conexão lenta.'
      );

      if (!session) {
        console.error('[TasksService.update] ❌ Nenhuma sessão encontrada');
        throw new Error('Sessão expirada. Por favor, recarregue a página.');
      }

      const expiresIn = session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 0;
      console.log('[TasksService.update] 🔑 Token válido, expira em:', expiresIn, 'segundos');

      // Se token próximo de expirar, fazer refresh preventivo (timeout 5s)
      if (expiresIn < 300 && expiresIn > 0) {
        console.log('[TasksService.update] 🔄 Token próximo de expirar, fazendo refresh (timeout 5s)...');
        try {
          const refreshPromise = supabase.auth.refreshSession();
          const { data: { session: refreshedSession }, error: refreshError } = await withTimeout(
            refreshPromise,
            5000,
            'Timeout ao renovar sessão.'
          );

          if (refreshError) {
            console.error('[TasksService.update] ❌ Erro ao fazer refresh:', refreshError);
          } else if (refreshedSession) {
            console.log('[TasksService.update] ✅ Token atualizado');
          }
        } catch (err) {
          console.warn('[TasksService.update] ⚠️ Timeout/Erro no refresh preventivo (ignorando):', err);
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

      // Usar a função auxiliar com timeout de 15s
      const { data, error } = await withTimeout(
        updatePromise as any,
        15000,
        'Timeout: A requisição demorou mais de 15 segundos. Possíveis causas:\n\n• Conexão lenta com internet\n• Servidor Supabase sobrecarregado\n• Problema nas regras RLS do banco\n\nTente recarregar a página (Ctrl+Shift+R).'
      ) as any;


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

