import { ROLE_META, type ListUsersQuery, type Role } from '@lumo/shared';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
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

			{users.loading ? (
				<div className="grid place-items-center p-12">
					<Spinner />
				</div>
			) : users.error ? (
				<p className="text-sm text-destructive">{users.error.message}</p>
			) : (
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Roles</Table.Head>
							<Table.Head className="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{users.data?.items.map((row) => (
							<Table.Row key={row.id}>
								<Table.Cell className="font-medium">{row.name}</Table.Cell>
								<Table.Cell className="text-muted-foreground">{row.email}</Table.Cell>
								<Table.Cell>
									<div className="flex flex-wrap gap-1">
										{row.roles.map((role) => (
											<Badge key={role} variant={ROLE_VARIANT[role]}>
												{ROLE_META[role]}
											</Badge>
										))}
									</div>
								</Table.Cell>
								<Table.Cell className="text-right">
									{can('user:delete') && row.id !== currentUser?.id ? (
										<Button
											variant="ghost"
											size="sm"
											icon={<Trash2 />}
											loading={remove.loading}
											onClick={() => void remove.fetchData(row.id)}
										>
											Delete
										</Button>
									) : (
										<span className="text-xs text-muted-foreground">—</span>
									)}
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			)}

			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					Page {page} of {pageCount}
				</p>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((value) => Math.max(1, value - 1))}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= pageCount}
						onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};
