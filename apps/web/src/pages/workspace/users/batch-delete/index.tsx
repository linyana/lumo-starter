import type { User } from '@lumo/shared';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';

type IPropsType = {
	users: readonly User[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted: () => void;
};

export const DeleteUsers = ({ users, open, onOpenChange, onDeleted }: IPropsType) => {
	const remove = useHttp({ endpoint: usersApi.removeMany, onSuccess: onDeleted });

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Delete ${users.length} accounts?`}
			description={`${users.map((one) => one.name).join(', ')} lose access immediately. What their accounts wrote stays. This cannot be undone.`}
			confirmLabel="Delete"
			destructive
			onConfirm={() => {
				remove.fetchData(users.map((one) => one.id));
			}}
		/>
	);
};
