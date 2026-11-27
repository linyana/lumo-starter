import { PERMISSION_META, type Role } from '@lumo/shared';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { rolesApi } from '@/api';
import { Badge, Button, Card, Spinner } from '@/components';
import { useHttp } from '@/hooks';
import { workspaceHref } from '@/lib';
import { Can, useAuth } from '@/providers/auth';
import { DeleteRole } from './delete';

type Panel = { kind: 'delete'; role: Role };

export const RolesPage = () => {
	const { workspace } = useAuth();
	const [panel, setPanel] = useState<Panel | null>(null);
	const { data, initial, fetchData } = useHttp({ endpoint: rolesApi.list });

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	const roles = data ?? [];
	const closePanel = () => setPanel(null);
	const reload = () => {
		void fetchData();
	};
	const href = (path: string): string =>
		workspace === null ? '/' : workspaceHref({ slug: workspace.slug, path });

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">Roles</h1>
					<p className="text-sm text-muted-foreground">
						A role is a named set of permissions. Everyone holds at least one.
					</p>
				</div>

				<Can access={{ permission: 'role:write' }}>
					<Button
						variant="primary"
						size="sm"
						icon={<Plus />}
						nativeButton={false}
						render={<Link to={href('settings/roles/new')} />}
					>
						New role
					</Button>
				</Can>
			</div>

			{initial ? (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Spinner size={1} label="Loading roles" />
					Loading roles…
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{roles.map((role) => (
						<Card
							key={role.id}
							title={role.name}
							description={
								<span className="flex items-center gap-2">
									<span className="font-mono text-xs">{role.key}</span>
									{role.system ? (
										<Badge variant="outline" color="neutral">
											From code
										</Badge>
									) : (
										<Badge variant="soft" color="info">
											This workspace
										</Badge>
									)}
								</span>
							}
							action={
								role.system ? null : (
									<Can access={{ permission: 'role:write' }}>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Edit ${role.name}`}
												icon={<Pencil />}
												nativeButton={false}
												render={<Link to={href(`settings/roles/${role.id}`)} />}
											/>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Delete ${role.name}`}
												icon={<Trash2 />}
												onClick={() => setPanel({ kind: 'delete', role })}
											/>
										</div>
									</Can>
								)
							}
							classNames={{ content: 'flex flex-col gap-2' }}
						>
							{role.description !== '' && (
								<p className="text-sm text-muted-foreground">{role.description}</p>
							)}
							<div className="flex flex-wrap gap-1">
								{role.permissions.map((permission) => (
									<Badge key={permission} variant="secondary">
										{PERMISSION_META[permission]}
									</Badge>
								))}
							</div>
						</Card>
					))}
				</div>
			)}

			{panel?.kind === 'delete' && (
				<DeleteRole role={panel.role} closePanel={closePanel} reload={reload} />
			)}
		</div>
	);
};

export { RoleFormPage } from './form';
