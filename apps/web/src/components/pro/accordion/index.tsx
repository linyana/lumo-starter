import { LumoAccordion } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { AccordionProps } from './types';

/** A list of folds that share one value: divided rows, one answer open at a time unless `multiple`. */
export const Accordion = ({
	items,
	multiple = false,
	defaultValue,
	className,
	classNames,
}: AccordionProps) => (
	<LumoAccordion.Root
		multiple={multiple}
		defaultValue={defaultValue}
		className={cn(className, classNames?.root)}
	>
		{items.map((item) => (
			<LumoAccordion.Item key={item.value} value={item.value} className={classNames?.item}>
				<LumoAccordion.Header className={classNames?.header}>
					<LumoAccordion.Trigger className={classNames?.trigger}>
						{item.title}
						<LumoAccordion.Icon className={classNames?.icon} />
					</LumoAccordion.Trigger>
				</LumoAccordion.Header>
				<LumoAccordion.Panel className={classNames?.panel}>{item.content}</LumoAccordion.Panel>
			</LumoAccordion.Item>
		))}
	</LumoAccordion.Root>
);
