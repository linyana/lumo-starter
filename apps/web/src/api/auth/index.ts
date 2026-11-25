import type {
	AuthResult,
	LoginInput,
	PatchProfileInput,
	RegisterInput,
	Account,
} from '@lumo/shared';
import { api } from '@/lib';

const login = (input: LoginInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/login', body: input });

const register = (input: RegisterInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/register', body: input });

const me = (): Promise<Account> =>
	api.get<{ account: Account }>({ url: '/auth/me' }).then((payload) => payload.account);

const updateProfile = (input: PatchProfileInput): Promise<Account> =>
	api
		.patch<{ account: Account }>({ url: '/auth/me', body: input })
		.then((payload) => payload.account);

const logout = (): Promise<void> => api.send({ method: 'post', url: '/auth/logout' });

export const authApi = { login, register, me, updateProfile, logout };
