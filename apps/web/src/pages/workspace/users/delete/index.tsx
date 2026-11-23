import type { User } from '@lumo/shared';
import { useState } from 'react';
import { usersApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	users: readonly User[];
	closePanel: () => void;
	reload: () => void;
};

export const DeleteUsers = ({ users, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const { user: currentUser, logout } = useAuth();
	const only = users.length === 1 ? users[0] : undefined;
	const who = only?.email ?? users.map(({ name }) => name).join(', ');
	const label = only?.name ?? `${users.length} accounts`;
	const self = users.some(({ id }) => id === currentUser?.id);

	const { 
		fetchData,
		loading,
	} = useHttp({
		endpoint: usersApi.removeMany,
		loadingMessage: `Deleting ${label}…`,
		successMessage: `${label} deleted`,
		onSuccess: () => {
			setOpen(false);

			if (self) {
				void logout();
				return;
			}

			reload();
		},
	});

	return (
		<AlertDialog
			open={open}
			onOpenChange={setOpen}
			onClosed={closePanel}
			confirmCloses={false}
			pending={loading}
			title={`Delete ${label}?`}
			description={
				self
					? `${who} — this is your own account. You are signed out as soon as it is gone, and this cannot be undone.`
					: `${who} — access ends immediately. What they wrote stays. This cannot be undone.`
			}
			confirmLabel="Delete"
			destructive
			onConfirm={() => {
				fetchData(users.map(({ id }) => id));
			}}
		/>
	);
};
