import {
	ROLE_META,
	ROLES,
	updateUserFormSchema,
	type Role,
	type UpdateUserInput,
	type User,
} from '@lumo/shared';
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
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated: () => void;
};

export const EditUser = ({ user, open, onOpenChange, onUpdated }: IPropsType) => {
	const form = useForm();
	const { user: currentUser } = useAuth();
	const ownRow = user.id === currentUser?.id;
	const changed = useChanged({ form });

	const submit = useHttp({
		endpoint: (input: UpdateUserInput) => usersApi.update({ id: user.id, input }),
		successMessage: 'Changes saved',
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
				schema={updateUserFormSchema}
				initial={{ email: user.email, name: user.name, roles: user.roles }}
				onSubmit={(values) => {
					// A field that is focused submits the form on Enter, which never passes the disabled button.
					if (!changed) return;

					return submit.fetchData(values);
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

				<Tooltip content="Nothing has changed yet." disabled={changed}>
					<Button
						disabled={!changed}
						focusableWhenDisabled={!changed}
						loading={submit.loading}
						onClick={form.submit}
						className="mt-2"
					>
						Save changes
					</Button>
				</Tooltip>
			</Form>
		</Dialog>
	);
};
