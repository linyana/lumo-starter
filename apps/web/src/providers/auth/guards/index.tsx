import type { Permission } from '@lumo/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '../session';

export const FullPageLoader = () => (
	<div className="grid min-h-svh place-items-center bg-layout-background">
		<Spinner />
	</div>
);

/**
 * Waiting for the refresh round-trip and "signed out" are different states:
 * redirecting during the first one would bounce an already signed-in user to
 * the login page on every reload.
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
	const { status } = useAuth();
	const location = useLocation();

	if (status === 'loading') return <FullPageLoader />;
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
	return <>{children}</>;
};
