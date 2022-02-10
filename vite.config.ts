import { defineConfig } from 'vite';
import { copy } from 'vite-plugin-copy';

export default defineConfig({
  build: {
    assetsDir: './',
    rollupOptions: {
      input: './src/content-script.ts',
      output: {
        format: 'iife',
        dir: './dist',
        entryFileNames: '[name].js',
      },
    },
  },
  plugins: [
    copy([
      { src: './manifest.json', dest: 'dist/' },
    ]) as any,
  ],
});
