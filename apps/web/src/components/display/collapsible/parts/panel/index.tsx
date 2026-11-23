import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type { ComponentProps } from 'react';
import { Transition } from '@/components/display/transition';
import { cn } from '@/lib/utils';

export type CollapsiblePanelProps = Omit<
	ComponentProps<typeof BaseCollapsible.Panel>,
	'className'
> & {
	peek?: number;
	className?: string;
};

export function CollapsiblePanel({
	className,
	peek = 0,
	children,
	...props
}: CollapsiblePanelProps) {
	return (
		<BaseCollapsible.Panel
			keepMounted
			render={({ hidden: _hidden, ...panelProps }, state) => (
				<div
					{...panelProps}
					data-slot="collapsible-panel"
					inert={!state.open}
					className={cn('overflow-clip', className)}
				>
					<Transition height={state.open ? undefined : peek}>{children}</Transition>
				</div>
			)}
			{...props}
		/>
	);
}
