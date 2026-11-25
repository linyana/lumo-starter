import {
	groupedPermissions,
	PERMISSIONS,
	PERMISSION_META,
	PERMISSION_RESOURCE_META,
	type Permission,
	type PermissionResource,
} from '@lumo/shared';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { Button, Checkbox, Input } from '@/components';
import { cn } from '@/lib/utils';

type IPropsType = {
	defaultValue?: Permission[];
	onChange?: (next: Permission[]) => void;
	disabled?: boolean;
};

const inCatalogOrder = (permissions: Iterable<Permission>): Permission[] => {
	const kept = new Set(permissions);
	return PERMISSIONS.filter((permission) => kept.has(permission));
};

const matches = ({ permission, query }: { permission: Permission; query: string }): boolean => {
	const needle = query.trim().toLowerCase();
	return needle === '' || PERMISSION_META[permission].toLowerCase().includes(needle);
};

export const Capabilities = ({ defaultValue, onChange, disabled }: IPropsType) => {
	const [value, setValue] = useState<Permission[]>(defaultValue ?? []);
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState<PermissionResource[]>(() =>
		groupedPermissions().map((group) => group.resource),
	);
	const prefix = useId();

	const groups = groupedPermissions();
	const shown = groups
		.map((group) => ({
			...group,
			permissions: group.permissions.filter((permission) => matches({ permission, query })),
		}))
		.filter((group) => group.permissions.length > 0);

	const commit = (next: Permission[]): void => {
		const ordered = inCatalogOrder(next);
		setValue(ordered);
		onChange?.(ordered);
	};

	const togglePermission = ({
		permission,
		checked,
	}: {
		permission: Permission;
		checked: boolean;
	}) => commit(checked ? [...value, permission] : value.filter((one) => one !== permission));

	const toggleGroup = ({
		resource,
		checked,
	}: {
		resource: PermissionResource;
		checked: boolean;
	}) => {
		const row = groups.find((group) => group.resource === resource)?.permissions ?? [];

		commit(checked ? [...value, ...row] : value.filter((permission) => !row.includes(permission)));
	};

	const heldOf = (resource: PermissionResource): number => {
		const row = groups.find((group) => group.resource === resource)?.permissions ?? [];
		return row.filter((permission) => value.includes(permission)).length;
	};

	const totalOf = (resource: PermissionResource): number =>
		groups.find((group) => group.resource === resource)?.permissions.length ?? 0;

	const all = value.length === PERMISSIONS.length;
	const some = value.length > 0 && !all;
	const expanded = (resource: PermissionResource): boolean =>
		query.trim() !== '' || open.includes(resource);
	const allOpen = open.length === groups.length;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Input
					type="search"
					aria-label="Search permissions"
					placeholder="Search permissions"
					value={query}
					disabled={disabled}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') event.preventDefault();
					}}
				/>
				<Button
					variant="ghost"
					size="sm"
					className="shrink-0"
					onClick={() => setOpen(allOpen ? [] : groups.map((group) => group.resource))}
				>
					{allOpen ? 'Collapse all' : 'Expand all'}
				</Button>
			</div>

			<div className="rounded-lg border border-border">
				<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
					<Checkbox
						id={`${prefix}-all`}
						label="Select all permissions"
						value={all}
						indeterminate={some}
						disabled={disabled}
						onChange={(checked) => commit(checked ? [...PERMISSIONS] : [])}
					/>
					<span className="text-xs tabular-nums text-muted-foreground">
						{value.length}/{PERMISSIONS.length}
					</span>
				</div>

				{shown.map(({ resource, permissions }) => {
					const held = heldOf(resource);
					const total = totalOf(resource);
					const isOpen = expanded(resource);
					const rowId = `${prefix}-${resource}-all`;
					const listId = `${prefix}-${resource}-list`;

					return (
						<div key={resource} className="border-b border-border last:border-b-0">
							<div className="flex items-center gap-3 px-3">
								<Checkbox
									id={rowId}
									aria-label={`${PERMISSION_RESOURCE_META[resource]}: every permission`}
									value={held === total}
									indeterminate={held > 0 && held < total}
									disabled={disabled}
									onChange={(checked) => toggleGroup({ resource, checked })}
								/>
								<button
									type="button"
									aria-expanded={isOpen}
									aria-controls={listId}
									onClick={() =>
										setOpen((current) =>
											current.includes(resource)
												? current.filter((one) => one !== resource)
												: [...current, resource],
										)
									}
									className="flex min-w-0 flex-1 items-center gap-2 py-2 text-start text-sm"
								>
									<span className="min-w-0 flex-1 truncate">
										{PERMISSION_RESOURCE_META[resource]}
									</span>
									<span className="text-xs tabular-nums text-muted-foreground">
										{held}/{total}
									</span>
									<ChevronDown
										aria-hidden="true"
										className={cn(
											'size-4 shrink-0 text-muted-foreground transition-transform',
											isOpen && 'rotate-180',
										)}
									/>
								</button>
							</div>

							{isOpen && (
								<ul id={listId} className="space-y-2 px-3 pb-3 ps-9">
									{permissions.map((permission) => (
										<li key={permission}>
											<Checkbox
												label={PERMISSION_META[permission]}
												value={value.includes(permission)}
												disabled={disabled}
												onChange={(checked) => togglePermission({ permission, checked })}
											/>
										</li>
									))}
								</ul>
							)}
						</div>
					);
				})}

				{shown.length === 0 && (
					<p className="px-3 py-6 text-center text-sm text-muted-foreground">
						Nothing matches “{query}”.
					</p>
				)}
			</div>
		</div>
	);
};
