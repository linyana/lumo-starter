import { PERMISSION_META, ROLE_META } from '@lumo/shared';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/providers/auth';

export const DashboardPage = () => {
	const { user } = useAuth();
	if (!user) return null;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
				<p className="text-sm text-muted-foreground">{user.email}</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Roles</Card.Title>
						<Card.Description>Stored as text, validated against @lumo/shared.</Card.Description>
					</Card.Header>
					<Card.Content className="flex flex-wrap gap-2">
						{user.roles.map((role) => (
							<Badge key={role} variant="secondary">
								{ROLE_META[role]}
							</Badge>
						))}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>Permissions</Card.Title>
						<Card.Description>
							Expanded from the shared role table — the API guard reads the same map.
						</Card.Description>
					</Card.Header>
					<Card.Content className="flex flex-col gap-2">
						{user.permissions.map((permission) => (
							<div key={permission} className="flex items-center justify-between text-sm">
								<span className="font-mono text-xs">{permission}</span>
								<span className="text-muted-foreground">{PERMISSION_META[permission]}</span>
							</div>
						))}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	);
};
