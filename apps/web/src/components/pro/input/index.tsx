import { LumoInput } from '@/components/ui/input';
import type { InputProps } from './types';

/** A single line of text, at the middle height unless told otherwise. */
export const Input = ({ size = 'md', ...props }: InputProps) => (
	<LumoInput size={size} {...props} />
);
