import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router';
import { Button } from '@/components';
import { workspaceHref } from '@/lib';
import { FullPageLoader, useAuth } from '@/providers/auth';

/**
 * Holds the tree back until the URL's slug and the session agree. The API resolves permissions from
 * the session's workspace, so rendering a page while they disagree would show the wrong workspace's data.
 */
export const WorkspaceScope = () => {
	const { slug } = useParams();
	const { workspace, workspaces, switchWorkspace } = useAuth();
	const asked = useRef<string | null>(null);
	const [failed, setFailed] = useState(false);

	const target = workspaces.find((entry) => entry.slug === slug);

	useEffect(() => {
		if (slug === undefined || workspace === null || target === undefined) return;
		if (workspace.slug === slug) {
			asked.current = null;
			return;
		}
		if (asked.current === slug) return;

		asked.current = slug;
		setFailed(false);
		void switchWorkspace(target.id).catch(() => setFailed(true));
	}, [slug, target, workspace, switchWorkspace]);

	if (workspace === null) return <FullPageLoader />;
	if (workspace.slug === slug) return <Outlet />;
	if (target === undefined || failed)
		return <WorkspaceMissing slug={slug} current={workspace.slug} />;

	return <FullPageLoader />;
};

const WorkspaceMissing = ({ slug, current }: { slug?: string; current: string }) => (
	<div className="grid place-items-center p-12 text-center">
		<div className="max-w-sm space-y-2">
			<h2 className="text-lg font-semibold">No workspace at /{slug ?? '…'}</h2>
			<p className="text-sm text-muted-foreground">
				It either does not exist or you are not a member of it.
			</p>
			<Button
				className="mt-2"
				variant="outline"
				nativeButton={false}
				render={<Link to={workspaceHref({ slug: current, path: 'overview' })} />}
			>
				Back to your workspace
			</Button>
		</div>
	</div>
);
