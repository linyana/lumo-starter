import { ROLE_META, type Role, type User } from '@lumo/shared';
import { Trash2 } from 'lucide-react';
import { Badge, Button, Pagination, Table, type TableColumn } from '@/components';
import type { UserListProps } from './types';

export type { UserListProps } from './types';

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

/**
 * The accounts in columns and the way through them. It draws what it is handed: the screen owns the
 * query, this owns the columns and the footer.
 */
export const UserList = ({
	rows,
	total,
	page,
	pageSize,
	loading,
	error,
	onPageChange,
	canDelete,
	currentUserId,
	deleting = false,
	onDelete,
}: UserListProps) => {
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	const columns: TableColumn<User>[] = [
		{
			key: 'name',
			header: 'Name',
			cell: (row) => <span className="font-medium">{row.name}</span>,
		},
		{
			key: 'email',
			header: 'Email',
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
			cell: (row) =>
				canDelete && row.id !== currentUserId ? (
					<Button
						variant="ghost"
						size="sm"
						icon={<Trash2 />}
						loading={deleting}
						onClick={() => {
							onDelete(row.id);
						}}
					>
						Delete
					</Button>
				) : (
					<span className="text-xs text-muted-foreground">—</span>
				),
		},
	];

	// One failure, one notice: the table is not drawn behind the message.
	if (!loading && error) return <p className="text-sm text-destructive">{error}</p>;

	return (
		<>
			<Table
				columns={columns}
				rows={rows}
				rowKey={(row) => row.id}
				loading={loading}
				skeletonRows={pageSize}
			/>

			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Page {page} of {pageCount}
				</p>
				<Pagination
					size="sm"
					page={page}
					pageCount={pageCount}
					total={total}
					pageSize={pageSize}
					onPageChange={onPageChange}
				/>
			</div>
		</>
	);
};
