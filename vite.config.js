import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // GrapesJS e todos os seus plugins — chunk isolado, carregado só no admin/pages
          if (
            id.includes('grapesjs') ||
            id.includes('grapesjs-preset-webpage') ||
            id.includes('grapesjs-blocks-basic') ||
            id.includes('grapesjs-plugin-forms') ||
            id.includes('grapesjs-component-countdown') ||
            id.includes('grapesjs-tabs') ||
            id.includes('grapesjs-custom-code') ||
            id.includes('grapesjs-style-filter')
          ) {
            return 'grapesjs';
          }

          // Tiptap (editor de posts/projetos)
          if (id.includes('@tiptap') || id.includes('tiptap')) {
            return 'tiptap';
          }

          // Supabase — separado do resto do vendor
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase';
          }

          // Lucide icons — separado para evitar import total
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }

          // React + React DOM + React Router — devem ficar no mesmo chunk
          // (react-router depende de React.createContext e não pode carregar antes do React)
          if (
            id.includes('react-dom') ||
            id.includes('/react/') ||
            id.includes('react-router-dom') ||
            id.includes('@remix-run')
          ) {
            return 'react-vendor';
          }

          // Tudo mais vai no vendor genérico
          return 'vendor';
        },
      },
    },
  },
})
