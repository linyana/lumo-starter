import type { z } from 'zod';
import type { listUsersQuerySchema, updateUserSchema, userSchema } from './schema';

export type User = z.infer<typeof userSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
