import { accountsApi } from '@/api';
import { useQuery } from '@/hooks';
import { Can } from '@/providers/auth';
import { useSetting } from '@/providers/setting';
import { CreateAccount } from './create';
import { AccountList } from './list';

export const AccountsPage = () => {
	const { settings } = useSetting();
	const list = useQuery({ fetcher: accountsApi.list, pageSize: settings.pageSize });

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-xl font-semibold">Accounts</h1>

				<Can access={{ permission: 'account:write' }}>
					<CreateAccount onCreated={list.reload} />
				</Can>
			</div>
			<AccountList list={list} />
		</div>
	);
};
