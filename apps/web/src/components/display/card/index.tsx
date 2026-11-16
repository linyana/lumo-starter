import { cn } from '@/lib/utils';
import {
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardRoot,
	CardTitle,
} from './parts';
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
		<CardRoot
			size={size}
			bordered={bordered}
			hoverable={hoverable}
			className={cn(className, classNames?.root)}
		>
			{header && (
				<CardHeader className={classNames?.header}>
					{title !== undefined && <CardTitle className={classNames?.title}>{title}</CardTitle>}
					{description !== undefined && (
						<CardDescription className={classNames?.description}>{description}</CardDescription>
					)}
					{action !== undefined && <CardAction className={classNames?.action}>{action}</CardAction>}
				</CardHeader>
			)}
			{children !== undefined && (
				<CardContent className={classNames?.content}>{children}</CardContent>
			)}
			{footer !== undefined && <CardFooter className={classNames?.footer}>{footer}</CardFooter>}
		</CardRoot>
	);
};
