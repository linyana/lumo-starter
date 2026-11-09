import type { AuthResult, LoginInput, RegisterInput, User } from '@lumo/shared';
import { api, http } from '@/lib';

export const loginRequest = (input: LoginInput): Promise<AuthResult> =>
	api.post<AuthResult>('/auth/login', input);

export const registerRequest = (input: RegisterInput): Promise<AuthResult> =>
	api.post<AuthResult>('/auth/register', input);

export const meRequest = (): Promise<User> =>
	api.get<{ user: User }>('/auth/me').then((payload) => payload.user);

/** 204 No Content — the envelope is skipped on the server for this route. */
export const logoutRequest = (): Promise<void> => http.post('/auth/logout').then(() => undefined);
