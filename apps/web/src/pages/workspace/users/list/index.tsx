import { ROLE_META, type ListUsersQuery, type Role, type User } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Input, Table, type MenuItem, type TableColumn } from '@/components';
import type { SortKeyOf, UseListResult } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { DeleteUser } from '../delete';
import { EditUser } from '../edit';

/** The keys `GET /users` sorts on, which are the columns a title may report. */
type UserSortKey = SortKeyOf<ListUsersQuery>;

/**
 * One page of accounts, and the way to another. The query is the screen's: the whole `useList`
 * result arrives in one piece, so the records, the page in view, the sort, the way back and the way
 * to read it again are never threaded one at a time. Nothing here is fetched twice, and the
 * reader's permissions are read from the session rather than passed down.
 */
type IPropsType = { users: UseListResult<User, ListUsersQuery> };

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

/**
 * The accounts in columns and the way through them. The screen owns the query: it hands the whole
 * read to the table, which is what draws the wait, the footer and the three ways a list can be blank.
 * What is left here is what the table cannot know — the columns, and what a row's actions open.
 */
export const UserList = ({ users }: IPropsType) => {
	const { user: currentUser, can } = useAuth();
	const canEdit = can('user:write');
	const canDelete = can('user:delete');

	// The one panel a row has open, if any: the same row cannot be edited and deleted at once.
	const [panel, setPanel] = useState<{ user: User; kind: 'edit' | 'delete' } | null>(null);

	// A row's actions are data, because the table draws them twice — the last column's "..." and the
	// menu a right press opens are one list. What they open is mounted beside the table and not inside
	// a row: a menu closes on the press that picks an action, so a panel opened from within it would
	// close with it.
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
			filter: { kind: 'text', placeholder: 'Filter by email', ...users.text('email') },
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
			<div>
				<Input
					aria-label="Search name or email"
					placeholder="Search name or email"
					{...users.text('search')}
				/>
			</div>
			<Table
				columns={columns}
				// The wait, the order, the footer's numbers and the three ways a list can be blank are the
				// read's own, so the read is handed over whole rather than told again one prop at a time.
				list={users}
				rowActions={rowActions}
			/>

			{dialogs}
		</>
	);
};
