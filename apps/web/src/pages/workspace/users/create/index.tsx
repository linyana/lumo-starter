import { createUserSchema, ROLES, ROLE_META, type Role } from '@lumo/shared';
import { useState } from 'react';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
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
 *
 * The roles are a field like any other: the toggle group reports through the same `onChange` an
 * input does, so the form holds them and the panel keeps nothing of its own.
 */
export const CreateUser = ({ onCreated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const form = useForm();

	const submit = useHttp({
		fn: usersApi.create,
		onSuccess: () => {
			setOpen(false);
			onCreated();
		},
		onError: form.setApiError,
	});

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
			trigger={
				<Button variant="default" size="sm">
					Invite
				</Button>
			}
			title="New account"
			description="They sign in with this email and the password you set."
		>
			<Form
				form={form}
				schema={createUserSchema}
				initial={{ roles: ['MEMBER'] }}
				onSubmit={submit.fetchData}
			>
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
						items={ROLES.map((role) => ({ value: role, label: ROLE_META[role] }))}
					/>
				</Field>

				<Button loading={submit.loading} onClick={form.submit} className="mt-2">
					Create account
				</Button>
			</Form>
		</Dialog>
	);
};
