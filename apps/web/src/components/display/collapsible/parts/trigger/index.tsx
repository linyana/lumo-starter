import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type { ComponentProps } from 'react';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';

export type CollapsibleTriggerProps = ComponentProps<typeof BaseCollapsible.Trigger>;

export function CollapsibleTrigger({ className, ...props }: CollapsibleTriggerProps) {
	return (
		<BaseCollapsible.Trigger
			data-slot="collapsible-trigger"
			className={cn(
				'group relative flex w-full cursor-pointer items-center justify-between gap-2',
				'rounded-md px-3 py-2 text-left text-sm font-medium select-none',
				stateLayer,
				'data-disabled:pointer-events-none data-disabled:opacity-50',
				iconSlot,
				className,
			)}
			{...props}
		/>
	);
}
