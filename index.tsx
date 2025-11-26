
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Changed the import path for 'App' to be a relative path.
import App from './App';
import './index.css';

// Ignorar erros de source map que não afetam a funcionalidade
window.addEventListener('error', (event: ErrorEvent) => {
  // Ignorar erros de source map que são comuns e não afetam a aplicação
  const errorMessage = event.message || '';
  const errorSource = event.filename || '';
  
  if (
    errorMessage.includes('source map') ||
    errorMessage.includes('.map') ||
    errorMessage.includes('installHook') ||
    (errorMessage.includes('JSON.parse') && errorSource.includes('.map')) ||
    errorSource.includes('installHook.js.map')
  ) {
    // Silenciar completamente esses erros - não afetam funcionalidade
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Também ignorar erros de promise rejeitadas relacionadas a source maps
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const reason = event.reason?.message || event.reason?.toString() || '';
  if (
    reason.includes('source map') ||
    reason.includes('.map') ||
    reason.includes('installHook')
  ) {
    event.preventDefault();
    return false;
  }
});

if (import.meta.env.DEV) {
  import('./utils/reportWebVitals').then(({ initWebVitals }) => {
    initWebVitals();
  }).catch((error) => {
    console.warn('[WebVitals] Falha ao inicializar métricas.', error);
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Função para garantir que o React está totalmente inicializado
const renderApp = () => {
  try {
    console.log('[index.tsx] Iniciando renderização do App...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[index.tsx] ✅ App renderizado com sucesso');
  } catch (error) {
    console.error('[index.tsx] ❌ Erro ao renderizar App:', error);
    // Mostrar erro na tela se renderização falhar
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h1>Erro ao carregar aplicação</h1>
          <p>Por favor, recarregue a página (Ctrl+Shift+R)</p>
          <pre>${error instanceof Error ? error.message : 'Erro desconhecido'}</pre>
        </div>
      `;
    }
  }
};

// Aguardar DOM estar pronto e garantir inicialização
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  // DOM já está pronto
  renderApp();
}

// Timeout de segurança: se não renderizar em 5 segundos, mostrar erro
setTimeout(() => {
  const rootElement = document.getElementById('root');
  if (rootElement && !rootElement.hasChildNodes()) {
    console.error('[index.tsx] ⚠️ Timeout: App não renderizou em 5 segundos');
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Aplicação demorando para carregar</h1>
        <p>Por favor, recarregue a página (Ctrl+Shift+R)</p>
        <p>Se o problema persistir, verifique o console do navegador (F12)</p>
      </div>
    `;
  }
}, 5000);