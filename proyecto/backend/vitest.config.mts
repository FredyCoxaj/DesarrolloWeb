import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Resolución nativa de paths de TypeScript (reemplaza al plugin)
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    environment: 'node',
  },
});