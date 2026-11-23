import { cn } from '@/lib/utils';
import {
	AccordionHeader,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	AccordionRoot,
	AccordionTrigger,
} from './parts';
import type { AccordionProps } from './types';

export const Accordion = ({
	items,
	multiple = false,
	defaultValue,
	className,
	classNames,
}: AccordionProps) => (
	<AccordionRoot
		multiple={multiple}
		defaultValue={defaultValue}
		className={cn(className, classNames?.root)}
	>
		{items.map((item) => (
			<AccordionItem key={item.value} value={item.value} className={classNames?.item}>
				<AccordionHeader className={classNames?.header}>
					<AccordionTrigger className={classNames?.trigger}>
						{item.title}
						<AccordionIcon className={classNames?.icon} />
					</AccordionTrigger>
				</AccordionHeader>
				<AccordionPanel className={classNames?.panel}>{item.content}</AccordionPanel>
			</AccordionItem>
		))}
	</AccordionRoot>
);
