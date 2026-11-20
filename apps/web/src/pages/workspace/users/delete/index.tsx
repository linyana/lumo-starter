import type { User } from '@lumo/shared';
import { usersApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';

/**
 * The confirmation for removing accounts. Drawn only while it is open, so it takes the two things the page
 * does about it: put the panel away, and read the list again once the removal lands.
 */
type IPropsType = {
	users: readonly User[];
	closePanel: () => void;
	reload: () => void;
};

export const DeleteUsers = ({ users, closePanel, reload }: IPropsType) => {
	const only = users.length === 1 ? users[0] : undefined;
	const who = only?.email ?? users.map((one) => one.name).join(', ');
	const label = only?.name ?? `${users.length} accounts`;

	const remove = useHttp({
		endpoint: usersApi.removeMany,
		loadingMessage: `Deleting ${label}…`,
		successMessage: `${label} deleted`,
		onSuccess: reload,
	});

	return (
		<AlertDialog
			open
			// Confirming, cancelling, Escape and a press on the page behind it all end the same way here: the
			// panel goes away, and the removal that was already started reports back by itself.
			onOpenChange={(next) => {
				if (!next) closePanel();
			}}
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
