import type { User } from '@lumo/shared';
import { usersApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';

type IPropsType = {
	users: readonly User[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted: () => void;
};

/**
 * The delete verb, asked about one row or a screenful: how many is the payload, not a second
 * component. Both go through the batch endpoint, whose all-or-nothing answer needs no counting here.
 */
export const DeleteUsers = ({ users, open, onOpenChange, onDeleted }: IPropsType) => {
	const remove = useHttp({ endpoint: usersApi.removeMany, onSuccess: onDeleted });

	const only = users.length === 1 ? users[0] : undefined;
	const who = only?.email ?? users.map((one) => one.name).join(', ');
	const label = only?.name ?? `${users.length} accounts`;

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Delete ${label}?`}
			description={`${who} — access ends immediately. What they wrote stays. This cannot be undone.`}
			confirmLabel="Delete"
			destructive
			onConfirm={() => {
				remove.fetchData(users.map((one) => one.id));
			}}
		/>
	);
};
