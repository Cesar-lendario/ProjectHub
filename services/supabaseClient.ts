import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = 'https://siujbzskkmjxipcablao.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWpienNra21qeGlwY2FibGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTUyNjgsImV4cCI6MjA3ODM5MTI2OH0.TVJ_7RHPOQhZBQkykHcZOzCF5MQj7pIY-_rxxJ9XqGI';

// Detectar se está em produção ou desenvolvimento
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

console.log('[Supabase] 🌐 Ambiente:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
console.log('[Supabase] 🌐 Hostname:', window.location.hostname);
console.log('[Supabase] 🔗 URL:', supabaseUrl);

// Sistema de detecção e limpeza de storage corrompido
function validateAndCleanStorage() {
  try {
    const authKey = 'taskmeet-auth-token';
    const storedAuth = localStorage.getItem(authKey);
    
    if (storedAuth) {
      try {
        // Tentar parsear o token armazenado
        const parsed = JSON.parse(storedAuth);
        
        // Verificar se tem a estrutura esperada
        if (!parsed || typeof parsed !== 'object') {
          console.warn('[Supabase] ⚠️ Token com estrutura inválida, limpando...');
          localStorage.removeItem(authKey);
          return false;
        }
        
        // Verificar se o token não está expirado há muito tempo
        if (parsed.expires_at) {
          const expiresAt = parsed.expires_at * 1000; // Converter para ms
          const now = Date.now();
          const hoursSinceExpiry = (now - expiresAt) / (1000 * 60 * 60);
          
          // Se expirou há mais de 24 horas, limpar
          if (hoursSinceExpiry > 24) {
            console.warn('[Supabase] ⚠️ Token expirado há', Math.floor(hoursSinceExpiry), 'horas, limpando...');
            localStorage.removeItem(authKey);
            return false;
          }
        }
        
        console.log('[Supabase] ✅ Token válido no storage');
        return true;
      } catch (parseError) {
        console.error('[Supabase] ❌ Erro ao parsear token, limpando...', parseError);
        localStorage.removeItem(authKey);
        return false;
      }
    } else {
      console.log('[Supabase] ℹ️ Nenhum token armazenado');
      return true; // Não há token, mas está OK
    }
  } catch (error) {
    console.error('[Supabase] ❌ Erro ao validar storage:', error);
    return false;
  }
}

// Executar validação antes de criar o cliente
validateAndCleanStorage();

// Cliente Supabase tipado com as definições do banco de dados
// Configurações para aumentar timeout e melhorar performance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // CRÍTICO: Renovar token automaticamente
    detectSessionInUrl: true,
    // Usar localStorage em vez de cookies para compatibilidade
    storage: window.localStorage,
    // Configurar domínio de cookie para produção
    storageKey: 'taskmeet-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js/2.45.0',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Sistema de keep-alive: Fazer ping preventivo a cada 1 minuto
// Isso mantém a conexão ativa e previne timeout quando inativo
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

const startKeepAlive = () => {
  // Limpar interval anterior se existir
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  keepAliveInterval = setInterval(async () => {
    try {
      // Verificar se há sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const expiresIn = session.expires_at ? session.expires_at - Math.floor(Date.now() / 1000) : 0;
        
        // Se o token expira em menos de 15 minutos, renovar
        if (expiresIn < 900 && expiresIn > 0) {
          console.log('[Supabase KeepAlive] 🔄 Renovando token preventivamente (expira em ' + Math.floor(expiresIn / 60) + 'min)...');
          
          const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('[Supabase KeepAlive] ❌ Erro ao renovar token:', error);
          } else if (newSession) {
            console.log('[Supabase KeepAlive] ✅ Token renovado com sucesso');
          }
        } else if (expiresIn > 0) {
          console.log('[Supabase KeepAlive] ✓ Token OK (expira em ' + Math.floor(expiresIn / 60) + 'min)');
        }
      }
    } catch (error) {
      console.error('[Supabase KeepAlive] ❌ Erro no keep-alive:', error);
    }
  }, 60000); // A cada 1 MINUTO
  
  console.log('[Supabase KeepAlive] ✅ Sistema keep-alive iniciado (check a cada 1 minuto)');
};

// Iniciar keep-alive quando o módulo for carregado
startKeepAlive();

// Reiniciar keep-alive quando a janela voltar ao foco (usuário voltou à aba)
window.addEventListener('focus', () => {
  console.log('[Supabase KeepAlive] 👁️ Janela em foco, verificando sessão...');
  startKeepAlive();
});

// Fazer refresh imediato quando usuário voltar de inatividade
let lastActivityCheck = Date.now();
window.addEventListener('visibilitychange', async () => {
  if (!document.hidden) {
    const inactiveTime = Date.now() - lastActivityCheck;
    const inactiveMinutes = Math.floor(inactiveTime / 60000);
    
    if (inactiveMinutes >= 5) {
      console.log('[Supabase KeepAlive] ⚠️ Usuário voltou após ' + inactiveMinutes + ' minutos, renovando sessão...');
      
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        
        if (!error && session) {
          console.log('[Supabase KeepAlive] ✅ Sessão renovada após inatividade');
        }
      } catch (error) {
        console.error('[Supabase KeepAlive] ❌ Erro ao renovar após inatividade:', error);
      }
    }
  }
  
  lastActivityCheck = Date.now();
});
