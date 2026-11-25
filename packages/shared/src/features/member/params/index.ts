import { z } from 'zod';

export const memberParamsSchema = z.object({
	id: z.uuid({ error: 'Not a valid member id' }),
});
