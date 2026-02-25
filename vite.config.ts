import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/services': path.resolve(__dirname, './src/services')
    }
  },
  server: {
    port: 3004,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        frame: path.resolve(__dirname, 'test-frame.html')
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd'],
          'echarts-vendor': ['echarts', 'echarts-for-react']
        }
      }
    }
  }
})
