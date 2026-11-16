import {
	Accordion as BaseAccordion,
	type AccordionRootProps as BaseRootProps,
} from '@base-ui/react/accordion';
import { cn } from '@/lib/utils';

export type AccordionRootProps<Value = unknown> = Omit<BaseRootProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A list of folds that share one value: one of them open at a time, or several with `multiple`. Base
 * UI owns the value, the trigger's `aria-expanded`, and the fact that a fold inside this list is one of
 * a set rather than a panel of its own.
 *
 * The rows are divided rather than framed — a hairline between two of them and none at either end,
 * which is the whole of what the list draws. A row is exactly a collapsible's: an answer folded under
 * the question that asks for it, turning the same caret on the same spring.
 */
export function AccordionRoot<Value = unknown>({ className, ...props }: AccordionRootProps<Value>) {
	return (
		<BaseAccordion.Root
			data-slot="accordion"
			className={cn('w-full divide-y divide-border', className)}
			{...props}
		/>
	);
}
