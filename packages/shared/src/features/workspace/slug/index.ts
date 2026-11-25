import { z } from 'zod';

export const WORKSPACE_SLUG_RESERVED = [
	'account',
	'api',
	'assets',
	'docs',
	'favicon',
	'health',
	'login',
	'logout',
	'onboarding',
	'register',
	'robots',
	'static',
	'swagger',
] as const;

export const WORKSPACE_SLUG_MIN = 3;

export const WORKSPACE_SLUG_MAX = 32;

const reserved: readonly string[] = WORKSPACE_SLUG_RESERVED;

export const isReservedWorkspaceSlug = (slug: string): boolean => reserved.includes(slug);

export const workspaceSlugSchema = z
	.string({ error: 'Workspace URL is required' })
	.trim()
	.toLowerCase()
	.min(WORKSPACE_SLUG_MIN, {
		error: `Workspace URL must be at least ${WORKSPACE_SLUG_MIN} characters`,
	})
	.max(WORKSPACE_SLUG_MAX, {
		error: `Workspace URL must be at most ${WORKSPACE_SLUG_MAX} characters`,
	})
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		error: 'Workspace URL may only use lowercase letters, numbers and single hyphens',
	})
	.refine((value) => !isReservedWorkspaceSlug(value), {
		error: 'That workspace URL is used by the app itself',
	});
