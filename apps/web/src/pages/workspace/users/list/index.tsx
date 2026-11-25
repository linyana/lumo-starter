import type { ListUsersQuery, RoleRef, User } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Badge, Field, Form, Input, Table, type TableColumn } from '@/components';
import type { UseQueryResult } from '@/hooks';
import { DeleteUsers } from '../delete';
import { EditUser } from '../edit';
import type { OverlayArgs, Panel, UserSortKey } from './types';

type IPropsType = { list: UseQueryResult<User, ListUsersQuery> };

const renderOverlay = ({ panel, closePanel, reload }: OverlayArgs): ReactElement => {
	switch (panel.kind) {
		case 'edit':
			return <EditUser user={panel.user} closePanel={closePanel} reload={reload} />;
		case 'delete':
			return <DeleteUsers users={panel.users} closePanel={closePanel} reload={reload} />;
	}
};

const ROLE_VARIANT: Record<string, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	MEMBER: 'secondary',
};

const variantOf = (role: RoleRef): 'default' | 'info' | 'secondary' =>
	ROLE_VARIANT[role.key] ?? 'secondary';

export const UserList = ({ list }: IPropsType) => {
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
			key: 'username',
			header: 'Username',
			sortKey: 'username',
			cell: (row) => <span className="font-mono text-muted-foreground">@{row.username}</span>,
		},
		{
			key: 'email',
			header: 'Email',
			sortKey: 'email',
			filter: list.filterOf({ name: 'email', placeholder: 'Filter email' }),
			cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
		},
		{
			key: 'roles',
			header: 'Roles',
			cell: (row) => (
				<div className="flex flex-wrap gap-1">
					{row.roles.map((role) => (
						<Badge key={role.key} variant={variantOf(role)}>
							{role.name}
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
					<Input placeholder="Search name, username or email" clearable />
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
							access: { permission: 'user:delete' },
							onClick: () => setPanel({ kind: 'delete', users: [item] }),
						},
					]}
				/>
			</Form>

			{panel !== null && renderOverlay({ panel, closePanel, reload: list.reload })}
		</>
	);
};
