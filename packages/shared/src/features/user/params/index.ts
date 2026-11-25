import { z } from 'zod';

export const userParamsSchema = z.object({
	id: z.uuid({ error: 'Not a valid user id' }),
});
