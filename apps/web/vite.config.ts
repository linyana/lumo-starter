import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': resolvePath('./src'),
			// Vite resolves the `development` condition, so the web app compiles the
			// shared package straight from source — no rebuild step while editing it.
			'@lumo/shared': resolvePath('../../packages/shared/src/index.ts'),
		},
	},
	server: {
		port: 5173,
		// Same origin in dev: the refresh cookie is set on localhost:5173 and the
		// app never has to deal with CORS or cross-site cookies.
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: false,
			},
		},
		fs: {
			// Allow importing from packages/shared outside the app root.
			allow: [resolvePath('../..')],
		},
	},
});
