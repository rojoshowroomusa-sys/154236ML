import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('--- BUILD ENVIRONMENT DEBUG ---');
  console.log('Available process.env keys:', Object.keys(process.env).filter(k => k.startsWith('VITE_')));
  console.log('Available loadEnv keys:', Object.keys(env).filter(k => k.startsWith('VITE_')));
  console.log('-------------------------------');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || ''),
    },
    server: {
      // Disabled HMR and file watching to prevent automatic restarts
      hmr: false,
      watch: null,
    },
  };
});
