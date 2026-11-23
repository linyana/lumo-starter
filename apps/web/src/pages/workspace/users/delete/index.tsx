import type { User } from '@lumo/shared';
import { useState } from 'react';
import { usersApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';

type IPropsType = {
	users: readonly User[];
	closePanel: () => void;
	reload: () => void;
};

export const DeleteUsers = ({ users, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
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
			open={open}
			onOpenChange={setOpen}
			onClosed={closePanel}
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
