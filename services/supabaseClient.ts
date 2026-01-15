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
// Função validateAndCleanStorage removida para evitar conflitos com o gerenciamento de sessão do Supabase

// Cliente Supabase tipado com as definições do banco de dados
// Configurações para aumentar timeout e melhorar performance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
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
