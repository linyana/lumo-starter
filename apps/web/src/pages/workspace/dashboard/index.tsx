import { PERMISSION_META, ROLE_META } from '@lumo/shared';
import { LumoBadge } from '@/components/ui/badge';
import { LumoCard } from '@/components/ui/card';
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
				<LumoCard.Root>
					<LumoCard.Header>
						<LumoCard.Title>Roles</LumoCard.Title>
						<LumoCard.Description>
							Stored as text, validated against @lumo/shared.
						</LumoCard.Description>
					</LumoCard.Header>
					<LumoCard.Content className="flex flex-wrap gap-2">
						{user.roles.map((role) => (
							<LumoBadge key={role} variant="secondary">
								{ROLE_META[role]}
							</LumoBadge>
						))}
					</LumoCard.Content>
				</LumoCard.Root>

				<LumoCard.Root>
					<LumoCard.Header>
						<LumoCard.Title>Permissions</LumoCard.Title>
						<LumoCard.Description>
							Expanded from the shared role table — the API guard reads the same map.
						</LumoCard.Description>
					</LumoCard.Header>
					<LumoCard.Content className="flex flex-col gap-2">
						{user.permissions.map((permission) => (
							<div key={permission} className="flex items-center justify-between text-sm">
								<span className="font-mono text-xs">{permission}</span>
								<span className="text-muted-foreground">{PERMISSION_META[permission]}</span>
							</div>
						))}
					</LumoCard.Content>
				</LumoCard.Root>
			</div>
		</div>
	);
};
