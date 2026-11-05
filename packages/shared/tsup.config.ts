import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	target: 'es2022',
	// No `clean` here: `build` passes `--clean` explicitly. Wiping `dist` when the
	// watcher starts would race consumers that are booting against the last build.
	// Build progress is noise in `turbo run dev`; only failures are worth printing.
	silent: true,
	// `development` in package.json exports points consumers at src/ during dev,
	// so the built output only has to be correct for production.
	treeshake: true,
});
