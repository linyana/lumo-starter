import { z } from 'zod';

export const roleParamsSchema = z.object({
	id: z.uuid({ error: 'Not a valid role id' }),
});
