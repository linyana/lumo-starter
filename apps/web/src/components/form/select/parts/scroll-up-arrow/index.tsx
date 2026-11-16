import { Select as BaseSelect } from '@base-ui/react/select';
import { ChevronUp } from 'lucide-react';
import type { ComponentProps } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export const scrollArrowClass = cn(
	'relative flex h-5 w-full shrink-0 cursor-default items-center justify-center',
	'bg-popover text-muted-foreground',
	// The strip is thinner than a comfortable target, so the whole edge it covers answers to it.
	"before:absolute before:inset-0 before:content-['']",
	iconSlot,
);

export type SelectScrollUpArrowProps = ComponentProps<typeof BaseSelect.ScrollUpArrow>;

/** Shown by Base UI while there are rows above the box, on a pointer that can hover. */
export function SelectScrollUpArrow({ className, ...props }: SelectScrollUpArrowProps) {
	return (
		<BaseSelect.ScrollUpArrow
			data-slot="select-scroll-up-arrow"
			className={cn(scrollArrowClass, className)}
			{...props}
		>
			<ChevronUp />
		</BaseSelect.ScrollUpArrow>
	);
}
