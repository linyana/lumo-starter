import { LumoCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CardProps } from './types';

/** One surface for one subject: a header, a body, and a footer on the bottom edge. */
export const Card = ({
	title,
	description,
	action,
	footer,
	children,
	size = 'md',
	bordered = false,
	hoverable = false,
	className,
	classNames,
}: CardProps) => {
	const header = title !== undefined || description !== undefined || action !== undefined;

	return (
		<LumoCard.Root
			size={size}
			bordered={bordered}
			hoverable={hoverable}
			className={cn(className, classNames?.root)}
		>
			{header && (
				<LumoCard.Header className={classNames?.header}>
					{title !== undefined && (
						<LumoCard.Title className={classNames?.title}>{title}</LumoCard.Title>
					)}
					{description !== undefined && (
						<LumoCard.Description className={classNames?.description}>
							{description}
						</LumoCard.Description>
					)}
					{action !== undefined && (
						<LumoCard.Action className={classNames?.action}>{action}</LumoCard.Action>
					)}
				</LumoCard.Header>
			)}
			{children !== undefined && (
				<LumoCard.Content className={classNames?.content}>{children}</LumoCard.Content>
			)}
			{footer !== undefined && (
				<LumoCard.Footer className={classNames?.footer}>{footer}</LumoCard.Footer>
			)}
		</LumoCard.Root>
	);
};
