import type { User } from '@lumo/shared';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';

/** One account's delete: the question, and the request behind the answer. */
type IPropsType = {
	/** The account the question is about. */
	user: User;
	/** Whether the question is the one on screen. The row that asked it owns that. */
	open: boolean;
	/** Runs when the question asks to open or close — on the answer, too. */
	onOpenChange: (open: boolean) => void;
	/** Runs once the request has answered, so the caller can re-read the list. */
	onDeleted: () => void;
};

/**
 * The delete of one account: the question, and the request behind the answer. The question closes
 * on confirm, so a failure has nowhere to land but the toast — the default `useHttp` takes. The row
 * is re-read through `onDeleted` once the request has answered.
 */
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
