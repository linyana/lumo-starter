import { LumoTransition } from '@/components/ui/transition';
import type { TransitionProps } from './types';

/** A box that keeps its size to what is inside it and glides to each new one. */
export const Transition = ({ children, height, className }: TransitionProps) => (
	<LumoTransition height={height} className={className}>
		{children}
	</LumoTransition>
);
