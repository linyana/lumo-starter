import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';

export type FieldsetSlots = 'root' | 'legend';

export type FieldsetProps = {
	legend?: ReactNode;
	children: ReactNode;
	className?: string;
	classNames?: SlotClassNames<FieldsetSlots>;
};
