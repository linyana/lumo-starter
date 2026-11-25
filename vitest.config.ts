import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const at = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	resolve: {
		alias: { '@lumo/shared': at('./packages/shared/src/index.ts') },
	},
	test: {
		environment: 'node',
		include: ['apps/*/src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
	},
});
