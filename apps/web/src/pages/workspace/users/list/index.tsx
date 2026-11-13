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

/**
 * The records, and the two ways of narrowing them: one field over the table and one behind each
 * column's title. Both are fields of the one form, so narrowing by either is the same write, and a
 * column's "Clear filter" is the same reset — the table is only told whether its column is narrowed
 * and how to undo it.
 */
export const UserList = ({ list }: IPropsType) => {
	const { user: currentUser } = useAuth();

	const [panel, setPanel] = useState<{ user: User; kind: 'edit' | 'delete' } | null>(null);
	const [batch, setBatch] = useState<readonly User[] | null>(null);

	const closePanel = (next: boolean) => {
		if (!next) setPanel(null);
	};

	/**
	 * The one rule the row's delete and the chosen set's delete both answer to: the record is the reader's
	 * own. It is written once so a batch cannot come to a different verdict than the row it contains —
	 * the row hides the action, the batch disables it and says why.
	 */
	const isMine = (user: User) => user.id === currentUser?.id;

	const dialogs = (
		<>
			{panel === null ? null : panel.kind === 'edit' ? (
				<EditUser
					user={panel.user}
					currentUserId={currentUser?.id}
					open
					onOpenChange={closePanel}
					onUpdated={list.reload}
				/>
			) : (
				<DeleteUser user={panel.user} open onOpenChange={closePanel} onDeleted={list.reload} />
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
							destructive: true,
							access: { permission: 'user:delete' },
							// What the chosen records withhold, said rather than hidden: the rows are on the screen and
							// the reader picked them, so the answer is why not — and the press stays where it was.
							blocked: (rows) =>
								rows.some(isMine) ? 'You cannot delete your own account' : undefined,
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
							access: { permission: 'user:delete', when: () => !isMine(item) },
							onClick: () => setPanel({ user: item, kind: 'delete' }),
						},
					]}
				/>
			</Form>

			{dialogs}
		</>
	);
};
