import type { z } from 'zod';
import type {
	authResultSchema,
	loginSchema,
	registerSchema,
	sessionSchema,
	switchWorkspaceSchema,
} from './schema';

export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export type SwitchWorkspaceInput = z.infer<typeof switchWorkspaceSchema>;

export type Session = z.infer<typeof sessionSchema>;

export type AuthResult = z.infer<typeof authResultSchema>;
