import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        react(),
        checker({
            typescript: true,
            eslint: {
                lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
            },
        }),
    ],
    preview: {
        port: 5000,
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    base: './',
    build: {
        rollupOptions: {
            external: [],
            output: {
                manualChunks: undefined,
            },
        },
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    optimizeDeps: {
        include: ['@mui/system', '@mui/material', '@mui/x-date-pickers'],
    },
});
