import { updateUserSchema, type UpdateUserInput, type User } from '@lumo/shared';
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
import { useHttp, useRoles } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	user: User;
	closePanel: () => void;
	reload: () => void;
};

export const EditUser = ({ user, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const form = useForm();
	const { user: currentUser, refresh } = useAuth();
	const ownRow = user.id === currentUser?.id;
	const changed = useChanged({ form });
	const { roles, loading: rolesLoading } = useRoles();

	const { fetchData, loading } = useHttp({
		form,
		endpoint: (input: UpdateUserInput) => usersApi.update({ id: user.id, input }),
		successMessage: 'Changes saved',
		onSuccess: () => {
			setOpen(false);
			reload();

			// A role change to yourself takes effect on the API at once; re-read the session so this tab
			// stops offering actions the API would now refuse.
			if (ownRow) void refresh();
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
					<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
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
				initial={{
					email: user.email,
					username: user.username,
					name: user.name,
					roles: user.roles.map((role) => role.key),
				}}
				onSubmit={(values) => {
					if (!changed) return;

					return fetchData(values);
				}}
			>
				<Field name="email" label="Email">
					<Input type="email" autoComplete="off" />
				</Field>

				<Field
					name="username"
					label="Username"
					description="3–32 characters: lowercase letters, numbers and underscores."
				>
					<Input autoComplete="off" autoCapitalize="none" spellCheck={false} />
				</Field>

				<Field name="name" label="Display name">
					<Input autoComplete="off" />
				</Field>

				<Field
					name="roles"
					label="Roles"
					description={
						ownRow
							? 'Your own roles. Dropping Owner fails while you are the last one.'
							: 'At least one.'
					}
				>
					<ToggleGroup<string>
						multiple
						variant="outline"
						size="sm"
						loading={loading || rolesLoading}
						items={roles.map((role) => ({ value: role.key, label: role.name }))}
					/>
				</Field>
			</Form>
		</Dialog>
	);
};
