// Tipos gerados baseados nas tabelas do Supabase
// Database: TaskMeet

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string | null;
          function: string | null;
          role: 'admin' | 'supervisor' | 'engineer';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar?: string | null;
          function?: string | null;
          role?: 'admin' | 'supervisor' | 'engineer';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string | null;
          function?: string | null;
          role?: 'admin' | 'supervisor' | 'engineer';
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          start_date: string;
          end_date: string;
          status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          project_type: 'homologacao' | 'renovacao_cct' | 'outros';
          client_name: string;
          cliente_email: string;
          created_by: string | null;
          last_email_notification: string | null;
          last_whatsapp_notification: string | null;
          created_at: string;
          atualizado_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          start_date: string;
          end_date: string;
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          project_type: 'homologacao' | 'renovacao_cct' | 'outros';
          client_name: string;
          cliente_email: string;
          created_by?: string | null;
          last_email_notification?: string | null;
          last_whatsapp_notification?: string | null;
          created_at?: string;
          atualizado_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          status?: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
          project_type?: 'homologacao' | 'renovacao_cct' | 'outros';
          client_name?: string;
          cliente_email?: string;
          created_by?: string | null;
          last_email_notification?: string | null;
          last_whatsapp_notification?: string | null;
          created_at?: string;
          atualizado_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string;
          status: 'pending' | 'todo' | 'in_progress' | 'done';
          priority: 'low' | 'medium' | 'high';
          due_date: string;
          assignee_id: string | null;
          duration: number;
          dependencies: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description: string;
          status?: 'pending' | 'todo' | 'in_progress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          due_date: string;
          assignee_id?: string | null;
          duration?: number;
          dependencies?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string;
          status?: 'pending' | 'todo' | 'in_progress' | 'done';
          priority?: 'low' | 'medium' | 'high';
          due_date?: string;
          assignee_id?: string | null;
          duration?: number;
          dependencies?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      project_team: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'admin' | 'editor' | 'viewer';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: 'admin' | 'editor' | 'viewer';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: 'admin' | 'editor' | 'viewer';
          created_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          project_id: string;
          task_id: string | null;
          name: string;
          type: string;
          size: number;
          url: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          task_id?: string | null;
          name: string;
          type: string;
          size: number;
          url: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          task_id?: string | null;
          name?: string;
          type?: string;
          size?: number;
          url?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          channel: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          channel: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          channel?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      user_invites: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'supervisor' | 'engineer';
          status: 'pending' | 'accepted' | 'expired';
          invited_by: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'supervisor' | 'engineer';
          status?: 'pending' | 'accepted' | 'expired';
          invited_by?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'supervisor' | 'engineer';
          status?: 'pending' | 'accepted' | 'expired';
          invited_by?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          function: string | null;
          role: 'admin' | 'supervisor' | 'engineer';
          auth_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          function?: string | null;
          role?: 'admin' | 'supervisor' | 'engineer';
          auth_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          function?: string | null;
          role?: 'admin' | 'supervisor' | 'engineer';
          auth_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

