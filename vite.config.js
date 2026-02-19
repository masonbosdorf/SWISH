import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// @ts-ignore
import { viteSingleFile } from 'vite-plugin-singlefile';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), viteSingleFile()],
    build: {
        assetsInlineLimit: 100000000, // Inline everything
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
});
