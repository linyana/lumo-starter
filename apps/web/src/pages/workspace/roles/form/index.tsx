import {
	createRoleSchema,
	DESCRIPTION_MAX,
	NAME_MAX,
	updateRoleSchema,
	type CreateRoleInput,
	type UpdateRoleInput,
} from '@lumo/shared';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { rolesApi } from '@/api';
import { Button, Field, Form, Input, Spinner, useChanged, useForm, useWatch } from '@/components';
import { useHttp } from '@/hooks';
import { workspaceHref } from '@/lib';
import { useAuth } from '@/providers/auth';
import { DeleteRole } from '../delete';
import { Capabilities } from './capabilities';

const counterOf = ({ value, max }: { value: string | undefined; max: number }) => (
	<span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs tabular-nums text-muted-foreground">
		{(value ?? '').length}/{max}
	</span>
);

export const RoleFormPage = () => {
	const { id } = useParams<{ id: string }>();
	const { workspace } = useAuth();
	const navigate = useNavigate();
	const form = useForm();
	const changed = useChanged({ form });
	const [deleting, setDeleting] = useState(false);

	const editing = id !== undefined;

	const {
		data: role,
		error,
		initial: loading,
		fetchData: loadRole,
	} = useHttp({ endpoint: () => rolesApi.get(id ?? '') });

	useEffect(() => {
		if (id !== undefined) void loadRole();
	}, [id, loadRole]);

	const name = useWatch<string>({ form, name: 'name' });
	const description = useWatch<string>({ form, name: 'description' });

	const listHref =
		workspace === null ? '/' : workspaceHref({ slug: workspace.slug, path: 'settings/roles' });

	const { fetchData, loading: saving } = useHttp({
		form,
		endpoint: (input: CreateRoleInput | UpdateRoleInput) =>
			role === null
				? rolesApi.create(input as CreateRoleInput)
				: rolesApi.update({ id: role.id, input }),
		successMessage: editing ? 'Role saved' : 'Role created',
		onSuccess: () => {
			navigate(listHref);
		},
	});

	if (editing && loading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Spinner size={1} label="Loading role" />
				Loading role…
			</div>
		);
	}

	if (editing && role === null) {
		return (
			<div className="space-y-2">
				<h1 className="text-xl font-semibold">That role is not available</h1>
				<p className="text-sm text-muted-foreground">
					{error?.message ?? 'It was deleted, or it belongs to another workspace.'}
				</p>
				<Link className="text-sm underline underline-offset-4" to={listHref}>
					Back to roles
				</Link>
			</div>
		);
	}

	const save =
		editing && role !== null ? (
			<Button
				disabled={!changed}
				focusableWhenDisabled={!changed}
				loading={saving}
				onClick={form.submit}
			>
				Save
			</Button>
		) : (
			<Button loading={saving} onClick={form.submit}>
				Create role
			</Button>
		);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 space-y-1">
					<Link
						to={listHref}
						className="text-xs text-muted-foreground underline-offset-4 hover:underline"
					>
						Roles
					</Link>
					<h1 className="text-xl font-semibold">
						{role === null ? 'Add role' : `Edit ${role.name}`}
					</h1>
					<p className="text-sm text-muted-foreground">
						A role is a named set of permissions. Changes reach everyone holding it on their next
						request.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="outline" disabled={saving} onClick={() => navigate(listHref)}>
						Cancel
					</Button>
					{save}
				</div>
			</div>

			<Form
				form={form}
				schema={editing ? updateRoleSchema : createRoleSchema}
				initial={{
					name: role?.name ?? '',
					description: role?.description ?? '',
					permissions: role?.permissions ?? [],
				}}
				onSubmit={(values) => fetchData(values)}
			>
				<section className="space-y-3 rounded-lg border border-border bg-card p-4">
					<Field
						name="name"
						label="Name"
						description="What people see. Its key is derived once and never changes."
					>
						<div className="relative">
							<Input autoComplete="off" maxLength={NAME_MAX} classNames={{ input: 'pe-16' }} />
							{counterOf({ value: name, max: NAME_MAX })}
						</div>
					</Field>

					<Field
						name="description"
						label="Description"
						description="Optional. Say what this role is for, so the next person does not have to guess."
					>
						<div className="relative">
							<Input
								autoComplete="off"
								maxLength={DESCRIPTION_MAX}
								classNames={{ input: 'pe-20' }}
							/>
							{counterOf({ value: description, max: DESCRIPTION_MAX })}
						</div>
					</Field>
				</section>

				<section className="space-y-3 rounded-lg border border-border bg-card p-4">
					<div>
						<h2 className="text-sm font-medium">Permissions</h2>
						<p className="text-xs text-muted-foreground">
							Tick what this role may do. A group header takes every permission under it.
						</p>
					</div>

					<Field name="permissions">
						<Capabilities disabled={saving} />
					</Field>
				</section>
			</Form>

			{role !== null && (
				<section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
					<div>
						<h2 className="text-sm font-medium">Delete this role</h2>
						<p className="text-xs text-muted-foreground">
							Everyone holding it loses what it granted on their next request.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setDeleting(true)}>
						Delete role
					</Button>
				</section>
			)}

			{deleting && role !== null && (
				<DeleteRole
					role={role}
					closePanel={() => setDeleting(false)}
					reload={() => navigate(listHref)}
				/>
			)}
		</div>
	);
};
