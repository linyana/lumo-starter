import type { User } from '@lumo/shared';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';
type IPropsType = {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted: () => void;
};

export const DeleteUser = ({ user, open, onOpenChange, onDeleted }: IPropsType) => {
	const remove = useHttp({ endpoint: usersApi.remove, onSuccess: onDeleted });

	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Delete ${user.name}?`}
			description={`${user.email} loses access immediately. What the account wrote stays. This cannot be undone.`}
			confirmLabel="Delete"
			destructive
			onConfirm={() => {
				remove.fetchData(user.id);
			}}
		/>
	);
};
