import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: [
          'color-functions',
          'global-builtin',
          'import',
          'if-function',
          'legacy-js-api',
        ],
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
