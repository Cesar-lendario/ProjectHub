import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type ProjectTeamRow = Database['public']['Tables']['project_team']['Row'];
type ProjectTeamInsert = Database['public']['Tables']['project_team']['Insert'];
type ProjectTeamUpdate = Database['public']['Tables']['project_team']['Update'];

export const TeamService = {
  // Buscar equipe de um projeto
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('project_team')
      .select(`
        role,
        user_id,
        project_id,
        user:user_id (*)
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  },

  // Adicionar membro à equipe do projeto
  async addMember(member: ProjectTeamInsert) {
    const { data, error } = await supabase
      .from('project_team')
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar role do membro
  async updateMemberRole(projectId: string, userId: string, role: 'admin' | 'editor' | 'viewer') {
    const { data, error } = await supabase
      .from('project_team')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remover membro da equipe
  async removeMember(projectId: string, userId: string) {
    const { error } = await supabase
      .from('project_team')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Verificar se usuário é membro do projeto
  async isMember(projectId: string, userId: string) {
    const { data, error } = await supabase
      .from('project_team')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora erro de "não encontrado"
    return !!data;
  },
};

