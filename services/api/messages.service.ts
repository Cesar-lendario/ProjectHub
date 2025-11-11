import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type MessageRow = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export const MessagesService = {
  // Buscar mensagens por canal
  async getByChannel(channel: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (*)
      `)
      .eq('channel', channel)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar todas as mensagens
  async getAll() {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Criar nova mensagem
  async create(message: MessageInsert) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marcar mensagem como lida
  async markAsRead(id: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  // Marcar todas as mensagens de um canal como lidas
  async markChannelAsRead(channel: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('channel', channel);

    if (error) throw error;
  },
};

