/**
 * Sistema de Monitoramento de Saúde da Aplicação
 * 
 * Este módulo detecta quando o aplicativo está "travado" ou em estado inválido
 * e aciona automaticamente a recuperação sem precisar de Ctrl+Shift+R
 * 
 * PROBLEMAS QUE RESOLVE:
 * 1. Modais que não abrem após inatividade
 * 2. Botões que não respondem após o app ficar parado
 * 3. Estados que ficam "presos" (isLoading=true eternamente)
 * 4. Tokens expirados não detectados
 * 5. Conexões perdidas silenciosamente
 */

import { supabase } from '../services/supabaseClient';

export interface HealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  issues: HealthIssue[];
}

export interface HealthIssue {
  type: 'token_expired' | 'connection_lost' | 'stale_state' | 'memory_leak' | 'timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

class AppHealthMonitor {
  private healthStatus: HealthStatus;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastActivityTime: number;
  private isMonitoring: boolean = false;
  private recoveryCallbacks: Array<() => void> = [];

  constructor() {
    this.healthStatus = {
      isHealthy: true,
      lastCheck: Date.now(),
      issues: []
    };
    this.lastActivityTime = Date.now();
  }

  /**
   * Iniciar monitoramento de saúde
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('[HealthMonitor] ℹ️ Já está monitorando');
      return;
    }

    console.log('[HealthMonitor] 🚀 Iniciando monitoramento de saúde do app');
    this.isMonitoring = true;
    this.lastActivityTime = Date.now();

    // Verificar saúde a cada 30 segundos
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Monitorar atividade do usuário
    this.setupActivityMonitoring();

    // Monitorar visibilidade da página
    this.setupVisibilityMonitoring();

    // Fazer check inicial
    this.performHealthCheck();
  }

  /**
   * Parar monitoramento
   */
  public stopMonitoring(): void {
    console.log('[HealthMonitor] 🛑 Parando monitoramento');
    this.isMonitoring = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Registrar callback de recuperação
   */
  public onRecoveryNeeded(callback: () => void): void {
    this.recoveryCallbacks.push(callback);
  }

  /**
   * Registrar atividade do usuário
   */
  public recordActivity(): void {
    this.lastActivityTime = Date.now();
  }

  /**
   * Obter status de saúde atual
   */
  public getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Verificação de saúde completa
   */
  private async performHealthCheck(): Promise<void> {
    console.log('[HealthMonitor] 🔍 Verificando saúde do app...');
    
    const issues: HealthIssue[] = [];
    const now = Date.now();

    // 1. Verificar token de autenticação
    const tokenIssue = await this.checkAuthToken();
    if (tokenIssue) {
      issues.push(tokenIssue);
    }

    // 2. Verificar conexão com Supabase
    const connectionIssue = await this.checkConnection();
    if (connectionIssue) {
      issues.push(connectionIssue);
    }

    // 3. Verificar se há estados obsoletos (app parado por muito tempo)
    const staleIssue = this.checkStaleState();
    if (staleIssue) {
      issues.push(staleIssue);
    }

    // 4. Verificar uso de memória (detectar possíveis leaks)
    const memoryIssue = this.checkMemoryUsage();
    if (memoryIssue) {
      issues.push(memoryIssue);
    }

    // Atualizar status
    this.healthStatus = {
      isHealthy: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      lastCheck: now,
      issues
    };

    // Log do resultado
    if (this.healthStatus.isHealthy) {
      console.log('[HealthMonitor] ✅ App saudável');
    } else {
      console.warn('[HealthMonitor] ⚠️ Problemas detectados:', issues);
      
      // Se houver problemas críticos, acionar recuperação
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        console.error('[HealthMonitor] 🚨 Problemas críticos detectados!', criticalIssues);
        this.triggerRecovery();
      }
    }
  }

  /**
   * Verificar token de autenticação
   */
  private async checkAuthToken(): Promise<HealthIssue | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return {
          type: 'token_expired',
          severity: 'critical',
          message: `Erro ao verificar sessão: ${error.message}`,
          timestamp: Date.now()
        };
      }

      if (!session) {
        // Sem sessão não é necessariamente um problema (usuário pode não estar logado)
        return null;
      }

      // Verificar se o token está próximo de expirar
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiresIn = expiresAt - Math.floor(Date.now() / 1000);
        
        if (expiresIn <= 0) {
          return {
            type: 'token_expired',
            severity: 'critical',
            message: 'Token de autenticação expirado',
            timestamp: Date.now()
          };
        }

        if (expiresIn < 300) { // Menos de 5 minutos
          return {
            type: 'token_expired',
            severity: 'high',
            message: `Token expira em ${expiresIn} segundos`,
            timestamp: Date.now()
          };
        }
      }

      return null;
    } catch (error) {
      return {
        type: 'token_expired',
        severity: 'critical',
        message: `Erro crítico ao verificar token: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Verificar conexão com Supabase
   */
  private async checkConnection(): Promise<HealthIssue | null> {
    try {
      // Fazer uma query simples para testar conexão
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      const queryPromise = supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();

      await Promise.race([queryPromise, timeoutPromise]);

      return null;
    } catch (error) {
      return {
        type: 'connection_lost',
        severity: 'critical',
        message: `Conexão com servidor perdida: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Verificar se o estado está obsoleto (app parado por muito tempo)
   */
  private checkStaleState(): HealthIssue | null {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivityTime;
    
    // Se passou mais de 10 minutos sem atividade, considerar estado obsoleto
    if (timeSinceActivity > 10 * 60 * 1000) {
      return {
        type: 'stale_state',
        severity: 'high',
        message: `App inativo há ${Math.floor(timeSinceActivity / 60000)} minutos`,
        timestamp: now
      };
    }

    return null;
  }

  /**
   * Verificar uso de memória (simplificado)
   */
  private checkMemoryUsage(): HealthIssue | null {
    if ('performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      const usedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
      const totalMemoryMB = memory.totalJSHeapSize / (1024 * 1024);
      const usagePercent = (usedMemoryMB / totalMemoryMB) * 100;

      // Se usar mais de 90% da memória, pode ter leak
      if (usagePercent > 90) {
        return {
          type: 'memory_leak',
          severity: 'high',
          message: `Uso de memória alto: ${usagePercent.toFixed(1)}%`,
          timestamp: Date.now()
        };
      }
    }

    return null;
  }

  /**
   * Configurar monitoramento de atividade
   */
  private setupActivityMonitoring(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      this.recordActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, activityHandler, { passive: true });
    });
  }

  /**
   * Configurar monitoramento de visibilidade da página
   */
  private setupVisibilityMonitoring(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('[HealthMonitor] 👁️ Página ficou visível, verificando saúde...');
        this.recordActivity();
        this.performHealthCheck();
      } else {
        console.log('[HealthMonitor] 👁️ Página ficou oculta');
      }
    });
  }

  /**
   * Acionar recuperação automática
   */
  private triggerRecovery(): void {
    console.warn('[HealthMonitor] 🔄 Acionando recuperação automática...');
    
    // Notificar callbacks registrados
    this.recoveryCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[HealthMonitor] ❌ Erro ao executar callback de recuperação:', error);
      }
    });
  }

  /**
   * Forçar recuperação manual
   */
  public forceRecovery(): void {
    console.warn('[HealthMonitor] 🔄 Recuperação manual forçada');
    this.triggerRecovery();
  }
}

// Singleton
export const healthMonitor = new AppHealthMonitor();

