import { useQuery } from '@/hooks';
import { Can } from '@/providers/auth';
import { usersApi } from '@/api';
import { CreateUser } from './create';
import { UserList } from './list';

/**
 * The list is deliberately plain: its job is proving the wiring — shared query schema,
 * permission-gated controls, pagination. Every write lives in the folder beside it, and every one of
 * them ends with this screen reading the list again.
 *
 * The one control this screen draws is gated where it stands, by the same `access` block the API
 * guard enforces — no `canEdit` local to keep in step with the row actions below.
 */
export const UsersPage = () => {
	// Opens newest first; the columns re-read it once a title is pressed.
	const list = useQuery({ fetcher: usersApi.list, sort: 'createdAt', order: 'desc' });

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-semibold">Users</h1>

				<Can access={{ permission: 'user:write' }}>
					<CreateUser onCreated={list.reload} />
				</Can>
			</div>
			<UserList list={list} />
		</div>
	);
};
