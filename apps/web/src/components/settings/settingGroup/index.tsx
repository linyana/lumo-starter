import { nanoid } from 'nanoid';
import { useId, useState } from 'react';
import {
	SettingsGroupList,
	SettingsGroupRoot,
	SettingsGroupRow,
	SettingsGroupTitle,
} from './parts';
import type { SettingsGroupProps } from './types';

export type { SettingsGroupItem, SettingsGroupProps, SettingsGroupWidth } from './types';

export const SettingsGroup = ({
	title,
	items,
	surface = 'white',
	className,
}: SettingsGroupProps) => {
	const titleId = useId();
	const [rowKeyPrefix] = useState(() => nanoid());

	if (items.length === 0) return null;

	return (
		<SettingsGroupRoot
			aria-labelledby={title !== undefined ? titleId : undefined}
			className={className}
		>
			{title !== undefined && <SettingsGroupTitle id={titleId}>{title}</SettingsGroupTitle>}
			<SettingsGroupList surface={surface}>
				{items.map((item, index) => (
					<SettingsGroupRow key={`${rowKeyPrefix}-${index}`} {...item} />
				))}
			</SettingsGroupList>
		</SettingsGroupRoot>
	);
};
