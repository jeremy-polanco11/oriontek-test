/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Vitest config — runs independently of Webpack (Vitest has its own bundler).
 * - jsdom for DOM-flavored tests (RTL needs window/document).
 * - alias `@` mirrors tsconfig paths so imports resolve identically to Webpack.
 * - react plugin for JSX inside tests.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/features/**',
        'src/utils/**',
        'src/components/**',
        'src/services/**',
      ],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/types.ts', 'src/test/**'],
    },
  },
});
