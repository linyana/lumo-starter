import { createUserSchema } from '@lumo/shared';
import { useState } from 'react';
import { usersApi } from '@/api';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
import { useHttp, useRoles } from '@/hooks';

type IPropsType = {
	onCreated: () => void;
};

export const CreateUser = ({ onCreated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const form = useForm();
	const { roles, loading: rolesLoading } = useRoles();

	const { loading, fetchData } = useHttp({
		form,
		endpoint: usersApi.create,
		successMessage: 'Account created',
		onSuccess: () => {
			setOpen(false);
			onCreated();
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
			trigger={
				<Button variant="default" size="sm">
					Create
				</Button>
			}
			title="New account"
			description="They sign in with this email and the password you set."
			footer={
				<>
					<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button loading={loading} onClick={form.submit}>
						Create account
					</Button>
				</>
			}
		>
			<Form
				form={form}
				schema={createUserSchema}
				initial={{ roles: ['MEMBER'] }}
				onSubmit={fetchData}
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
					name="password"
					label="Initial password"
					description="At least 8 characters, mixing letters and numbers."
				>
					<Input type="password" autoComplete="new-password" />
				</Field>

				<Field name="roles" label="Roles" description="At least one.">
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
