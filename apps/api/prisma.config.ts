import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// The monorepo keeps one .env at the root; docker compose reads the same file.
// A local apps/api/.env, when present, wins over it.
config({ path: '../../.env' });
config({ path: '.env', override: true });

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	datasource: {
		url: env('DATABASE_URL'),
	},
});
