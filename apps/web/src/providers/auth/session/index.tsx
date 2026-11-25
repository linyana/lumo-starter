import {
	filterAccess,
	grantOf,
	type AuthResult,
	type Permission,
	type LoginInput,
	type PatchProfileInput,
	type RegisterInput,
	type Session,
	type User,
	type WithAccess,
	type Workspace,
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
	workspace: Workspace | null;
	workspaces: Workspace[];
	permissions: Permission[];
	status: AuthStatus;
	login: (input: LoginInput) => Promise<void>;
	register: (input: RegisterInput) => Promise<void>;
	updateProfile: (input: PatchProfileInput) => Promise<User>;
	switchWorkspace: (workspaceId: string) => Promise<void>;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
	can: (permission: Permission) => boolean;
	filter: <T extends WithAccess>(items: readonly T[]) => T[];
};

const sessionOf = ({
	user,
	permissions,
	workspace,
	workspaces,
}: AuthResult | Session): Session => ({
	user,
	permissions,
	workspace,
	workspaces,
});

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [session, setSession] = useState<Session | null>(null);
	const [status, setStatus] = useState<AuthStatus>('loading');

	const refresh = useCallback(async () => {
		setStatus('loading');

		const outcome = await refreshSession();

		if (outcome.status === 'refreshed') {
			setSession(sessionOf(outcome.result));
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
			setSession(null);
			setStatus('anonymous');
		});
	}, []);

	const adopt = useCallback((result: AuthResult) => {
		setAccessToken(result.accessToken);
		setSession(sessionOf(result));
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

	const updateProfile = useCallback(async (input: PatchProfileInput): Promise<User> => {
		const next = await authApi.updateProfile(input);
		setSession((current) => (current ? { ...current, user: next } : current));
		return next;
	}, []);

	const switchWorkspace = useCallback(
		async (workspaceId: string) => {
			adopt(await authApi.switchWorkspace({ workspaceId }));
		},
		[adopt],
	);

	const logout = useCallback(async () => {
		try {
			await authApi.logout();
		} finally {
			setAccessToken(null);
			setSession(null);
			setStatus('anonymous');
		}
	}, []);

	const user = session?.user ?? null;
	const permissions = useMemo(() => session?.permissions ?? [], [session]);
	const workspace = session?.workspace ?? null;
	const workspaces = useMemo(() => session?.workspaces ?? [], [session]);

	const grant = useMemo(
		() => grantOf({ roles: user?.roles ?? [], permissions: session?.permissions ?? [] }),
		[user, session],
	);

	const can = useCallback(
		(permission: Permission) => grant.permissions.includes(permission),
		[grant],
	);

	const filter = useCallback(
		<T extends WithAccess>(items: readonly T[]) => filterAccess({ items, grant }),
		[grant],
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			workspace,
			workspaces,
			permissions,
			status,
			login,
			register,
			updateProfile,
			switchWorkspace,
			logout,
			refresh,
			can,
			filter,
		}),
		[
			user,
			workspace,
			workspaces,
			permissions,
			status,
			login,
			register,
			updateProfile,
			switchWorkspace,
			logout,
			refresh,
			can,
			filter,
		],
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
