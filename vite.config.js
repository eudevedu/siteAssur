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

          // GrapesJS e plugins — chunk isolado, carregado APENAS no admin/pages/editor
          // Graças aos dynamic imports no GrapesEditor.jsx, este chunk nunca é
          // baixado por visitantes do site público.
          if (
            id.includes('grapesjs')
          ) {
            return 'grapesjs';
          }

          // Tiptap + ProseMirror (deps internas do Tiptap) — editor de posts/projetos
          if (id.includes('@tiptap') || id.includes('tiptap') || id.includes('prosemirror')) {
            return 'tiptap';
          }

          // Supabase — cliente de dados, separado do resto
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase';
          }

          // Lucide icons — tree-shakeable mas grande; chunk separado
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }

          // React e TODAS as bibliotecas que dependem de React ficam no vendor.
          // NÃO separar react, react-dom, react-router-dom ou react-* em chunks
          // distintos — causam erros de "createContext of undefined" por ordem
          // de carregamento não garantida entre chunks paralelos.
        },
      },
    },
  },
})
