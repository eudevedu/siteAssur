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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('grapesjs')) {
              return 'grapesjs';
            }
            if (
              id.includes('@tinymce') ||
              id.includes('tinymce') ||
              id.includes('@tiptap') ||
              id.includes('tiptap')
            ) {
              return 'editors';
            }
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'react-core';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})

