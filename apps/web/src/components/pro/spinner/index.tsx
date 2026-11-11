import { LumoSpinner } from '@/components/ui/spinner';
import type { SpinnerProps } from './types';

/**
 * The loading indicator, at the size of its surroundings by default. Given `mask`, it becomes the
 * wait itself: a layer over the nearest positioned ancestor that keeps what it is covering on the
 * screen, and — once the wait is long enough to name — the caption under the ring.
 */
export const Spinner = ({
	size,
	label = 'Loading',
	className,
	mask,
	caption,
	captionDelay,
}: SpinnerProps) => (
	<LumoSpinner
		size={size}
		label={label}
		className={className}
		mask={mask}
		caption={caption}
		captionDelay={captionDelay}
	/>
);
