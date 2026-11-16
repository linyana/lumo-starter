import { cn } from '@/lib/utils';
import { CollapsibleIcon, CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger } from './parts';
import type { CollapsibleProps } from './types';

/** One question, and the answer folded under it. */
export const Collapsible = ({
	title,
	children,
	defaultOpen = false,
	disabled = false,
	className,
	classNames,
}: CollapsibleProps) => (
	<CollapsibleRoot defaultOpen={defaultOpen} disabled={disabled}>
		<CollapsibleTrigger className={cn(className, classNames?.trigger)}>
			{title}
			<CollapsibleIcon className={classNames?.icon} />
		</CollapsibleTrigger>
		<CollapsiblePanel className={classNames?.panel}>{children}</CollapsiblePanel>
	</CollapsibleRoot>
);
