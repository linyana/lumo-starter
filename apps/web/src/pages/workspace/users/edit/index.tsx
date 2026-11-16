import {
	ROLE_META,
	ROLES,
	updateUserSchema,
	type Role,
	type UpdateUserInput,
	type User,
} from '@lumo/shared';
import { usersApi } from '@/api';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
import { useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated: () => void;
};

export const EditUser = ({ user, open, onOpenChange, onUpdated }: IPropsType) => {
	const form = useForm();
	const { user: currentUser } = useAuth();
	const ownRow = user.id === currentUser?.id;

	const submit = useHttp({
		endpoint: (input: UpdateUserInput) => usersApi.update({ id: user.id, input }),
		onSuccess: () => {
			onOpenChange(false);
			onUpdated();
		},
		onError: form.setApiError,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
			title={`Edit ${user.name}`}
			description={user.email}
		>
			<Form
				form={form}
				schema={updateUserSchema}
				initial={{ email: user.email, name: user.name, roles: user.roles }}
				onSubmit={(values) =>
					submit.fetchData(ownRow ? { email: values.email, name: values.name } : values)
				}
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

				<Button loading={submit.loading} onClick={form.submit} className="mt-2">
					Save changes
				</Button>
			</Form>
		</Dialog>
	);
};
