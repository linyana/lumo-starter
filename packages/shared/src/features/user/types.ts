import type { z } from 'zod';
import type { createUserSchema } from './create';
import type { listUsersQuerySchema } from './list';
import type { userParamsSchema } from './params';
import type { batchDeleteUsersSchema } from './remove';
import type { userSchema } from './row';
import type { updateUserSchema } from './update';

export type User = z.infer<typeof userSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export type UserParams = z.infer<typeof userParamsSchema>;

export type BatchDeleteUsersInput = z.infer<typeof batchDeleteUsersSchema>;
