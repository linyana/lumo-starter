import { z } from 'zod';

/**
 * The only things that differ between machines. Everything else — port, log
 * level, token lifetimes, throttling, cookie security — is a constant in
 * `runtime.ts`, which is also where the reasoning lives.
 */
export const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	JWT_ACCESS_SECRET: z.string().min(32),
	/**
	 * Not a setting, a developer's hand on the throttle: every response is held
	 * back by this many milliseconds so the web app's loading and empty states
	 * can be watched against a slow API. Absent means 0; production ignores it.
	 */
	API_DELAY_MS: z.coerce.number().int().min(0).default(0),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Runs before anything else is constructed: a missing secret stops the process
 * with a readable list instead of failing on the first request.
 */
export const validateEnv = (raw: Record<string, unknown>): Env => {
	const parsed = envSchema.safeParse(raw);
	if (parsed.success) return parsed.data;

	const details = parsed.error.issues
		.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
		.join('\n');
	throw new Error(`Invalid environment variables:\n${details}`);
};
