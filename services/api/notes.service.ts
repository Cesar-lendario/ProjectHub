import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type ProjectNoteRow = Database['public']['Tables']['project_notes']['Row'];
type ProjectNoteInsert = Database['public']['Tables']['project_notes']['Insert'];
type ProjectNoteUpdate = Database['public']['Tables']['project_notes']['Update'];

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

export const NotesService = {
  // ... (métodos de leitura mantidos iguais) ...
  // Buscar nota por projeto (última nota)
  async getByProject(projectId: string): Promise<ProjectNoteRow | null> {
    const { data, error } = await supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is ok
      throw error;
    }
    return data;
  },

  // Buscar todas as notas de todos os projetos
  async getAll(): Promise<ProjectNoteRow[]> {
    const { data, error } = await supabase
      .from('project_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Buscar notas de múltiplos projetos (uma nota por projeto - a mais recente)
  async getLatestByProjects(projectIds: string[]): Promise<Record<string, ProjectNoteRow>> {
    if (projectIds.length === 0) return {};

    const { data, error } = await supabase
      .from('project_notes')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agrupar por projeto, mantendo apenas a mais recente
    const notesByProject: Record<string, ProjectNoteRow> = {};
    for (const note of data || []) {
      if (!notesByProject[note.project_id]) {
        notesByProject[note.project_id] = note;
      }
    }
    return notesByProject;
  },

  // Criar nova nota
  async create(note: ProjectNoteInsert): Promise<ProjectNoteRow> {
    const { data, error } = await supabase
      .from('project_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar nota
  async update(id: string, note: ProjectNoteUpdate): Promise<ProjectNoteRow> {
    const { data, error } = await supabase
      .from('project_notes')
      .update(note)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Criar ou atualizar nota (upsert baseado em project_id)
  async upsert(projectId: string, noteText: string, createdBy: string): Promise<ProjectNoteRow> {
    try {
      // Verificar sessão antes de qualquer operação
      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await withTimeout(
        sessionPromise,
        5000,
        'Timeout ao verificar sessão.'
      );

      if (!session) {
        throw new Error('Sessão expirada. Por favor, recarregue a página.');
      }

      const expiresIn = session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 0;

      // Refresh preventivo se necessário
      if (expiresIn < 300 && expiresIn > 0) {
        try {
          const refreshPromise = supabase.auth.refreshSession();
          await withTimeout(refreshPromise, 5000, 'Timeout ao renovar sessão.');
        } catch (err) {
          console.warn('[NotesService] Falha/Timeout no refresh preventivo:', err);
        }
      }

      // Primeiro, tentar encontrar uma nota existente
      // Usar a versão da API original, pois `getByProject` já é chamada aqui via `this.getByProject`
      // Mas para garantir timeout no DB operations, seria ideal envolver também

      // Para simplificar, vamos envolver esta lógica inteira do upsert
      const existingNote = await withTimeout(
        this.getByProject(projectId),
        10000,
        'Timeout ao buscar nota existente'
      );

      if (existingNote) {
        // Atualizar nota existente
        return await withTimeout(
          this.update((existingNote as ProjectNoteRow).id, { note_text: noteText }),
          10000,
          'Timeout ao atualizar nota'
        );
      } else {
        // Criar nova nota
        return await withTimeout(
          this.create({
            project_id: projectId,
            note_text: noteText,
            created_by: createdBy,
          }),
          10000,
          'Timeout ao criar nota'
        );
      }
    } catch (error) {
      console.error('[NotesService.upsert] Erro:', error);
      throw error;
    }
  },

  // Deletar nota
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
