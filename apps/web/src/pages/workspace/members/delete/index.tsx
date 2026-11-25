import type { Member } from '@lumo/shared';
import { useState } from 'react';
import { membersApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	members: readonly Member[];
	closePanel: () => void;
	reload: () => void;
};

export const DeleteMembers = ({ members, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const { user: currentUser, logout } = useAuth();
	const only = members.length === 1 ? members[0] : undefined;
	const who = only?.email ?? members.map(({ username }) => `@${username}`).join(', ');
	const label = only === undefined ? `${members.length} members` : `@${only.username}`;
	const self = members.some(({ id }) => id === currentUser?.id);

	const { fetchData, loading } = useHttp({
		endpoint: membersApi.removeMany,
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
				fetchData(members.map(({ id }) => id));
			}}
		/>
	);
};
