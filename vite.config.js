import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'PlyerReact',
      fileName: 'plyer-react',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'hls.js', 'dashjs'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'hls.js': 'Hls',
          dashjs: 'dashjs'
        }
      }
    }
  }
});
