import {
	createRoleSchema,
	updateRoleSchema,
	type CreateRoleInput,
	type Role,
	type UpdateRoleInput,
} from '@lumo/shared';
import { useState } from 'react';
import { rolesApi } from '@/api';
import { Button, Dialog, Field, Form, Input, useChanged, useForm } from '@/components';
import { useHttp } from '@/hooks';
import { PermissionMatrix } from './permission-matrix';

type IPropsType = {
	role: Role | null;
	closePanel: () => void;
	reload: () => void;
};

export const RoleEditor = ({ role, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const form = useForm();
	const changed = useChanged({ form });
	const editing = role !== null;

	const { fetchData, loading } = useHttp({
		form,
		endpoint: (input: CreateRoleInput | UpdateRoleInput) =>
			role ? rolesApi.update({ id: role.id, input }) : rolesApi.create(input as CreateRoleInput),
		successMessage: editing ? 'Role saved' : 'Role created',
		onSuccess: () => {
			setOpen(false);
			reload();
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
			onClosed={closePanel}
			title={editing ? `Edit ${role.name}` : 'New role'}
			description={
				editing
					? 'Changes reach everyone holding this role on their next request.'
					: 'A role of this workspace. Owners keep their powers; this one is yours to shape.'
			}
			footer={
				<>
					<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						disabled={editing && !changed}
						focusableWhenDisabled={editing && !changed}
						loading={loading}
						onClick={form.submit}
					>
						{editing ? 'Save' : 'Create role'}
					</Button>
				</>
			}
		>
			<Form
				form={form}
				schema={editing ? updateRoleSchema : createRoleSchema}
				initial={{ name: role?.name ?? '', permissions: role?.permissions ?? ['user:read'] }}
				onSubmit={(values) => {
					if (editing && !changed) return;

					return fetchData(values);
				}}
			>
				<Field
					name="name"
					label="Name"
					description="What people see. The key beside it is derived once and never changes."
				>
					<Input autoComplete="off" />
				</Field>

				<Field name="permissions" label="Permissions">
					<PermissionMatrix disabled={loading} />
				</Field>
			</Form>
		</Dialog>
	);
};
