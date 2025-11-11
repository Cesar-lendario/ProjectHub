
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Changed the import path for 'App' to be a relative path.
import App from './App';
import './index.css';

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
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);