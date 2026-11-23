import { allows, type AccessCondition } from '@lumo/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Spinner } from '@/components/ui/feedback/spinner';
import { Button } from '@/components/ui/form/button';
import { useAccess } from '@/providers/access';
import { useAuth } from '../session';

export const FullPageLoader = () => (
	<div className="grid min-h-svh place-items-center bg-layout-background">
		<Spinner />
	</div>
);

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

export const Can = ({
	access,
	fallback = null,
	children,
}: {
	access?: AccessCondition;
	fallback?: ReactNode;
	children: ReactNode;
}) => {
	const grant = useAccess();

	return <>{allows({ condition: access, grant }) ? children : fallback}</>;
};

const namedPermissions = (access?: AccessCondition): string | null => {
	const permission = access?.permission;
	if (permission === undefined) return null;
	return (typeof permission === 'string' ? [permission] : permission).join(', ');
};

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

export const RedirectIfAuthenticated = ({ children }: { children: ReactNode }) => {
	const { status } = useAuth();
	if (status === 'loading') return <FullPageLoader />;
	if (status === 'authenticated') return <Navigate to="/" replace />;
	return <>{children}</>;
};
