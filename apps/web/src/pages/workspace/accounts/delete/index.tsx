import type { Account } from '@lumo/shared';
import { useState } from 'react';
import { accountsApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	accounts: readonly Account[];
	closePanel: () => void;
	reload: () => void;
};

export const DeleteAccounts = ({ accounts, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const { account: currentAccount, logout } = useAuth();
	const only = accounts.length === 1 ? accounts[0] : undefined;
	const who = only?.email ?? accounts.map(({ name }) => name).join(', ');
	const label = only?.name ?? `${accounts.length} accounts`;
	const self = accounts.some(({ id }) => id === currentAccount?.id);

	const { fetchData, loading } = useHttp({
		endpoint: accountsApi.removeMany,
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
				fetchData(accounts.map(({ id }) => id));
			}}
		/>
	);
};
