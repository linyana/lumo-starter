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
 *
 * The dialog closes on the press, so the press is the whole of what is shown — the request has no
 * button left to spin on. The toast is the report: it opens as the wait and is rewritten as the
 * outcome, which is the one place a closed dialog can still say what happened.
 */
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
