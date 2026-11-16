import { Select as BaseSelect } from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type SelectIconProps = Omit<ComponentProps<typeof BaseSelect.Icon>, 'children'> & {
	/** Replaces the caret, at the size of the text around it. */
	children?: ReactNode;
};

/**
 * The caret. It owns its turn, because it is the only part that knows the popup is open — the same
 * reason `CollapsibleIcon` owns its own.
 */
export function SelectIcon({ className, children, ...props }: SelectIconProps) {
	return (
		<BaseSelect.Icon
			data-slot="select-icon"
			className={cn(
				'flex shrink-0 items-center text-muted-foreground',
				'transition-transform duration-(--duration-turn) ease-(--ease-overlay)',
				'data-popup-open:rotate-180',
				iconSlot,
				className,
			)}
			{...props}
		>
			{children ?? <ChevronDown />}
		</BaseSelect.Icon>
	);
}
