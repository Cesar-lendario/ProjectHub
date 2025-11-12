import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const UsersService = {
  // Buscar todos os usuários
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Buscar usuário por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar usuário por auth_id (vinculado ao Supabase Auth)
  async getByAuthId(authId: string) {
    const { data, error} = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar novo usuário
  async create(user: UserInsert) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar usuário
  async update(id: string, user: UserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar usuário
  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

