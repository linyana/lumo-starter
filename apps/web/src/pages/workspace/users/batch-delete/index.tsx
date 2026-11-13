import type { User } from '@lumo/shared';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';

/** A screenful of accounts asked about at once. */
type IPropsType = {
	/** The accounts the question is about — the ones the reader chose. */
	users: readonly User[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Runs once the request has answered, so the caller can re-read the list. */
	onDeleted: () => void;
};

/**
 * The delete of a chosen set: the question, and the one request behind the answer. A batch is not a
 * loop of row deletes on this side — the endpoint answers for all of them or for none, which is the
 * only thing a screen showing a count can honestly say afterwards. The chosen set is left as it was:
 * the rows that went are no longer in the answer the list hands back, so the table's own rule drops
 * them without this dialog reaching into it.
 */
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
