import type { z } from 'zod';
import type {
	batchDeleteUsersSchema,
	createUserSchema,
	listUsersQuerySchema,
	updateUserSchema,
	userParamsSchema,
	userSchema,
} from './schema';

export type User = z.infer<typeof userSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export type UserParams = z.infer<typeof userParamsSchema>;

export type BatchDeleteUsersInput = z.infer<typeof batchDeleteUsersSchema>;
