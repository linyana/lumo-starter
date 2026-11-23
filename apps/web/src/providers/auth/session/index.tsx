import {
	filterAccess,
	grantFor,
	type LoginInput,
	type Permission,
	type RegisterInput,
	type User,
	type WithAccess,
} from '@lumo/shared';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { authApi } from '@/api';
import { onUnauthorized, refreshSession, setAccessToken } from '@/lib';
import { AccessProvider } from '@/providers/access';

type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'unreachable';

type AuthContextValue = {
	user: User | null;
	status: AuthStatus;
	login: (input: LoginInput) => Promise<void>;
	register: (input: RegisterInput) => Promise<void>;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
	can: (permission: Permission) => boolean;
	filter: <T extends WithAccess>(items: readonly T[]) => T[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState<AuthStatus>('loading');

	const refresh = useCallback(async () => {
		setStatus('loading');

		const outcome = await refreshSession();

		if (outcome.status === 'refreshed') {
			setUser(outcome.result.user);
			setStatus('authenticated');
		} else {
			setStatus(outcome.status === 'expired' ? 'anonymous' : 'unreachable');
		}
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	useEffect(() => {
		onUnauthorized(() => {
			setUser(null);
			setStatus('anonymous');
		});
	}, []);

	const adopt = useCallback((result: { accessToken: string; user: User }) => {
		setAccessToken(result.accessToken);
		setUser(result.user);
		setStatus('authenticated');
	}, []);

	const login = useCallback(
		async (input: LoginInput) => {
			adopt(await authApi.login(input));
		},
		[adopt],
	);

	const register = useCallback(
		async (input: RegisterInput) => {
			adopt(await authApi.register(input));
		},
		[adopt],
	);

	const logout = useCallback(async () => {
		try {
			await authApi.logout();
		} finally {
			setAccessToken(null);
			setUser(null);
			setStatus('anonymous');
		}
	}, []);

	const grant = useMemo(() => grantFor(user?.roles ?? []), [user]);

	const can = useCallback(
		(permission: Permission) => grant.permissions.includes(permission),
		[grant],
	);

	const filter = useCallback(
		<T extends WithAccess>(items: readonly T[]) => filterAccess({ items, grant }),
		[grant],
	);

	const value = useMemo<AuthContextValue>(
		() => ({ user, status, login, register, logout, refresh, can, filter }),
		[user, status, login, register, logout, refresh, can, filter],
	);

	return (
		<AuthContext.Provider value={value}>
			<AccessProvider grant={grant}>{children}</AccessProvider>
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextValue => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
	return context;
};
