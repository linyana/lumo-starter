import { createMemberSchema } from '@lumo/shared';
import { useState } from 'react';
import { membersApi } from '@/api';
import { Button, Dialog, Field, Form, Input, ToggleGroup, useForm } from '@/components';
import { useAssignableRoles, useHttp } from '@/hooks';

type IPropsType = {
	onCreated: () => void;
};

export const CreateMember = ({ onCreated }: IPropsType) => {
	const [open, setOpen] = useState(false);
	const form = useForm();
	const { roles: assignable, loading: rolesLoading } = useAssignableRoles();
	const chooseRoles = assignable.length > 1;

	const { loading, fetchData } = useHttp({
		form,
		endpoint: membersApi.create,
		successMessage: 'Member added',
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
					Add member
				</Button>
			}
			title="New member"
			description="They sign in with this email and the password you set."
			footer={
				<>
					<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button loading={loading} onClick={form.submit}>
						Add member
					</Button>
				</>
			}
		>
			<Form form={form} schema={createMemberSchema} onSubmit={fetchData}>
				<Field
					name="username"
					label="Username"
					description="3–32 characters: lowercase letters, numbers and underscores."
				>
					<Input autoComplete="off" autoCapitalize="none" spellCheck={false} />
				</Field>

				<Field name="email" label="Email">
					<Input type="email" autoComplete="off" />
				</Field>

				<Field
					name="password"
					label="Initial password"
					description="At least 8 characters, mixing letters and numbers."
				>
					<Input type="password" autoComplete="new-password" />
				</Field>

				{chooseRoles ? (
					<Field
						name="roles"
						label="Roles"
						description="Leave empty to start them on the base role."
					>
						<ToggleGroup<string>
							multiple
							variant="outline"
							size="sm"
							loading={loading || rolesLoading}
							items={assignable.map((role) => ({ value: role.key, label: role.name }))}
						/>
					</Field>
				) : (
					<div className="flex flex-col gap-1">
						<p className="text-sm font-medium">Roles</p>
						<p className="text-sm text-muted-foreground">
							{rolesLoading
								? 'Loading the roles you may assign…'
								: assignable.length === 0
									? 'You cannot assign a role here. Ask an owner to add this person.'
									: `${assignable[0]?.name ?? 'Member'} — you cannot choose roles, so this member joins on the base role.`}
						</p>
					</div>
				)}
			</Form>
		</Dialog>
	);
};
