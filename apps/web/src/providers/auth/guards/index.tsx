import type { Permission } from '@lumo/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '../session';

export const FullPageLoader = () => (
	<div className="grid min-h-svh place-items-center bg-layout-background">
		<Spinner />
	</div>
);

/**
 * The server did not answer, so the session is *unknown*, not gone. Signing the
 * user out here would throw away a session that may still be valid, so the only
 * honest action is to ask again.
 */
export const SessionUnavailable = () => {
	const { refresh } = useAuth();

	return (
		<div className="grid min-h-svh place-items-center bg-layout-background p-6">
			<div className="max-w-sm space-y-2 text-center">
				<h1 className="text-lg font-semibold">Cannot confirm your session</h1>
				<p className="text-sm text-muted-foreground">
					The server did not answer. Check your connection and try again.
				</p>
				<Button className="mt-2" onClick={() => void refresh()}>
					Try again
				</Button>
			</div>
		</div>
	);
};

/**
 * Checking the session, being signed out and not knowing are three states: the
 * first two take a screen of their own, the third waits for an answer — bouncing
 * a signed-in user to the login page on every reload would be the other mistake.
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
	const { status } = useAuth();
	const location = useLocation();

	if (status === 'loading') return <FullPageLoader />;
	if (status === 'unreachable') return <SessionUnavailable />;
	if (status === 'anonymous') {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return <>{children}</>;
};

/**
 * Hides a route the user cannot reach. This is an affordance, not a security
 * boundary — the same permission is enforced by the API guard.
 */
export const RequirePermission = ({
	permission,
	children,
}: {
	permission: Permission;
	children: ReactNode;
}) => {
	const { can } = useAuth();

	if (!can(permission)) {
		return (
			<div className="grid place-items-center p-12 text-center">
				<div className="max-w-sm space-y-2">
					<h2 className="text-lg font-semibold">Not available</h2>
					<p className="text-sm text-muted-foreground">
						Your role does not include <code className="font-mono">{permission}</code>.
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

/** Inverse guard: a signed-in user visiting /login goes home. */
export const RedirectIfAuthenticated = ({ children }: { children: ReactNode }) => {
	const { status } = useAuth();
	if (status === 'loading') return <FullPageLoader />;
	if (status === 'authenticated') return <Navigate to="/" replace />;
	// `unreachable` still reaches the form: signing in is the one action that can
	// settle the question, and it reports its own failure where the user is.
	return <>{children}</>;
};
