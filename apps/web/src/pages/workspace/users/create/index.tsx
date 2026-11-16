import { createUserSchema, ROLES, ROLE_META, type Role } from '@lumo/shared';
import { useState } from 'react';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
import { useHttp } from '@/hooks';
import { usersApi } from '@/api';
type IPropsType = {
	onCreated: () => void;
};

export const CreateUser = ({ onCreated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const form = useForm();

	const submit = useHttp({
		endpoint: usersApi.create,
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
