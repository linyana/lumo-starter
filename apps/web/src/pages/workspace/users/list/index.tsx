import { ROLE_META, type ListUsersQuery, type Role, type User } from '@lumo/shared';
import { RotateCcw } from 'lucide-react';
import { Badge, Button, Pagination, Table, type TableColumn } from '@/components';
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
 * The accounts in columns and the way through them. It draws what it is handed: the screen owns the
 * query and hands it over whole, this owns the columns and the footer.
 */
export const UserList = ({ users }: IPropsType) => {
	const { user: currentUser, can } = useAuth();
	const canEdit = can('user:write');
	const canDelete = can('user:delete');

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
		{
			key: 'actions',
			header: 'Actions',
			align: 'end',
			cell: (row) => {
				const deletable = canDelete && row.id !== currentUser?.id;

				if (!canEdit && !deletable) {
					return <span className="text-xs text-muted-foreground">—</span>;
				}

				return (
					<div className="flex items-center justify-end gap-1">
						{canEdit && (
							<EditUser user={row} currentUserId={currentUser?.id} onUpdated={users.reload} />
						)}
						{deletable && <DeleteUser user={row} onDeleted={users.reload} />}
					</div>
				);
			},
		},
	];

	// One failure, one notice, and the way to ask again. The records are dropped rather than left
	// under a message that says the last read did not answer: what is on the page would be a guess.
	const failed = users.error !== undefined;

	/**
	 * The row a table shows when it has no records — which is three different situations and not one,
	 * so each says its own thing: the read failed, the search found nothing, the list is empty.
	 */
	const empty = failed ? (
		<>
			<p role="alert" className="text-destructive">
				{users.error}
			</p>
			<Button
				variant="outline"
				size="sm"
				icon={<RotateCcw />}
				loading={users.loading}
				onClick={users.reload}
			>
				Try again
			</Button>
		</>
	) : users.filters.search ? (
		<>
			<p>No account matches “{users.filters.search}”.</p>
			<Button variant="ghost" size="sm" onClick={() => users.setFilter('search', null)}>
				Clear search
			</Button>
		</>
	) : (
		<p>No accounts yet.</p>
	);

	return (
		<>
			<Table
				columns={columns}
				rows={failed ? [] : users.items}
				rowKey={(row) => row.id}
				sort={users.sort}
				onSortChange={users.onSort}
				loading={users.loading}
				skeletonRows={users.pageSize}
				empty={empty}
			/>

			{/* There is nothing to page through while a failure is being reported, or at all. */}
			{!failed && users.total > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Page {users.page} of {users.pageCount}
					</p>
					<Pagination
						size="sm"
						page={users.page}
						pageCount={users.pageCount}
						total={users.total}
						pageSize={users.pageSize}
						onPageChange={users.setPage}
					/>
				</div>
			)}
		</>
	);
};
