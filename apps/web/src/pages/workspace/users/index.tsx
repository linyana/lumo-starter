import { useQuery } from '@/hooks';
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
	const users = useQuery({ fetcher: usersApi.list, sort: 'createdAt', order: 'desc' });

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-semibold">Users</h1>

				{canEdit && <CreateUser onCreated={users.reload} />}
			</div>
			<UserList users={users} />
		</div>
	);
};
