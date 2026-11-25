import { z } from 'zod';

const BATCH_MAX = 100;

export const batchDeleteUsersSchema = z.object({
	ids: z
		.array(z.uuid({ error: 'Not a valid user id' }))
		.min(1, { error: 'Send at least one id to delete' })
		.max(BATCH_MAX, { error: `Delete at most ${BATCH_MAX} accounts at a time` }),
});
