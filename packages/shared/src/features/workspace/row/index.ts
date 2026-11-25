import { z } from 'zod';

export const workspaceSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
});
