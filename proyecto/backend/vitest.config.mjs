"use strict";
import { defineConfig } from 'vitest/config';
export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        globals: true,
        root: './',
        include: ['**/*.spec.ts'],
        environment: 'node',
    },
});
//# sourceMappingURL=vitest.config.mjs.map