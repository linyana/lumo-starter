import { createUserSchema, ROLES, ROLE_META, type CreateUserInput, type Role } from '@lumo/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button, Dialog, Field, Form, type FormErrors, Input, ToggleGroup } from '@/components';
import { errorFields, toFormErrors, toastError } from '@/lib';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';

/** An account written from the list side: the panel asks, the request answers, the list re-reads. */
type IPropsType = {
	/** Runs once the account exists, so the caller can re-read the list. */
	onCreated: () => void;
};

/**
 * An account made by someone who already may: the panel is the form, and it stays open while the
 * request runs — a rejection about a field lands under that field, anything else takes the toast.
 */
export const CreateUser = ({ onCreated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [roles, setRoles] = useState<Role[]>(['MEMBER']);

	const submit = useHttp({
		fn: usersApi.create,
		onSuccess: () => {
			setOpen(false);
			setRoles(['MEMBER']);
			onCreated();
		},
		onError: (error) => {
			const fields = errorFields(error);
			if (Object.keys(fields).length > 0) setErrors(fields);
			else toastError(error.message);
		},
	});

	const handleSubmit = (values: Record<string, unknown>): void => {
		// The roles are held here rather than in the form: a group of toggles submits no value.
		const parsed = createUserSchema.safeParse({ ...values, roles });
		if (!parsed.success) {
			setErrors(toFormErrors(parsed.error));
			return;
		}

		setErrors({});
		submit.fetchData(parsed.data as CreateUserInput);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setErrors({});
			}}
			trigger={<Button variant="default" size="sm">Invite</Button>}
			title="New account"
			description="They sign in with this email and the password you set."
		>
			<Form errors={errors} onFormSubmit={handleSubmit}>
				<Field name="email" label="Email">
					<Input type="email" autoComplete="off" />
				</Field>

				<Field name="name" label="Display name">
					<Input autoComplete="off" />
				</Field>

				<Field
					name="password"
					label="Initial password"
					description="At least 8 characters, mixing letters and numbers."
				>
					<Input type="password" autoComplete="new-password" />
				</Field>

				<Field name="roles" label="Roles" description="At least one.">
					<ToggleGroup<Role>
						multiple
						variant="outline"
						size="sm"
						value={roles}
						onValueChange={(value) => {
							setRoles(Array.isArray(value) ? value : value === null ? [] : [value]);
						}}
						items={ROLES.map((role) => ({ value: role, label: ROLE_META[role] }))}
					/>
				</Field>

				<Button type="submit" loading={submit.loading} className="mt-2">
					Create account
				</Button>
			</Form>
		</Dialog>
	);
};
