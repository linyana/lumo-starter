import type { User } from '@lumo/shared';
import { Trash2 } from 'lucide-react';
import { AlertDialog, Button } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';

/** One account's delete: the question, and the request behind the answer. */
type IPropsType = {
	/** The account the question is about. */
	user: User;
	/** Runs once the request has answered, so the caller can re-read the list. */
	onDeleted: () => void;
};

/**
 * The delete of one account: a button that asks before it acts, and the request behind the answer.
 * The panel closes on confirm, so a failure has nowhere to land but the toast — the default `useHttp`
 * takes. The row is re-read through `onDeleted` once the request has answered.
 */
export const DeleteUser = ({ user, onDeleted }: IPropsType) => {
	const removal = useHttp({ fn: usersApi.remove, onSuccess: onDeleted });

	return (
		<AlertDialog
			trigger={<Button variant="ghost" size="sm" icon={<Trash2 />} loading={removal.loading} tone="destructive" />}
			title={`Delete ${user.name}?`}
			description={`${user.email} loses access immediately. What the account wrote stays. This cannot be undone.`}
			confirmLabel="Delete"
			destructive
			onConfirm={() => {
				removal.fetchData(user.id);
			}}
		/>
	);
};
