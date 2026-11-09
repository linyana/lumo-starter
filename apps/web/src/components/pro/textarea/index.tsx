import { LumoTextarea } from '@/components/ui/textarea';
import type { TextareaProps } from './types';

/** Several lines of text, at the middle height unless told otherwise. */
export const Textarea = ({ size = 'md', ...props }: TextareaProps) => (
	<LumoTextarea size={size} {...props} />
);
