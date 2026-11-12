import { ROLE_META, type ListUsersQuery, type Role, type User } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Field, Form, Input, Table, type MenuItem, type TableColumn } from '@/components';
import type { SortKeyOf, UseQueryResult } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { DeleteUser } from '../delete';
import { EditUser } from '../edit';

type UserSortKey = SortKeyOf<ListUsersQuery>;

type IPropsType = { users: UseQueryResult<User, ListUsersQuery> };

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

/**
 * The records, and the two ways of narrowing them: one field over the table and one behind each
 * column's title. Both are fields of the one form, so narrowing by either is the same write, and a
 * column's "Clear filter" is the same reset — the table is only told whether its column is narrowed
 * and how to undo it.
 */
export const UserList = ({ users }: IPropsType) => {
	const { user: currentUser, can } = useAuth();
	const canEdit = can('user:write');
	const canDelete = can('user:delete');

	const [panel, setPanel] = useState<{ user: User; kind: 'edit' | 'delete' } | null>(null);

	const rowActions = (user: User): MenuItem[] => {
		const items: MenuItem[] = [];

		if (canEdit) {
			items.push({
				label: 'Edit',
				icon: <Pencil />,
				onClick: () => setPanel({ user, kind: 'edit' }),
			});
		}

		// An account cannot delete itself — a rule of this screen's, not of the endpoint's.
		if (canDelete && user.id !== currentUser?.id) {
			items.push({
				label: 'Delete',
				icon: <Trash2 />,
				destructive: true,
				separatorBefore: true,
				onClick: () => setPanel({ user, kind: 'delete' }),
			});
		}

		return items;
	};

	const closePanel = (next: boolean) => {
		if (!next) setPanel(null);
	};

	const dialogs =
		panel === null ? null : panel.kind === 'edit' ? (
			<EditUser
				user={panel.user}
				currentUserId={currentUser?.id}
				open
				onOpenChange={closePanel}
				onUpdated={users.reload}
			/>
		) : (
			<DeleteUser user={panel.user} open onOpenChange={closePanel} onDeleted={users.reload} />
		);

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
						<Input placeholder="Filter by email" aria-label="Filter by email" />
					</Field>
				),
				active: users.filters.email !== undefined,
				clear: () => users.clearFilter('email'),
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
			<Form
				form={users.form}
				initial={users.opened}
				onChange={users.write}
				settle={300}
				className="gap-3"
			>
				<Field name="search">
					<Input aria-label="Search name or email" placeholder="Search name or email" />
				</Field>
				<Table columns={columns} list={users} rowActions={rowActions} />
			</Form>

			{dialogs}
		</>
	);
};
