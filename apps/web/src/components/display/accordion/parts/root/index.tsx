import {
	Accordion as BaseAccordion,
	type AccordionRootProps as BaseRootProps,
} from '@base-ui/react/accordion';
import { cn } from '@/lib/utils';

export type AccordionRootProps<Value = unknown> = Omit<BaseRootProps<Value>, 'className'> & {
	className?: string;
};

export function AccordionRoot<Value = unknown>({ className, ...props }: AccordionRootProps<Value>) {
	return (
		<BaseAccordion.Root
			data-slot="accordion"
			className={cn('w-full divide-y divide-border', className)}
			{...props}
		/>
	);
}
