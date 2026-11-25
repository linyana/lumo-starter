import {
	groupedPermissions,
	PERMISSION_META,
	PERMISSION_RESOURCE_META,
	resourceOf,
	type Permission,
} from '@lumo/shared';
import { useState } from 'react';
import { ToggleGroup } from '@/components';

type IPropsType = {
	defaultValue?: Permission[];
	onChange?: (next: Permission[]) => void;
	disabled?: boolean;
};

export const PermissionMatrix = ({ defaultValue, onChange, disabled }: IPropsType) => {
	const [value, setValue] = useState<Permission[]>(defaultValue ?? []);

	const toggle = ({ resource, next }: { resource: string; next: Permission[] }): void => {
		const merged = [...value.filter((permission) => resourceOf(permission) !== resource), ...next];
		setValue(merged);
		onChange?.(merged);
	};

	return (
		<div className="flex flex-col gap-3">
			{groupedPermissions().map(({ resource, permissions }) => (
				<div key={resource} className="flex flex-col gap-1">
					<p className="text-xs font-medium text-muted-foreground">
						{PERMISSION_RESOURCE_META[resource]}
					</p>
					<ToggleGroup<Permission>
						multiple
						variant="outline"
						size="sm"
						disabled={disabled}
						value={value.filter((permission) => resourceOf(permission) === resource)}
						onChange={(next) => toggle({ resource, next })}
						items={permissions.map((permission) => ({
							value: permission,
							label: PERMISSION_META[permission],
						}))}
					/>
				</div>
			))}
		</div>
	);
};
