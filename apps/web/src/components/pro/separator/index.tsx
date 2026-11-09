import { LumoSeparator } from '@/components/ui/separator';
import type { SeparatorProps } from './types';

/** A line between two regions, horizontal unless told otherwise. */
export const Separator = ({ orientation = 'horizontal', className }: SeparatorProps) => (
	<LumoSeparator orientation={orientation} className={className} />
);
