import { ROLE_META, type ListUsersQuery, type Role, type User } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Field, Form, Input, Table, type TableColumn } from '@/components';
import type { SortKeyOf, UseQueryResult } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { DeleteUsers } from '../batch-delete';
import { DeleteUser } from '../delete';
import { EditUser } from '../edit';

type UserSortKey = SortKeyOf<ListUsersQuery>;

type IPropsType = { list: UseQueryResult<User, ListUsersQuery> };

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

export const UserList = ({ list }: IPropsType) => {
	const { user: currentUser } = useAuth();

	const [panel, setPanel] = useState<{ user: User; kind: 'edit' | 'delete' } | null>(null);
	const [batch, setBatch] = useState<readonly User[] | null>(null);

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
						<Input placeholder="Filter by email" />
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
					rowLabel={(item) => item.name}
					selectionActions={() => [
						{
							label: 'Delete',
							icon: <Trash2 />,
							iconOnly: true,
							destructive: true,
							access: { permission: 'user:delete' },
							blocked: (rows) =>
								rows.some((user: User) => user.id === currentUser?.id)
									? 'You cannot delete your own account'
									: undefined,
							onClick: ({ rows }) => setBatch(rows),
						},
					]}
					rowActions={(item) => [
						{
							label: 'Edit',
							icon: <Pencil />,
							access: { permission: 'user:write' },
							onClick: () => setPanel({ user: item, kind: 'edit' }),
						},
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							separatorBefore: true,
							access: { permission: 'user:delete', when: () => item.id !== currentUser?.id },
							onClick: () => setPanel({ user: item, kind: 'delete' }),
						},
					]}
				/>
			</Form>

			<>
				{panel === null ? null : panel.kind === 'edit' ? (
					<EditUser
						user={panel.user}
						currentUserId={currentUser?.id}
						open
						onOpenChange={(next: boolean) => {
							if (!next) setPanel(null);
						}}
						onUpdated={list.reload}
					/>
				) : (
					<DeleteUser
						user={panel.user}
						open
						onOpenChange={(next: boolean) => {
							if (!next) setPanel(null);
						}}
						onDeleted={list.reload}
					/>
				)}
				{batch !== null && (
					<DeleteUsers
						users={batch}
						open
						onOpenChange={(next) => {
							if (!next) setBatch(null);
						}}
						onDeleted={list.reload}
					/>
				)}
			</>
		</>
	);
};
