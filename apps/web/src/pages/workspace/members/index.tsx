import { membersApi } from '@/api';
import { useQuery } from '@/hooks';
import { Can } from '@/providers/auth';
import { useSetting } from '@/providers/setting';
import { CreateMember } from './create';
import { MemberList } from './list';

export const MembersPage = () => {
	const { settings } = useSetting();
	const list = useQuery({ fetcher: membersApi.list, pageSize: settings.pageSize });

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">Members</h1>
					<p className="text-sm text-muted-foreground">
						Everyone who can sign in to this workspace, and what they hold here.
					</p>
				</div>

				<Can access={{ permission: 'member:write' }}>
					<CreateMember onCreated={list.reload} />
				</Can>
			</div>
			<MemberList list={list} />
		</div>
	);
};
