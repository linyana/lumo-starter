import type { AuthResult, LoginInput, RegisterInput, User } from '@lumo/shared';
import { api } from '@/lib';

const login = (input: LoginInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/login', body: input });

const register = (input: RegisterInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/register', body: input });

/** The account behind a token, for a tab that holds one but has not cached the user yet. */
const me = (): Promise<User> =>
	api.get<{ user: User }>({ url: '/auth/me' }).then((payload) => payload.user);

/** Answered `204`: the session is over, and the server has nothing to say about it. */
const logout = (): Promise<void> => api.send({ method: 'post', url: '/auth/logout' });

/**
 * Verbs rather than a resource, because that is what a session is: a login is not a thing anyone
 * lists or patches. The reload path is `refreshSession` in `lib/http` and not a fifth entry here —
 * it trades the cookie for a pair of tokens before any of this is reachable.
 */
export const authApi = { login, register, me, logout };
