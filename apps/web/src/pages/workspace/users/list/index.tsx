import { ROLE_META, type ListUsersQuery, type Role, type User } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Badge, Field, Form, Input, Table, type TableColumn } from '@/components';
import type { UseQueryResult } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { DeleteUsers } from '../delete';
import { EditUser } from '../edit';
import type { OverlayArgs, Panel, UserSortKey } from './types';

type IPropsType = { list: UseQueryResult<User, ListUsersQuery> };

const renderOverlay = ({ panel, closePanel, reload }: OverlayArgs): ReactElement => {
	switch (panel.kind) {
		case 'edit':
			return (
				<EditUser
					key={`edit-${panel.user.id}`}
					user={panel.user}
					closePanel={closePanel}
					reload={reload}
				/>
			);
		case 'delete':
			return (
				<DeleteUsers
					key={`delete-${panel.users.map((one) => one.id).join()}`}
					users={panel.users}
					closePanel={closePanel}
					reload={reload}
				/>
			);
	}
};

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

export const UserList = ({ list }: IPropsType) => {
	const { user: currentUser } = useAuth();

	const [panel, setPanel] = useState<Panel | null>(null);

	const closePanel = () => setPanel(null);

	const columns: TableColumn<User, UserSortKey>[] = [
		{
			key: 'name',
			header: 'Name',
			sortKey: 'name',
			cell: (row) => <span className="font-medium">{row.name}</span>,
		},
		{
			key: 'email',
			header: 'Email',
			sortKey: 'email',
			filter: {
				field: (
					<Field name="email">
						<Input placeholder="Exact email" />
					</Field>
				),
				active: list.filters.email !== undefined,
				clear: () => list.clearFilter('email'),
			},
			cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
		},
		{
			key: 'roles',
			header: 'Roles',
			cell: (row) => (
				<div className="flex flex-wrap gap-1">
					{row.roles.map((role) => (
						<Badge key={role} variant={ROLE_VARIANT[role]}>
							{ROLE_META[role]}
						</Badge>
					))}
				</div>
			),
		},
	];

	return (
		<>
			<Form form={list.form} initial={list.opened} onChange={list.write} settle={300}>
				<Field name="search">
					<Input placeholder="Search name or email" />
				</Field>
				<Table
					columns={columns}
					list={list}
					pagination={{ items: 'user' }}
					rowLabel={(item) => item.name}
					selectionActions={() => [
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							access: { permission: 'user:delete' },
							variant: 'default',
							blocked: (rows) =>
								rows.some((user) => user.id === currentUser?.id)
									? 'You cannot delete your own account'
									: undefined,
							onClick: ({ rows }) => setPanel({ kind: 'delete', users: rows }),
						},
					]}
					rowActions={(item) => [
						{
							label: 'Edit',
							icon: <Pencil />,
							access: { permission: 'user:write' },
							onClick: () => setPanel({ kind: 'edit', user: item }),
						},
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							separatorBefore: true,
							access: { permission: 'user:delete', when: () => item.id !== currentUser?.id },
							onClick: () => setPanel({ kind: 'delete', users: [item] }),
						},
					]}
				/>
			</Form>

			{panel !== null && renderOverlay({ panel, closePanel, reload: list.reload })}
		</>
	);
};
