import { LumoCollapsible } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
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
	<LumoCollapsible.Root defaultOpen={defaultOpen} disabled={disabled}>
		<LumoCollapsible.Trigger className={cn(className, classNames?.trigger)}>
			{title}
			<LumoCollapsible.Icon className={classNames?.icon} />
		</LumoCollapsible.Trigger>
		<LumoCollapsible.Panel className={classNames?.panel}>{children}</LumoCollapsible.Panel>
	</LumoCollapsible.Root>
);
