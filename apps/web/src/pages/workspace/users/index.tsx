import type { ListUsersQuery } from '@lumo/shared';
import { useEffect, useState } from 'react';
import { Input } from '@/components';
import { useAuth } from '@/providers/auth';
import { useHttp } from '@/hooks';
import { deleteUser, listUsers } from './api';
import { UserList } from './list';

const PAGE_SIZE = 10;

const buildQuery = (page: number, search: string): ListUsersQuery => ({
	page,
	pageSize: PAGE_SIZE,
	sort: 'createdAt',
	order: 'desc',
	...(search.trim() ? { search: search.trim() } : {}),
});

/**
 * The list is deliberately plain: its job is proving the wiring — shared query
 * schema, permission-gated controls, pagination.
 */
export const UsersPage = () => {
	const { user: currentUser, can } = useAuth();

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');

	// Rendered inline below, so the toast is off: one failure, one notice.
	const users = useHttp(listUsers, { toastError: false });
	const { fetchData } = users;

	useEffect(() => {
		fetchData(buildQuery(page, search));
	}, [fetchData, page, search]);

	// A delete that fails has nowhere else to go, so it takes the default toast.
	const remove = useHttp(deleteUser, {
		onSuccess: () => {
			fetchData(buildQuery(page, search));
		},
	});

	const total = users.data?.total ?? 0;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">Users</h1>
					<p className="text-sm text-muted-foreground">
						{total} {total === 1 ? 'account' : 'accounts'} · requires{' '}
						<code className="font-mono text-xs">user:read</code>
					</p>
				</div>

				<div className="w-64">
					<Input
						placeholder="Search email or name"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			<UserList
				rows={users.data?.items ?? []}
				total={total}
				page={page}
				pageSize={PAGE_SIZE}
				loading={users.loading}
				error={users.error?.message}
				onPageChange={setPage}
				canDelete={can('user:delete')}
				currentUserId={currentUser?.id}
				deleting={remove.loading}
				onDelete={remove.fetchData}
			/>
		</div>
	);
};
