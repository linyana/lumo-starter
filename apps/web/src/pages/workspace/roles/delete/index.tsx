import type { Role } from '@lumo/shared';
import { useState } from 'react';
import { rolesApi } from '@/api';
import { AlertDialog } from '@/components';
import { useHttp } from '@/hooks';

type IPropsType = {
	role: Role;
	closePanel: () => void;
	reload: () => void;
};

export const DeleteRole = ({ role, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);

	const { fetchData, loading } = useHttp({
		endpoint: rolesApi.remove,
		loadingMessage: `Deleting ${role.name}…`,
		successMessage: `${role.name} deleted`,
		onSuccess: () => {
			setOpen(false);
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
			title={`Delete ${role.name}?`}
			description={`Everyone holding ${role.name} loses what it granted on their next request. This cannot be undone.`}
			confirmLabel="Delete"
			destructive
			onConfirm={() => {
				void fetchData(role.id);
			}}
		/>
	);
};
