import { nanoid } from 'nanoid';
import { useId, useState } from 'react';
import { SettingsGroupList, SettingsGroupRoot, SettingsGroupRow, SettingsGroupTitle } from './parts';
import type { SettingsGroupProps } from './types';

export type { SettingsGroupItem, SettingsGroupProps } from './types';

export const SettingsGroup = ({ title, items, className }: SettingsGroupProps) => {
	const titleId = useId();
	const [rowKeyPrefix] = useState(() => nanoid());

	if (items.length === 0) return null;

	return (
		<SettingsGroupRoot
			aria-labelledby={title !== undefined ? titleId : undefined}
			className="text-"
		>
			{title !== undefined && <SettingsGroupTitle id={titleId}>{title}</SettingsGroupTitle>}
			<SettingsGroupList>
				{items.map((item, index) => (
					<SettingsGroupRow key={`${rowKeyPrefix}-${index}`} {...item} />
				))}
			</SettingsGroupList>
		</SettingsGroupRoot>
	);
};
