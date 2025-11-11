import { supabase } from '../supabaseClient';
import { Database } from '../../types/database.types';

type AttachmentRow = Database['public']['Tables']['attachments']['Row'];
type AttachmentInsert = Database['public']['Tables']['attachments']['Insert'];

export const AttachmentsService = {
  // Buscar anexos por projeto
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Buscar anexos por tarefa
  async getByTask(taskId: string) {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Criar novo anexo
  async create(attachment: AttachmentInsert) {
    const { data, error } = await supabase
      .from('attachments')
      .insert(attachment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar anexo
  async delete(id: string) {
    // Primeiro busca o anexo para pegar a URL do storage
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Remove do storage se for URL do Supabase
    if (attachment.url.includes('supabase.co/storage')) {
      const path = attachment.url.split('/storage/v1/object/public/')[1];
      if (path) {
        const [bucket, ...filePath] = path.split('/');
        await supabase.storage.from(bucket).remove([filePath.join('/')]);
      }
    }

    // Remove do banco
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Upload de arquivo para storage
  async uploadFile(bucket: string, file: File, projectId: string) {
    const filePath = `${projectId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};

