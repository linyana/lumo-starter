import {
	filterAccess,
	grantFor,
	type LoginInput,
	type PatchProfileInput,
	type Permission,
	type RegisterInput,
	type Account,
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
	account: Account | null;
	status: AuthStatus;
	login: (input: LoginInput) => Promise<void>;
	register: (input: RegisterInput) => Promise<void>;
	updateProfile: (input: PatchProfileInput) => Promise<Account>;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
	can: (permission: Permission) => boolean;
	filter: <T extends WithAccess>(items: readonly T[]) => T[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [account, setAccount] = useState<Account | null>(null);
	const [status, setStatus] = useState<AuthStatus>('loading');

	const refresh = useCallback(async () => {
		setStatus('loading');

		const outcome = await refreshSession();

		if (outcome.status === 'refreshed') {
			setAccount(outcome.result.account);
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
			setAccount(null);
			setStatus('anonymous');
		});
	}, []);

	const adopt = useCallback((result: { accessToken: string; account: Account }) => {
		setAccessToken(result.accessToken);
		setAccount(result.account);
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

	const updateProfile = useCallback(async (input: PatchProfileInput): Promise<Account> => {
		const next = await authApi.updateProfile(input);
		setAccount(next);
		return next;
	}, []);

	const logout = useCallback(async () => {
		try {
			await authApi.logout();
		} finally {
			setAccessToken(null);
			setAccount(null);
			setStatus('anonymous');
		}
	}, []);

	const grant = useMemo(() => grantFor(account?.roles ?? []), [account]);

	const can = useCallback(
		(permission: Permission) => grant.permissions.includes(permission),
		[grant],
	);

	const filter = useCallback(
		<T extends WithAccess>(items: readonly T[]) => filterAccess({ items, grant }),
		[grant],
	);

	const value = useMemo<AuthContextValue>(
		() => ({ account, status, login, register, updateProfile, logout, refresh, can, filter }),
		[account, status, login, register, updateProfile, logout, refresh, can, filter],
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
