import { z } from 'zod';

export const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	JWT_ACCESS_SECRET: z.string().min(32),
	API_DELAY_MS: z.coerce.number().int().min(0).default(0),
	SYNC_PERMISSION_CATALOG: z.enum(['on', 'off']).default('on'),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (raw: Record<string, unknown>): Env => {
	const parsed = envSchema.safeParse(raw);
	if (parsed.success) return parsed.data;

	const details = parsed.error.issues
		.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
		.join('\n');
	throw new Error(`Invalid environment variables:\n${details}`);
};
