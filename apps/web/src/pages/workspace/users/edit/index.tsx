import {
	ROLE_META,
	ROLES,
	updateUserSchema,
	type Role,
	type UpdateUserInput,
	type User,
} from '@lumo/shared';
import { useState } from 'react';
import { usersApi } from '@/api';
import {
	Button,
	Dialog,
	Field,
	Form,
	Input,
	ToggleGroup,
	Tooltip,
	useChanged,
	useForm,
} from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	user: User;
	closePanel: () => void;
	reload: () => void;
};

export const EditUser = ({ user, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const form = useForm();
	const { user: currentUser } = useAuth();
	const ownRow = user.id === currentUser?.id;
	const changed = useChanged({ form });

	const { fetchData, loading } = useHttp({
		form,
		endpoint: (input: UpdateUserInput) => usersApi.update({ id: user.id, input }),
		successMessage: 'Changes saved',
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
			title={`Edit ${user.name}`}
			description={user.email}
			footer={
				<>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Tooltip content="Nothing has changed yet." disabled={changed}>
						<Button
							disabled={!changed}
							focusableWhenDisabled={!changed}
							loading={loading}
							onClick={form.submit}
						>
							Save
						</Button>
					</Tooltip>
				</>
			}
		>
			<Form
				form={form}
				schema={updateUserSchema}
				initial={{ email: user.email, name: user.name, roles: user.roles }}
				onSubmit={(values) => {
					if (!changed) return;

					return fetchData(values);
				}}
			>
				<Field name="email" label="Email">
					<Input type="email" autoComplete="off" />
				</Field>

				<Field name="name" label="Display name">
					<Input autoComplete="off" />
				</Field>

				<Field
					name="roles"
					label="Roles"
					description={ownRow ? 'You cannot change your own roles.' : 'At least one.'}
				>
					<ToggleGroup<Role>
						multiple
						variant="outline"
						size="sm"
						disabled={ownRow}
						items={ROLES.map((role) => ({ value: role, label: ROLE_META[role] }))}
					/>
				</Field>
			</Form>
		</Dialog>
	);
};
