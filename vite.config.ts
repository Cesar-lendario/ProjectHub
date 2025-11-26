import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 600,
        // Forçar geração de hashes únicos para evitar problemas de cache
        rollupOptions: {
          output: {
            // Garantir que todos os arquivos tenham hash único
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            manualChunks: {
              react: ['react', 'react-dom'],
              recharts: ['recharts'],
              supabase: ['@supabase/supabase-js'],
              ai: ['openai'],
              utils: ['marked', 'uuid']
            }
          }
        },
        // Desabilitar minificação em dev para facilitar debug
        minify: mode === 'production' ? 'esbuild' : false,
        // Source maps desabilitados para evitar erros de parse
        // O erro "installHook.js.map" indica problema com source maps
        sourcemap: false,
      }
    };
});
