import { updateMemberSchema, type Member, type UpdateMemberInput } from '@lumo/shared';
import { useState } from 'react';
import { membersApi } from '@/api';
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
import { useAssignableRoles, useHttp } from '@/hooks';
import { useAuth } from '@/providers/auth';

type IPropsType = {
	member: Member;
	closePanel: () => void;
	reload: () => void;
};

export const EditMember = ({ member, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const form = useForm();
	const { user: currentUser, refresh } = useAuth();
	const ownRow = member.id === currentUser?.id;
	const changed = useChanged({ form });
	const { roles: assignable, loading: rolesLoading } = useAssignableRoles();
	const chooseRoles = assignable.length > 1;

	const { fetchData, loading } = useHttp({
		form,
		endpoint: (input: UpdateMemberInput) => membersApi.update({ id: member.id, input }),
		successMessage: 'Changes saved',
		onSuccess: () => {
			setOpen(false);
			reload();

			if (ownRow) void refresh();
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
			onClosed={closePanel}
			title={`Edit ${member.username}`}
			description={member.email}
			footer={
				<>
					<Button variant="outline" disabled={loading} onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Tooltip content="Nothing has changed yet." disabled={changed}>
						<Button
							disabled={!changed}
							focusableWhenDisabled={!changed}
							loading={loading}
							onClick={form.submit}
						>
							Save
						</Button>
					</Tooltip>
				</>
			}
		>
			<Form
				form={form}
				schema={updateMemberSchema}
				initial={{
					email: member.email,
					username: member.username,
					...(chooseRoles ? { roles: member.roles.map((role) => role.key) } : {}),
				}}
				onSubmit={(values) => {
					if (!changed) return;

					return fetchData(values);
				}}
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

				{chooseRoles ? (
					<Field
						name="roles"
						label="Roles"
						description={
							ownRow
								? 'Your own roles. Dropping Owner fails while you are the last one.'
								: 'Only the roles you hold are offered.'
						}
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
								: `${member.roles.map((role) => role.name).join(', ')} — you cannot change roles you cannot read.`}
						</p>
					</div>
				)}
			</Form>
		</Dialog>
	);
};
