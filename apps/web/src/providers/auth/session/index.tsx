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
	hasPermission as sharedHasPermission,
	type LoginInput,
	type Permission,
	type RegisterInput,
	type User,
} from '@lumo/shared';
import { onUnauthorized, refreshSession, setAccessToken } from '@/lib';
import { loginRequest, logoutRequest, registerRequest } from '../api';

type AuthStatus = 'loading' | 'anonymous' | 'authenticated';

type AuthContextValue = {
	user: User | null;
	status: AuthStatus;
	login: (input: LoginInput) => Promise<void>;
	register: (input: RegisterInput) => Promise<void>;
	logout: () => Promise<void>;
	/** Same expression the API guard evaluates — see ROLE_PERMISSIONS in @lumo/shared. */
	can: (permission: Permission) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState<AuthStatus>('loading');

	// A reload has no access token in memory; the httpOnly refresh cookie is the
	// only thing that survives, so the app's first act is trading it for a pair.
	useEffect(() => {
		let cancelled = false;

		void refreshSession().then((result) => {
			if (cancelled) return;
			if (result) {
				setUser(result.user);
				setStatus('authenticated');
			} else {
				setStatus('anonymous');
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

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
			adopt(await loginRequest(input));
		},
		[adopt],
	);

	const register = useCallback(
		async (input: RegisterInput) => {
			adopt(await registerRequest(input));
		},
		[adopt],
	);

	const logout = useCallback(async () => {
		try {
			await logoutRequest();
		} finally {
			// Local state is cleared even if the request failed: the user asked to
			// be signed out, and the cookie path is the server's problem.
			setAccessToken(null);
			setUser(null);
			setStatus('anonymous');
		}
	}, []);

	const can = useCallback(
		(permission: Permission) => (user ? sharedHasPermission(user.roles, permission) : false),
		[user],
	);

	const value = useMemo<AuthContextValue>(
		() => ({ user, status, login, register, logout, can }),
		[user, status, login, register, logout, can],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
	return context;
};
