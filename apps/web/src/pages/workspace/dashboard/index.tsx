import { PERMISSION_META, ROLE_META } from '@lumo/shared';
import { Badge, Card } from '@/components';
import { useAuth } from '@/providers/auth';

export const DashboardPage = () => {
	const { account } = useAuth();
	if (!account) return null;

	return (
		<div className="space-y-3">
			<div>
				<h1 className="text-xl font-semibold">Welcome, {account.name}</h1>
				<p className="text-sm text-muted-foreground">{account.email}</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card
					title="Roles"
					description="Stored as text, validated against @lumo/shared."
					classNames={{ content: 'flex flex-wrap gap-2' }}
				>
					{account.roles.map((role) => (
						<Badge key={role} variant="secondary">
							{ROLE_META[role]}
						</Badge>
					))}
				</Card>

				<Card
					title="Permissions"
					description="Expanded from the shared role table — the API guard reads the same map."
					classNames={{ content: 'flex flex-col gap-2' }}
				>
					{account.permissions.map((permission) => (
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
