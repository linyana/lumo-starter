import { PERMISSION_META } from '@lumo/shared';
import { Badge, Card } from '@/components';
import { useAuth } from '@/providers/auth';

export const DashboardPage = () => {
	const { user, workspace, permissions } = useAuth();
	if (!user) return null;

	return (
		<div className="space-y-3">
			<div>
				<h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
				<p className="text-sm text-muted-foreground">{user.email}</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card
					title="Workspace"
					description="Roles and permissions below are the ones you hold here."
				>
					{workspace && (
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">{workspace.name}</span>
							<span className="font-mono text-xs text-muted-foreground">{workspace.slug}</span>
						</div>
					)}
				</Card>

				<Card
					title="Roles"
					description="Assigned here, resolved from the database on every request."
					classNames={{ content: 'flex flex-wrap gap-2' }}
				>
					{user.roles.map((role) => (
						<Badge key={role.key} variant="secondary">
							{role.name}
						</Badge>
					))}
				</Card>

				<Card
					title="Permissions"
					description="What your roles grant in this workspace, as the API resolved them."
					classNames={{ content: 'flex flex-col gap-2' }}
				>
					{permissions.map((permission) => (
						<div key={permission} className="flex items-center justify-between text-sm">
							<span className="font-mono text-xs">{permission}</span>
							<span className="text-muted-foreground">{PERMISSION_META[permission]}</span>
						</div>
					))}
				</Card>
			</div>
		</div>
	);
};
