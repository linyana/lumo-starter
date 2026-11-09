import type { ReactNode } from 'react';
import type { SlotClassNames } from '../types';

export type FieldsetSlots = 'root' | 'legend';

export type FieldsetProps = {
	/** The heading over the fields — louder than a single field's label. */
	legend?: ReactNode;
	children: ReactNode;
	className?: string;
	classNames?: SlotClassNames<FieldsetSlots>;
};
