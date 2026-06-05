import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
    },
    build: {
        rollupOptions: {
            output: {
                // Split heavy, independently-cacheable vendors out of the main bundle.
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
                    'vendor-charts': ['recharts'],
                    'vendor-maps': ['leaflet', 'react-leaflet'],
                    'vendor-markdown': ['react-markdown', 'dompurify'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-table': ['@tanstack/react-table'],
                },
            },
        },
    },
});
