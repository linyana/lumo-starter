import { LumoSpinner } from '@/components/ui/spinner';
import type { SpinnerProps } from './types';

/**
 * The loading indicator, at the size of its surroundings by default, and — once a wait runs long
 * enough to be worth naming — the word for it under the ring. It draws no layer of its own: what a
 * wait covers belongs to what is being waited on.
 */
export const Spinner = ({
	size,
	label = 'Loading',
	className,
	caption,
	captionDelay,
}: SpinnerProps) => (
	<LumoSpinner
		size={size}
		label={label}
		className={className}
		caption={caption}
		captionDelay={captionDelay}
	/>
);
