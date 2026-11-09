import { ROLE_META, type ListUsersQuery, type Role } from '@lumo/shared';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LumoBadge } from '@/components/ui/badge';
import { LumoButton } from '@/components/ui/button';
import { LumoInput } from '@/components/ui/input';
import { LumoSpinner } from '@/components/ui/spinner';
import { LumoTable } from '@/components/ui/table';
import { useAuth } from '@/providers/auth';
import { useHttp } from '@/hooks';
import { deleteUser, listUsers } from './api';

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

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
		void fetchData(buildQuery(page, search));
	}, [fetchData, page, search]);

	// A delete that fails has nowhere else to go, so it takes the default toast.
	const remove = useHttp(deleteUser, {
		onSuccess: () => void fetchData(buildQuery(page, search)),
	});

	const total = users.data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
					<LumoInput
						placeholder="Search email or name"
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
					/>
				</div>
			</div>

			{users.loading ? (
				<div className="grid place-items-center p-12">
					<LumoSpinner />
				</div>
			) : users.error ? (
				<p className="text-sm text-destructive">{users.error.message}</p>
			) : (
				<LumoTable.Root>
					<LumoTable.Header>
						<LumoTable.Row>
							<LumoTable.Head>Name</LumoTable.Head>
							<LumoTable.Head>Email</LumoTable.Head>
							<LumoTable.Head>Roles</LumoTable.Head>
							<LumoTable.Head className="text-right">Actions</LumoTable.Head>
						</LumoTable.Row>
					</LumoTable.Header>
					<LumoTable.Body>
						{users.data?.items.map((row) => (
							<LumoTable.Row key={row.id}>
								<LumoTable.Cell className="font-medium">{row.name}</LumoTable.Cell>
								<LumoTable.Cell className="text-muted-foreground">{row.email}</LumoTable.Cell>
								<LumoTable.Cell>
									<div className="flex flex-wrap gap-1">
										{row.roles.map((role) => (
											<LumoBadge key={role} variant={ROLE_VARIANT[role]}>
												{ROLE_META[role]}
											</LumoBadge>
										))}
									</div>
								</LumoTable.Cell>
								<LumoTable.Cell className="text-right">
									{can('user:delete') && row.id !== currentUser?.id ? (
										<LumoButton
											variant="ghost"
											size="sm"
											icon={<Trash2 />}
											loading={remove.loading}
											onClick={() => void remove.fetchData(row.id)}
										>
											Delete
										</LumoButton>
									) : (
										<span className="text-xs text-muted-foreground">—</span>
									)}
								</LumoTable.Cell>
							</LumoTable.Row>
						))}
					</LumoTable.Body>
				</LumoTable.Root>
			)}

			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Page {page} of {pageCount}
				</p>
				<div className="flex gap-2">
					<LumoButton
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((value) => Math.max(1, value - 1))}
					>
						Previous
					</LumoButton>
					<LumoButton
						variant="outline"
						size="sm"
						disabled={page >= pageCount}
						onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
					>
						Next
					</LumoButton>
				</div>
			</div>
		</div>
	);
};
