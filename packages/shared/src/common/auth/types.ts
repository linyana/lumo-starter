import type { z } from 'zod';
import type { authResultSchema, loginSchema, registerSchema } from './schema';

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type AuthResult = z.infer<typeof authResultSchema>;
