import { Link } from 'react-router';
import { Button, Card } from '@/components';
import { workspaceHref } from '@/lib';
import { Can, useAuth } from '@/providers/auth';

const ENTRIES = [
	{
		path: 'settings/members',
		title: 'Members',
		description: 'Who can sign in to this workspace, and what roles they hold here.',
		access: { permission: 'member:read' },
	},
	{
		path: 'settings/roles',
		title: 'Roles',
		description: 'The named sets of permissions this workspace can hand out.',
		access: { permission: 'role:read' },
	},
	{
		path: 'settings/audit',
		title: 'Audit log',
		description: 'Every privilege change here, appended and never edited.',
		access: { permission: 'audit:read' },
	},
] as const;

export const SettingsPage = () => {
	const { workspace } = useAuth();
	if (workspace === null) return null;

	return (
		<div className="space-y-3">
			<div>
				<h1 className="text-xl font-semibold">Administration</h1>
				<p className="text-sm text-muted-foreground">
					Who is here, what they may do, and what has already happened in {workspace.name}.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{ENTRIES.map((entry) => (
					<Can key={entry.path} access={entry.access}>
						<Card
							title={entry.title}
							description={entry.description}
							action={
								<Button
									variant="outline"
									size="sm"
									nativeButton={false}
									render={<Link to={workspaceHref({ slug: workspace.slug, path: entry.path })} />}
								>
									Open
								</Button>
							}
						/>
					</Can>
				))}
			</div>
		</div>
	);
};
