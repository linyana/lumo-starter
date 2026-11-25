import { z } from 'zod';

export const accountParamsSchema = z.object({
	id: z.uuid({ error: 'Not a valid account id' }),
});
