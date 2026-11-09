import { LumoSteps } from '@/components/ui/steps';
import { cn } from '@/lib/utils';
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
	<LumoSteps.Root
		current={current}
		orientation={orientation}
		size={size}
		variant={variant}
		className={cn(className, classNames?.root)}
	>
		{items.map((item, index) => (
			<LumoSteps.Item
				key={index}
				status={item.status}
				icon={item.icon}
				className={cn(classNames?.item, item.className)}
			>
				<LumoSteps.Title className={classNames?.title}>{item.title}</LumoSteps.Title>
				{item.description !== undefined && (
					<LumoSteps.Description className={classNames?.description}>
						{item.description}
					</LumoSteps.Description>
				)}
			</LumoSteps.Item>
		))}
	</LumoSteps.Root>
);
