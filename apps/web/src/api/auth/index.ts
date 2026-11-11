import type { AuthResult, LoginInput, RegisterInput, User } from '@lumo/shared';
import { api, http } from '@/lib';

const login = (input: LoginInput): Promise<AuthResult> => api.post<AuthResult>('/auth/login', input);

const register = (input: RegisterInput): Promise<AuthResult> =>
	api.post<AuthResult>('/auth/register', input);

/** The account behind a token, for a tab that holds one but has not cached the user yet. */
const me = (): Promise<User> => api.get<{ user: User }>('/auth/me').then((payload) => payload.user);

/** 204 No Content — the envelope is skipped on the server for this route. */
const logout = (): Promise<void> => http.post('/auth/logout').then(() => undefined);

/**
 * Verbs rather than a resource, because that is what a session is: a login is not a thing anyone
 * lists or patches. The reload path is `refreshSession` in `lib/http` and not a fifth entry here —
 * it trades the cookie for a pair of tokens before any of this is reachable.
 */
export const authApi = { login, register, me, logout };
