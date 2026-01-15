import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type ProjectNoteRow = Database['public']['Tables']['project_notes']['Row'];
type ProjectNoteInsert = Database['public']['Tables']['project_notes']['Insert'];
type ProjectNoteUpdate = Database['public']['Tables']['project_notes']['Update'];

export const NotesService = {
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
    // Primeiro, tentar encontrar uma nota existente
    const existingNote = await this.getByProject(projectId);
    
    if (existingNote) {
      // Atualizar nota existente
      return this.update(existingNote.id, { note_text: noteText });
    } else {
      // Criar nova nota
      return this.create({
        project_id: projectId,
        note_text: noteText,
        created_by: createdBy,
      });
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
