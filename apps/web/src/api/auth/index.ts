import type {
	AuthResult,
	LoginInput,
	PatchProfileInput,
	RegisterInput,
	Session,
	SwitchWorkspaceInput,
	User,
} from '@lumo/shared';
import { api } from '@/lib';

const login = (input: LoginInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/login', body: input });

const register = (input: RegisterInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/register', body: input });

const me = (): Promise<Session> => api.get<Session>({ url: '/auth/me' });

const updateProfile = (input: PatchProfileInput): Promise<User> =>
	api.patch<{ user: User }>({ url: '/auth/me', body: input }).then((payload) => payload.user);

const switchWorkspace = (input: SwitchWorkspaceInput): Promise<AuthResult> =>
	api.post<AuthResult>({ url: '/auth/switch-workspace', body: input });

const logout = (): Promise<void> => api.send({ method: 'post', url: '/auth/logout' });

export const authApi = { login, register, me, updateProfile, switchWorkspace, logout };
