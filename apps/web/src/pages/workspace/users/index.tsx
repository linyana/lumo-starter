import { usersApi } from '@/api';
import { useQuery } from '@/hooks';
import { Can } from '@/providers/auth';
import { useSetting } from '@/providers/setting';
import { CreateUser } from './create';
import { UserList } from './list';

export const UsersPage = () => {
	const { settings } = useSetting();
	const list = useQuery({ fetcher: usersApi.list, pageSize: settings.pageSize });

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
