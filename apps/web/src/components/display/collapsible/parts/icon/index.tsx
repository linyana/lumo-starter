import { ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { caret } from '@/lib/control';
import { cn } from '@/lib/utils';

export type CollapsibleIconProps = ComponentProps<typeof ChevronRight>;

/** Caret that turns with the panel. Reads `data-panel-open` off the trigger. */
export function CollapsibleIcon({ className, ...props }: CollapsibleIconProps) {
	return (
		<ChevronRight
			data-slot="collapsible-icon"
			aria-hidden="true"
			className={cn(caret, className)}
			{...props}
		/>
	);
}
