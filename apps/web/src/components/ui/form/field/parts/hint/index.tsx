import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import {
	TooltipPopup,
	TooltipPortal,
	TooltipPositioner,
	TooltipRoot,
	TooltipTrigger,
} from '@/components/ui/overlay/tooltip/parts';
import { cn } from '@/lib/utils';

export type FieldHintProps = {
	children: ReactNode;
	className?: string;
	contentClassName?: string;
};

export function FieldHint({ children, className, contentClassName }: FieldHintProps) {
	return (
		<TooltipRoot>
			<TooltipTrigger
				data-slot="field-hint"
				aria-label="More information"
				className={cn(
					'inline-flex size-3.5 shrink-0 cursor-help items-center justify-center rounded-full',
					'text-muted-foreground transition-colors duration-(--duration-state) hover:text-foreground',
					'focus-visible:text-foreground data-disabled:opacity-50',
					className,
				)}
			>
				<Info className="size-full" aria-hidden />
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipPositioner align="start">
					<TooltipPopup className={contentClassName}>{children}</TooltipPopup>
				</TooltipPositioner>
			</TooltipPortal>
		</TooltipRoot>
	);
}
