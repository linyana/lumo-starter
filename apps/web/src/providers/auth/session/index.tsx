import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import {
	filterAccess,
	grantFor,
	type LoginInput,
	type Permission,
	type RegisterInput,
	type User,
	type WithAccess,
} from '@lumo/shared';
import { AccessProvider } from '@/components';
import { onUnauthorized, refreshSession, setAccessToken } from '@/lib';
import { authApi } from '@/api';

type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'unreachable';

type AuthContextValue = {
	user: User | null;
	status: AuthStatus;
	login: (input: LoginInput) => Promise<void>;
	register: (input: RegisterInput) => Promise<void>;
	logout: () => Promise<void>;
	/** Asks the server who this tab is again — what the unreachable screen offers. */
	refresh: () => Promise<void>;
	/** The common case, spelled once: does this session hold that permission? */
	can: (permission: Permission) => boolean;
	/**
	 * The same answer for a list no component draws itself. A table's columns and a menu's rows are
	 * stripped where they are drawn; this is for the arrays that are not.
	 */
	filter: <T extends WithAccess>(items: readonly T[]) => T[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState<AuthStatus>('loading');

	/**
	 * A reload has no access token in memory; the httpOnly refresh cookie is the
	 * only thing that survives, so the app's first act is trading it for a pair.
	 * `refreshSession` reports every failure as an outcome instead of throwing,
	 * which is why the three ended states are all read from one value.
	 */
	const refresh = useCallback(async () => {
		setStatus('loading');

		const outcome = await refreshSession();

		if (outcome.status === 'refreshed') {
			setUser(outcome.result.user);
			setStatus('authenticated');
		} else {
			// Expired: the server rejected the cookie. Unavailable: it did not answer,
			// which says nothing about the session — the guard keeps it, and retries.
			setStatus(outcome.status === 'expired' ? 'anonymous' : 'unreachable');
		}
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	// The http layer gives up on a 401 only once the refresh cookie is gone, so
	// there is nothing to keep: the guards take it from here.
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
			// Local state is cleared even if the request failed: the user asked to
			// be signed out, and the cookie path is the server's problem.
			setAccessToken(null);
			setUser(null);
			setStatus('anonymous');
		}
	}, []);

	/**
	 * Roles are the only fact the token carries, so the grant expands them here, once per session.
	 * `can` and `filter` read it, and `AccessProvider` publishes it to the components that draw a
	 * gated column, row or control — so the one expansion is the one answer.
	 */
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
