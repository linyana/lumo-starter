import {
	ROLES,
	ROLE_META,
	updateUserSchema,
	type Role,
	type UpdateUserInput,
	type User,
} from '@lumo/shared';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button, Dialog, Field, Form, type FormErrors, Input, ToggleGroup } from '@/components';
import { errorFields, toFormErrors, toastError } from '@/lib';
import { useHttp } from '@/hooks';
import { updateUser } from '../api';

/** The row being written: the panel starts from it, and the list re-reads once it answers. */
type IPropsType = {
	/** The account the panel is about. */
	user: User;
	/** The signed-in account — its own roles are read-only, which is the API's rule too. */
	currentUserId?: string;
	/** Runs once the request has answered, so the caller can re-read the list. */
	onUpdated: () => void;
};

/** `useHttp` hands one value to its endpoint, and a PATCH names the row in the path. */
const save = ({ id, input }: { id: string; input: UpdateUserInput }): Promise<User> =>
	updateUser(id, input);

/**
 * One row's account: opening the panel starts it from the row, so a stale copy cannot be saved over
 * a newer one. The API holds the rest of the rules — the last owner cannot be demoted, and a reader
 * cannot change its own roles — so those come back as sentences rather than being guessed here.
 */
export const EditUser = ({ user, currentUserId, onUpdated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [roles, setRoles] = useState<Role[]>(user.roles);

	const ownRow = user.id === currentUserId;

	const submit = useHttp(save, {
		onSuccess: () => {
			setOpen(false);
			onUpdated();
		},
		onError: (error) => {
			const fields = errorFields(error);
			if (Object.keys(fields).length > 0) setErrors(fields);
			else toastError(error.message);
		},
	});

	const handleSubmit = (values: Record<string, unknown>): void => {
		// The roles are held here rather than in the form: a group of toggles submits no value.
		const parsed = updateUserSchema.safeParse({
			...values,
			...(ownRow ? {} : { roles }),
		});
		if (!parsed.success) {
			setErrors(toFormErrors(parsed.error));
			return;
		}

		setErrors({});
		submit.fetchData({ id: user.id, input: parsed.data as UpdateUserInput });
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				setErrors({});
				if (next) setRoles(user.roles);
			}}
			trigger={
				<Button variant="ghost" size="sm" icon={<Pencil />}>
					Edit
				</Button>
			}
			title={`Edit ${user.name}`}
			description={user.email}
		>
			<Form errors={errors} onFormSubmit={handleSubmit}>
				<Field name="email" label="Email">
					<Input type="email" autoComplete="off" defaultValue={user.email} />
				</Field>

				<Field name="name" label="Display name">
					<Input autoComplete="off" defaultValue={user.name} />
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
						value={roles}
						disabled={ownRow}
						onValueChange={(value) => {
							setRoles(Array.isArray(value) ? value : value === null ? [] : [value]);
						}}
						items={ROLES.map((role) => ({ value: role, label: ROLE_META[role] }))}
					/>
				</Field>

				<Button type="submit" loading={submit.loading} className="mt-2">
					Save changes
				</Button>
			</Form>
		</Dialog>
	);
};
