import { cn } from '@/lib/utils';
import { StepsDescription, StepsItem, StepsRoot, StepsTitle } from './parts';
import type { StepsProps } from './types';

/** A sequence of steps as one list: the index makes the ones before it finish and the ones after wait. */
export const Steps = ({
	items,
	current,
	orientation = 'horizontal',
	size = 'md',
	variant = 'numbered',
	className,
	classNames,
}: StepsProps) => (
	<StepsRoot
		current={current}
		orientation={orientation}
		size={size}
		variant={variant}
		className={cn(className, classNames?.root)}
	>
		{items.map((item, index) => (
			<StepsItem
				key={index}
				status={item.status}
				icon={item.icon}
				className={cn(classNames?.item, item.className)}
			>
				<StepsTitle className={classNames?.title}>{item.title}</StepsTitle>
				{item.description !== undefined && (
					<StepsDescription className={classNames?.description}>
						{item.description}
					</StepsDescription>
				)}
			</StepsItem>
		))}
	</StepsRoot>
);
