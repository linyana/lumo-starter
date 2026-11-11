import { Input } from '@/components';
import { useList } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { usersApi } from '@/api';
import { CreateUser } from './create';
import { UserList } from './list';

/**
 * The list is deliberately plain: its job is proving the wiring — shared query schema,
 * permission-gated controls, pagination. Every write lives in the folder beside it, and every one of
 * them ends with this screen reading the list again.
 */
export const UsersPage = () => {
	const { can } = useAuth();
	const canEdit = can('user:write');

	// Opens newest first; the columns re-read it once a title is pressed.
	const users = useList(usersApi.list, { sort: 'createdAt', order: 'desc' });

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">Users</h1>
					<p className="text-sm text-muted-foreground">
						Requires <code className="font-mono text-xs">user:read</code>
					</p>
				</div>

				<div className="flex items-end gap-2">
					<div className="w-64">
						<Input
							placeholder="Search email or name"
							value={users.search}
							onChange={(event) => {
								users.setSearch(event.target.value);
							}}
						/>
					</div>

					{canEdit && <CreateUser onCreated={users.reload} />}
				</div>
			</div>

			<UserList users={users} />
		</div>
	);
};
