import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

export type InviteRow = Database['public']['Tables']['user_invites']['Row'];
type InviteInsert = Database['public']['Tables']['user_invites']['Insert'];
type InviteUpdate = Database['public']['Tables']['user_invites']['Update'];

export const InvitesService = {
  async create(input: { email: string; name: string; role: 'supervisor' | 'engineer'; invited_by: string | null; expires_at: string }): Promise<InviteRow> {
    const payload: InviteInsert = {
      email: input.email,
      name: input.name,
      role: input.role,
      status: 'pending',
      invited_by: input.invited_by,
      expires_at: input.expires_at,
    };

    const { data, error } = await supabase
      .from('user_invites')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data as InviteRow;
  },

  async getById(id: string): Promise<InviteRow | null> {
    const { data, error } = await supabase
      .from('user_invites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const anyError = error as any;
      if (anyError.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as InviteRow;
  },

  async markAccepted(id: string): Promise<void> {
    const updates: InviteUpdate = { status: 'accepted' };

    const { error } = await supabase
      .from('user_invites')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },
};
