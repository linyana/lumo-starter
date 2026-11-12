import {
	ROLES,
	ROLE_META,
	updateUserSchema,
	type Role,
	type UpdateUserInput,
	type User,
} from '@lumo/shared';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';

/** The row being written: the panel starts from it, and the list re-reads once it answers. */
type IPropsType = {
	/** The account the panel is about. */
	user: User;
	/** The signed-in account — its own roles are read-only, which is the API's rule too. */
	currentUserId?: string;
	/** Whether the panel is the one on screen. The row that opened it owns that. */
	open: boolean;
	/** Runs when the panel asks to open or close — on save, too. */
	onOpenChange: (open: boolean) => void;
	/** Runs once the request has answered, so the caller can re-read the list. */
	onUpdated: () => void;
};

/**
 * One row's account: opening the panel starts it from the row, so a stale copy cannot be saved over
 * a newer one. The API holds the rest of the rules — the last owner cannot be demoted, and a reader
 * cannot change its own roles — so those come back as sentences rather than being guessed here.
 *
 * The reader's own roles are shown but not sent: the group is disabled, and the body for that case
 * is the two fields that may change. Assembling it is the screen's business, which is why it is
 * here and not behind a prop.
 */
export const EditUser = ({ user, currentUserId, open, onOpenChange, onUpdated }: IPropsType) => {
	const form = useForm();
	const ownRow = user.id === currentUserId;

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
