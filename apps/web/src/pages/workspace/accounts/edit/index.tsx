import {
	ROLE_META,
	ROLES,
	updateAccountSchema,
	type Role,
	type UpdateAccountInput,
	type Account,
} from '@lumo/shared';
import { useState } from 'react';
import { accountsApi } from '@/api';
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
	account: Account;
	closePanel: () => void;
	reload: () => void;
};

export const EditAccount = ({ account, closePanel, reload }: IPropsType) => {
	const [open, setOpen] = useState(true);
	const form = useForm();
	const { account: currentAccount } = useAuth();
	const ownRow = account.id === currentAccount?.id;
	const changed = useChanged({ form });

	const { fetchData, loading } = useHttp({
		form,
		endpoint: (input: UpdateAccountInput) => accountsApi.update({ id: account.id, input }),
		successMessage: 'Changes saved',
		onSuccess: () => {
			setOpen(false);
			reload();
		},
	});

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
			onClosed={closePanel}
			title={`Edit ${account.name}`}
			description={account.email}
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
				schema={updateAccountSchema}
				initial={{
					email: account.email,
					username: account.username,
					name: account.name,
					roles: account.roles,
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
						loading={loading}
						disabled={ownRow}
						items={ROLES.map((role) => ({ value: role, label: ROLE_META[role] }))}
					/>
				</Field>
			</Form>
		</Dialog>
	);
};
