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
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let hasCompletedInitialLoad = false; // Flag para evitar múltiplos carregamentos
    
    const loadInitialSession = async () => {
      try {
        console.log('[useAuth] 🔄 Carregando sessão inicial...');
        console.log('[useAuth] 🌐 Hostname:', window.location.hostname);
        console.log('[useAuth] 🔑 localStorage disponível:', !!window.localStorage);
        console.log('[useAuth] 📊 Estado atual - loading:', loading, 'hasCompletedInitialLoad:', hasCompletedInitialLoad);
        
        // Verificar se há token no localStorage
        const storageKey = 'taskmeet-auth-token';
        let storedAuth: string | null = null;
        
        try {
          storedAuth = localStorage.getItem(storageKey);
          
          // Validar se o token não está corrompido
          if (storedAuth) {
            try {
              const parsed = JSON.parse(storedAuth);
              
              // Verificar estrutura básica
              if (!parsed || typeof parsed !== 'object') {
                console.warn('[useAuth] ⚠️ Token corrompido, limpando...');
                localStorage.removeItem(storageKey);
                storedAuth = null;
              } else {
                console.log('[useAuth] 💾 Token no localStorage: ✅ Encontrado e válido');
              }
            } catch (parseError) {
              console.error('[useAuth] ❌ Erro ao parsear token, limpando...', parseError);
              localStorage.removeItem(storageKey);
              storedAuth = null;
            }
          } else {
            console.log('[useAuth] 💾 Token no localStorage: ❌ Não encontrado');
          }
        } catch (storageError) {
          console.error('[useAuth] ❌ Erro ao acessar localStorage:', storageError);
          storedAuth = null;
        }
        
        setLoading(true);
        
        // Timeout de segurança: se não carregar em 8 segundos, forçar loading = false
        timeoutId = setTimeout(() => {
          if (isMounted && !hasCompletedInitialLoad) {
            console.warn('[useAuth] ⚠️ Timeout ao carregar sessão inicial (8s)');
            console.warn('[useAuth] 🧹 Limpando possível sessão corrompida...');
            
            // Limpar localStorage do Supabase
            try {
              const storageKey = 'taskmeet-auth-token';
              localStorage.removeItem(storageKey);
              console.log('[useAuth] ✅ Storage limpo após timeout');
            } catch (cleanupError) {
              console.error('[useAuth] ❌ Erro ao limpar storage:', cleanupError);
            }
            
            hasCompletedInitialLoad = true;
            setSession(null);
            setProfile(null);
            setLoading(false);
          }
        }, 8000);
        
        // Buscar sessão atual explicitamente
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[useAuth] ❌ Erro ao buscar sessão:', sessionError);
          if (isMounted) {
            setSession(null);
            setProfile(null);
            hasCompletedInitialLoad = true;
            setLoading(false);
          }
          return;
        }
        
        console.log('[useAuth] 📝 Sessão inicial obtida:', initialSession ? '✅ Sessão encontrada' : '❌ Sem sessão');
        
        if (isMounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            try {
              console.log('[useAuth] 👤 Buscando perfil do usuário...');
              const { data: userProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', initialSession.user.id)
                .single();

              if (error && error.code !== 'PGRST116') {
                console.error('[useAuth] ❌ Erro ao buscar perfil:', error);
                throw error;
              }
              
              if (userProfile) {
                console.log('[useAuth] ✅ Perfil encontrado:', userProfile.full_name);
                const mapped = mapUser(userProfile);
                const authEmail = initialSession.user.email ?? mapped.email;
                if (isMounted) {
                  setProfile({ ...mapped, email: authEmail });
                }
              } else {
                console.log('[useAuth] ⚠️ Perfil não encontrado');
                if (isMounted) {
                  setProfile(null);
                }
              }
            } catch (error) {
              console.error('[useAuth] ❌ Erro ao processar perfil:', error);
              if (isMounted) {
                setProfile(null);
              }
            }
          } else {
            console.log('[useAuth] ℹ️ Sem usuário na sessão');
            if (isMounted) {
              setProfile(null);
            }
          }
          
          if (isMounted && timeoutId) {
            clearTimeout(timeoutId);
            hasCompletedInitialLoad = true;
            setLoading(false);
            console.log('[useAuth] ✅ Carregamento inicial concluído');
          }
        }
      } catch (error) {
        console.error('[useAuth] ❌ Erro crítico ao carregar sessão:', error);
        if (isMounted) {
          setSession(null);
          setProfile(null);
          hasCompletedInitialLoad = true;
          setLoading(false);
        }
      }
    };
    
    // Carregar sessão inicial
    loadInitialSession();
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        // Se já completou o carregamento inicial e for apenas um TOKEN_REFRESHED, ignorar
        if (hasCompletedInitialLoad && _event === 'TOKEN_REFRESHED') {
          console.log('[useAuth] ℹ️ TOKEN_REFRESHED ignorado (já carregado)');
          return;
        }
        
        try {
          console.log('[useAuth] 🔔 Mudança de estado de autenticação:', _event);
          console.log('[useAuth] 📊 hasCompletedInitialLoad:', hasCompletedInitialLoad);
          
          // Sempre limpar timeout ao receber evento de autenticação
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          
          setSession(session);
          
          if (session?.user) {
            try {
              console.log('[useAuth] 👤 Buscando perfil do usuário (onAuthStateChange)...');
              const { data: userProfile, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', session.user.id)
                .single();

              if (error && error.code !== 'PGRST116') {
                console.error('[useAuth] ❌ Erro ao buscar perfil:', error);
                throw error;
              }
              
              if (userProfile) {
                console.log('[useAuth] ✅ Perfil encontrado (onAuthStateChange):', userProfile.full_name);
                const mapped = mapUser(userProfile);
                const authEmail = session.user.email ?? mapped.email;
                if (isMounted) {
                  setProfile({ ...mapped, email: authEmail });
                }
              } else {
                console.log('[useAuth] ⚠️ Perfil não encontrado (onAuthStateChange)');
                if (isMounted) {
                  setProfile(null);
                }
              }
            } catch (error) {
              console.error('[useAuth] ❌ Erro ao processar perfil:', error);
              if (isMounted) {
                setProfile(null);
              }
            }
          } else {
            console.log('[useAuth] ℹ️ Sem usuário na sessão (onAuthStateChange)');
            if (isMounted) {
              setProfile(null);
            }
          }
        } catch (error) {
          console.error('[useAuth] ❌ Erro ao processar mudança de autenticação:', error);
          if (isMounted) {
            setProfile(null);
          }
        } finally {
          // CRÍTICO: Sempre definir loading=false após processar evento
          // Isso inclui TOKEN_REFRESHED, SIGNED_IN, SIGNED_OUT, etc.
          if (isMounted) {
            hasCompletedInitialLoad = true;
            console.log('[useAuth] ✅ Evento processado, definindo loading=false');
            setLoading(false);
          }
        }
      }
    );

    // Monitoramento agressivo de sessão: verificar a cada 30 SEGUNDOS
    const sessionCheckInterval = setInterval(async () => {
      if (!isMounted) return;
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.expires_at) {
          const expiresIn = currentSession.expires_at - Math.floor(Date.now() / 1000);
          
          // Se o token expira em menos de 10 minutos, fazer refresh preventivo (MAIS AGRESSIVO)
          if (expiresIn < 600 && expiresIn > 0) {
            console.log('[useAuth] 🔄 Token próximo de expirar (' + expiresIn + 's), fazendo refresh preventivo...');
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('[useAuth] ❌ Erro ao fazer refresh preventivo:', refreshError);
              // Se falhar refresh, tentar novamente em 10 segundos
              setTimeout(async () => {
                if (isMounted) {
                  console.log('[useAuth] 🔄 Tentando refresh novamente...');
                  const retry = await supabase.auth.refreshSession();
                  if (retry.data?.session && isMounted) {
                    setSession(retry.data.session);
                    console.log('[useAuth] ✅ Token atualizado na segunda tentativa');
                  }
                }
              }, 10000);
            } else if (refreshedSession) {
              console.log('[useAuth] ✅ Token atualizado preventivamente');
              if (isMounted) {
                setSession(refreshedSession);
              }
            }
          } else if (expiresIn <= 0) {
            console.warn('[useAuth] ⚠️ Token já expirado!');
            // Token expirado, limpar sessão
            if (isMounted) {
              setSession(null);
              setProfile(null);
            }
          }
        }
      } catch (error) {
        console.error('[useAuth] ❌ Erro ao verificar sessão:', error);
      }
    }, 30000); // Verificar a cada 30 SEGUNDOS (mais agressivo)
    
    // Detectar inatividade do usuário e fazer refresh preventivo
    let lastActivityTime = Date.now();
    let inactivityCheckInterval: ReturnType<typeof setInterval> | null = null;
    
    const updateActivity = () => {
      lastActivityTime = Date.now();
    };
    
    // Eventos que indicam atividade do usuário
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, true);
    });
    
    // Verificar inatividade a cada 30 segundos
    inactivityCheckInterval = setInterval(async () => {
      if (!isMounted) return;
      
      const inactiveTime = Date.now() - lastActivityTime;
      const inactiveMinutes = Math.floor(inactiveTime / 60000);
      
      // Se ficou inativo por mais de 2 minutos, fazer refresh preventivo
      if (inactiveMinutes >= 2) {
        console.log('[useAuth] ⏰ Usuário inativo por', inactiveMinutes, 'minutos, fazendo refresh preventivo...');
        try {
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
          
          if (!error && refreshedSession && isMounted) {
            setSession(refreshedSession);
            console.log('[useAuth] ✅ Sessão renovada após inatividade');
          }
        } catch (error) {
          console.error('[useAuth] ❌ Erro ao renovar sessão após inatividade:', error);
        }
        
        // Resetar tempo de atividade
        lastActivityTime = Date.now();
      }
    }, 30000);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.unsubscribe();
      clearInterval(sessionCheckInterval);
      
      // Limpar interval de inatividade
      if (inactivityCheckInterval) {
        clearInterval(inactivityCheckInterval);
      }
      
      // Remover event listeners de atividade
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity, true);
      });
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