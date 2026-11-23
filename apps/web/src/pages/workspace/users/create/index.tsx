import { createUserSchema, ROLE_META, ROLES, type Role } from '@lumo/shared';
import { useState } from 'react';
import { usersApi } from '@/api';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
import { useHttp } from '@/hooks';

type IPropsType = {
	onCreated: () => void;
};

export const CreateUser = ({ onCreated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const form = useForm();

	const { 
		loading,
		fetchData,
	} = useHttp({
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
			</Form>
			<div className="grid grid-cols-2 gap-2 mt-6">
				<Button variant="outline" onClick={() => setOpen(false)}>
					Cancel
				</Button>
				<Button loading={loading} onClick={form.submit}>
					Create account
				</Button>
			</div>
		</Dialog>
	);
};
