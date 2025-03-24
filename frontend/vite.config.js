import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11']
        })
    ],
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
});