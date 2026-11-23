import { cn } from '@/lib/utils';
import { pageVariants } from '@/components/page/variant';
import type { PageProps } from '@/components/page/types';

export type { PageProps, PageSlots, PageVariant } from '@/components/page/types';

export const Page = ({
	variant = 'default',
	title,
	description,
	actions,
	children,
	className,
	classNames,
}: PageProps) => {
	const slots = pageVariants({ variant });
	const heading = title !== undefined || description !== undefined;

	return (
		<div
			data-slot="page"
			data-variant={variant}
			className={cn(slots.root(), classNames?.root, className)}
		>
			{(heading || actions !== undefined) && (
				<header data-slot="page-header" className={cn(slots.header(), classNames?.header)}>
					{heading && (
						<div data-slot="page-heading" className={slots.heading()}>
							{title !== undefined && (
								<h1 className={cn(slots.title(), classNames?.title)}>{title}</h1>
							)}
							{description !== undefined && (
								<p className={cn(slots.description(), classNames?.description)}>{description}</p>
							)}
						</div>
					)}
					{actions !== undefined && (
						<div data-slot="page-actions" className={cn(slots.actions(), classNames?.actions)}>
							{actions}
						</div>
					)}
				</header>
			)}
			{children}
		</div>
	);
};
