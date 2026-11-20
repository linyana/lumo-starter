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

export const DeleteUsers = ({ users, open, onOpenChange, onDeleted }: IPropsType) => {
	const only = users.length === 1 ? users[0] : undefined;
	const who = only?.email ?? users.map((one) => one.name).join(', ');
	const label = only?.name ?? `${users.length} accounts`;

	const remove = useHttp({
		endpoint: usersApi.removeMany,
		loadingMessage: `Deleting ${label}…`,
		successMessage: `${label} deleted`,
		onSuccess: onDeleted,
	});

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
