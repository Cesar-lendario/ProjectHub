import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { User, GlobalRole } from '../types';
import { mapUser } from '../services/api/mappers';

interface AuthContextType {
  session: Session | null;
  profile: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, role: GlobalRole) => Promise<{ error: AuthError | { message: string } | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setSession(session);
          if (session?.user) {
            const { data: userProfile, error } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is a valid state during signup
              throw error;
            }
            
            // Usar mapUser para garantir que o role seja convertido corretamente
            // e sobrescrever o e-mail com o do Auth (fonte da verdade)
            if (userProfile) {
              const mapped = mapUser(userProfile);
              const authEmail = session.user.email ?? mapped.email;
              setProfile({ ...mapped, email: authEmail });
            } else {
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  const signInWithEmail = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: GlobalRole) => {
    // A inserção do perfil do usuário agora é tratada por um gatilho no banco de dados.
    // Apenas passamos os dados do usuário nos metadados.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    return { error };
  };
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const updateProfile = (updatedUser: User) => {
    setProfile(updatedUser);
  };

  const value: AuthContextType = {
    session,
    profile,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};