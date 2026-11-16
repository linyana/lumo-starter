import { ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { caret } from '@/lib/control';
import { cn } from '@/lib/utils';

/** The caret, turning with the panel. */
export function AccordionIcon({ className, ...props }: ComponentProps<typeof ChevronRight>) {
	return (
		<ChevronRight
			data-slot="accordion-icon"
			aria-hidden="true"
			className={cn(caret, className)}
			{...props}
		/>
	);
}
