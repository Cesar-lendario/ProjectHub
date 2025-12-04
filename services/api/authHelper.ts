import { supabase } from '../supabaseClient';

/**
 * Helper para obter o token de autenticação válido do Supabase
 * Garante que o token está atualizado antes de fazer requisições
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    console.log('[authHelper] 🔑 Obtendo token de autenticação...');
    
    // Obter sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[authHelper] ❌ Erro ao obter sessão:', sessionError);
      return null;
    }
    
    if (!session) {
      console.warn('[authHelper] ⚠️ Nenhuma sessão encontrada');
      return null;
    }
    
    // Verificar se o token está próximo de expirar (menos de 5 minutos)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
      console.log('[authHelper] ⏰ Token expira em:', expiresIn, 'segundos');
      
      // Se o token expira em menos de 5 minutos, tentar refresh
      if (expiresIn < 300) {
        console.log('[authHelper] 🔄 Token próximo de expirar, tentando refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[authHelper] ❌ Erro ao fazer refresh do token:', refreshError);
          // Retornar token atual mesmo com erro, pode ainda funcionar
        } else if (refreshedSession) {
          console.log('[authHelper] ✅ Token atualizado com sucesso');
          return refreshedSession.access_token;
        }
      }
    }
    
    const token = session.access_token;
    console.log('[authHelper] ✅ Token obtido:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  } catch (error) {
    console.error('[authHelper] ❌ Erro crítico ao obter token:', error);
    return null;
  }
}

/**
 * Helper para fazer requisições fetch autenticadas ao Supabase
 * Automaticamente adiciona o token de autenticação válido
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const supabaseUrl = 'https://siujbzskkmjxipcablao.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWpienNra21qeGlwY2FibGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTUyNjgsImV4cCI6MjA3ODM5MTI2OH0.TVJ_7RHPOQhZBQkykHcZOzCF5MQj7pIY-_rxxJ9XqGI';
  
  // Obter token válido
  const token = await getAuthToken();
  
  // Preparar headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    ...options.headers,
  };
  
  // Adicionar token de autenticação se disponível
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[authHelper] 🔐 Requisição autenticada com token do usuário');
  } else {
    // Fallback para anon key se não houver token
    headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
    console.warn('[authHelper] ⚠️ Usando anon key (sem token de usuário)');
  }
  
  // Fazer requisição
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Se receber 401 (Unauthorized), tentar refresh e retry uma vez
  if (response.status === 401 && token) {
    console.log('[authHelper] 🔄 Token expirado, tentando refresh e retry...');
    
    // Forçar refresh
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (!refreshError && refreshedSession) {
      console.log('[authHelper] ✅ Token atualizado, retentando requisição...');
      
      // Retry com novo token
      const retryHeaders: HeadersInit = {
        ...headers,
        'Authorization': `Bearer ${refreshedSession.access_token}`,
      };
      
      return fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      console.error('[authHelper] ❌ Falha ao fazer refresh do token:', refreshError);
    }
  }
  
  return response;
}


