import { LumoSpinner } from '@/components/ui/spinner';
import type { SpinnerProps } from './types';

/** The loading indicator, at the size of its surroundings by default. */
export const Spinner = ({ size, label = 'Loading', className }: SpinnerProps) => (
	<LumoSpinner size={size} label={label} className={className} />
);
