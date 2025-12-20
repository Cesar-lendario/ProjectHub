/**
 * Sistema de Recuperação Automática
 * 
 * Quando o app entra em estado inválido, este sistema tenta recuperar
 * sem precisar recarregar a página completamente
 * 
 * RECUPERA DE:
 * - Estados presos (isLoading=true eternamente)
 * - Tokens expirados
 * - Conexões perdidas
 * - Modais que não abrem
 * - Callbacks que não executam
 */

import { supabase } from '../services/supabaseClient';

export interface RecoveryOptions {
  clearLocalStorage?: boolean;
  refreshToken?: boolean;
  resetUIStates?: boolean;
  clearIndexedDB?: boolean;
}

class AutoRecoverySystem {
  private isRecovering: boolean = false;
  private recoveryAttempts: number = 0;
  private lastRecoveryTime: number = 0;
  private maxRecoveryAttempts: number = 3;
  private recoveryCallbacks: Map<string, () => void | Promise<void>> = new Map();

  /**
   * Registrar callback de recuperação
   */
  public registerRecoveryCallback(name: string, callback: () => void | Promise<void>): void {
    console.log(`[AutoRecovery] 📝 Registrando callback: ${name}`);
    this.recoveryCallbacks.set(name, callback);
  }

  /**
   * Remover callback de recuperação
   */
  public unregisterRecoveryCallback(name: string): void {
    console.log(`[AutoRecovery] 🗑️ Removendo callback: ${name}`);
    this.recoveryCallbacks.delete(name);
  }

  /**
   * Tentar recuperação automática
   */
  public async attemptRecovery(options: RecoveryOptions = {}): Promise<boolean> {
    // Prevenir múltiplas recuperações simultâneas
    if (this.isRecovering) {
      console.warn('[AutoRecovery] ⚠️ Recuperação já em andamento');
      return false;
    }

    // Verificar se não estamos fazendo recovery muito frequentemente
    const now = Date.now();
    const timeSinceLastRecovery = now - this.lastRecoveryTime;
    
    if (timeSinceLastRecovery < 10000) { // Menos de 10 segundos desde última recovery
      console.warn('[AutoRecovery] ⚠️ Recovery muito frequente, aguardando...');
      return false;
    }

    // Verificar tentativas
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.error('[AutoRecovery] ❌ Número máximo de tentativas atingido');
      this.showCriticalError();
      return false;
    }

    this.isRecovering = true;
    this.recoveryAttempts++;
    this.lastRecoveryTime = now;

    console.warn('[AutoRecovery] 🔄 Iniciando recuperação automática...');
    console.log('[AutoRecovery] 📊 Tentativa:', this.recoveryAttempts, 'de', this.maxRecoveryAttempts);

    try {
      // Etapa 1: Limpar estados da UI
      if (options.resetUIStates !== false) {
        await this.resetUIStates();
      }

      // Etapa 2: Renovar token se necessário
      if (options.refreshToken !== false) {
        await this.refreshAuthToken();
      }

      // Etapa 3: Limpar storages corrompidos
      if (options.clearLocalStorage) {
        this.cleanLocalStorage();
      }

      if (options.clearIndexedDB) {
        await this.cleanIndexedDB();
      }

      // Etapa 4: Executar callbacks registrados
      await this.executeRecoveryCallbacks();

      // Etapa 5: Verificar se recuperação foi bem-sucedida
      const isSuccessful = await this.verifyRecovery();

      if (isSuccessful) {
        console.log('[AutoRecovery] ✅ Recuperação concluída com sucesso!');
        this.recoveryAttempts = 0; // Reset contador de tentativas
        this.isRecovering = false;
        this.showSuccessNotification();
        return true;
      } else {
        console.warn('[AutoRecovery] ⚠️ Recuperação não foi totalmente bem-sucedida');
        this.isRecovering = false;
        
        // Se falhou e ainda temos tentativas, tentar novamente
        if (this.recoveryAttempts < this.maxRecoveryAttempts) {
          console.log('[AutoRecovery] 🔄 Tentando novamente em 5 segundos...');
          setTimeout(() => {
            this.attemptRecovery(options);
          }, 5000);
        }
        
        return false;
      }
    } catch (error) {
      console.error('[AutoRecovery] ❌ Erro durante recuperação:', error);
      this.isRecovering = false;
      return false;
    }
  }

  /**
   * Resetar estados da UI
   */
  private async resetUIStates(): Promise<void> {
    console.log('[AutoRecovery] 🎨 Resetando estados da UI...');

    // Resetar estados globais conhecidos
    try {
      // Fechar todos os modais
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('button[aria-label="Close"]');
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
        }
      });

      // Limpar tooltips e poppers
      const tooltips = document.querySelectorAll('[role="tooltip"]');
      tooltips.forEach(tooltip => tooltip.remove());

      // Resetar loading spinners presos
      const loadingElements = document.querySelectorAll('[data-loading="true"]');
      loadingElements.forEach(el => {
        el.setAttribute('data-loading', 'false');
      });

      console.log('[AutoRecovery] ✅ Estados da UI resetados');
    } catch (error) {
      console.error('[AutoRecovery] ❌ Erro ao resetar UI:', error);
    }
  }

  /**
   * Renovar token de autenticação
   */
  private async refreshAuthToken(): Promise<void> {
    console.log('[AutoRecovery] 🔑 Renovando token de autenticação...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[AutoRecovery] ❌ Erro ao obter sessão:', sessionError);
        return;
      }

      if (!session) {
        console.log('[AutoRecovery] ℹ️ Sem sessão ativa, skip refresh');
        return;
      }

      // Verificar se o token está expirado ou próximo de expirar
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
        
        if (expiresIn < 300) { // Menos de 5 minutos
          console.log('[AutoRecovery] 🔄 Token próximo de expirar, fazendo refresh...');
          
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('[AutoRecovery] ❌ Erro ao fazer refresh:', refreshError);
          } else if (refreshedSession) {
            console.log('[AutoRecovery] ✅ Token renovado com sucesso');
          }
        } else {
          console.log('[AutoRecovery] ℹ️ Token ainda válido por', expiresIn, 'segundos');
        }
      }
    } catch (error) {
      console.error('[AutoRecovery] ❌ Erro crítico ao renovar token:', error);
    }
  }

  /**
   * Limpar localStorage (mantendo dados essenciais)
   */
  private cleanLocalStorage(): void {
    console.log('[AutoRecovery] 🧹 Limpando localStorage...');

    try {
      // Lista de keys que devem ser preservadas
      const preserveKeys = [
        'app_cache_version',
        'theme', // Preferência de tema
        'user_preferences' // Preferências do usuário
      ];

      // Salvar dados a preservar
      const preserved: Record<string, string | null> = {};
      preserveKeys.forEach(key => {
        preserved[key] = localStorage.getItem(key);
      });

      // Limpar tudo
      localStorage.clear();

      // Restaurar dados preservados
      Object.entries(preserved).forEach(([key, value]) => {
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      });

      console.log('[AutoRecovery] ✅ localStorage limpo (preservando', Object.keys(preserved).length, 'keys)');
    } catch (error) {
      console.error('[AutoRecovery] ❌ Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Limpar IndexedDB (cache do Supabase)
   */
  private async cleanIndexedDB(): Promise<void> {
    console.log('[AutoRecovery] 🗑️ Limpando IndexedDB...');

    try {
      if ('indexedDB' in window) {
        const dbsToDelete = ['supabase-auth', 'supabase-realtime'];
        
        for (const dbName of dbsToDelete) {
          const request = indexedDB.deleteDatabase(dbName);
          
          await new Promise((resolve, reject) => {
            request.onsuccess = () => {
              console.log(`[AutoRecovery] ✅ IndexedDB ${dbName} removido`);
              resolve(true);
            };
            request.onerror = () => {
              console.warn(`[AutoRecovery] ⚠️ Erro ao remover IndexedDB ${dbName}`);
              resolve(false);
            };
            request.onblocked = () => {
              console.warn(`[AutoRecovery] ⚠️ Remoção de IndexedDB ${dbName} bloqueada`);
              resolve(false);
            };
          });
        }
      }
    } catch (error) {
      console.error('[AutoRecovery] ❌ Erro ao limpar IndexedDB:', error);
    }
  }

  /**
   * Executar callbacks de recuperação registrados
   */
  private async executeRecoveryCallbacks(): Promise<void> {
    console.log('[AutoRecovery] 📞 Executando callbacks de recuperação...');
    console.log('[AutoRecovery] 📊 Callbacks registrados:', this.recoveryCallbacks.size);

    for (const [name, callback] of this.recoveryCallbacks.entries()) {
      try {
        console.log(`[AutoRecovery] ▶️ Executando callback: ${name}`);
        await callback();
        console.log(`[AutoRecovery] ✅ Callback ${name} executado`);
      } catch (error) {
        console.error(`[AutoRecovery] ❌ Erro ao executar callback ${name}:`, error);
      }
    }
  }

  /**
   * Verificar se a recuperação foi bem-sucedida
   */
  private async verifyRecovery(): Promise<boolean> {
    console.log('[AutoRecovery] 🔍 Verificando sucesso da recuperação...');

    try {
      // Verificar se podemos fazer uma query simples ao Supabase
      const { error } = await supabase.from('users').select('count').limit(1).single();
      
      if (error && error.code !== 'PGRST116') {
        console.warn('[AutoRecovery] ⚠️ Verificação falhou:', error);
        return false;
      }

      console.log('[AutoRecovery] ✅ Verificação bem-sucedida');
      return true;
    } catch (error) {
      console.error('[AutoRecovery] ❌ Erro na verificação:', error);
      return false;
    }
  }

  /**
   * Mostrar notificação de sucesso
   */
  private showSuccessNotification(): void {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: system-ui, sans-serif;
        animation: slideIn 0.3s ease;
      ">
        ✅ Sistema recuperado com sucesso!
      </div>
    `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Mostrar erro crítico
   */
  private showCriticalError(): void {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        z-index: 10001;
        max-width: 500px;
        text-align: center;
        font-family: system-ui, sans-serif;
      ">
        <h2 style="color: #dc2626; margin: 0 0 16px 0;">⚠️ Erro Crítico</h2>
        <p style="color: #64748b; margin: 0 0 24px 0;">
          O sistema não conseguiu se recuperar automaticamente.
          Por favor, recarregue a página.
        </p>
        <button onclick="window.location.reload()" style="
          background: #4f46e5;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        ">
          🔄 Recarregar Página
        </button>
      </div>
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
      "></div>
    `;

    document.body.appendChild(errorDiv);
  }

  /**
   * Reset do sistema (para usar após reload manual)
   */
  public reset(): void {
    console.log('[AutoRecovery] 🔄 Resetando sistema de recuperação');
    this.isRecovering = false;
    this.recoveryAttempts = 0;
    this.lastRecoveryTime = 0;
  }
}

// Singleton
export const autoRecoverySystem = new AutoRecoverySystem();

