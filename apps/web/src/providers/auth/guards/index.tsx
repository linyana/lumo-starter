import { allows, type AccessCondition } from '@lumo/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Button, Spinner, useAccess } from '@/components';
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
				<Button
					className="mt-2"
					onClick={() => {
						refresh();
					}}
				>
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
 * The gate in element position: the children are drawn only when the condition
 * holds, and nothing is drawn when it does not — an action, a card, a control.
 * `access` left out means ungated, so a list can gate some of its rows and not
 * others. It reads the same `access` block a column, a menu row or a route
 * carries, and the same grant those are drawn against.
 *
 * Hiding an element is an affordance, not a boundary: the API guard answers for
 * the request itself.
 */
export const Can = ({
	access,
	fallback = null,
	children,
}: {
	access?: AccessCondition;
	/** Drawn instead when the condition does not hold. Nothing by default. */
	fallback?: ReactNode;
	children: ReactNode;
}) => {
	const grant = useAccess();

	return <>{allows({ condition: access, grant }) ? children : fallback}</>;
};

/** The permissions a screen-opening condition names, when it names any. */
const namedPermissions = (access?: AccessCondition): string | null => {
	const permission = access?.permission;
	if (permission === undefined) return null;
	return (typeof permission === 'string' ? [permission] : permission).join(', ');
};

/**
 * Hides a route the session cannot open. This is an affordance, not a security
 * boundary — the same permission is enforced by the API guard.
 *
 * Its answer is the page's, so it says so on the page rather than drawing nothing:
 * a typed URL that quietly rendered an empty screen would look broken.
 */
export const RequireAccess = ({
	access,
	children,
}: {
	access?: AccessCondition;
	children: ReactNode;
}) => {
	const grant = useAccess();

	if (allows({ condition: access, grant })) return <>{children}</>;

	const named = namedPermissions(access);

	return (
		<div className="grid place-items-center p-12 text-center">
			<div className="max-w-sm space-y-2">
				<h2 className="text-lg font-semibold">Not available</h2>
				<p className="text-sm text-muted-foreground">
					{named === null ? (
						'Your role does not include what this page needs.'
					) : (
						<>
							Your role does not include <code className="font-mono">{named}</code>.
						</>
					)}
				</p>
			</div>
		</div>
	);
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
