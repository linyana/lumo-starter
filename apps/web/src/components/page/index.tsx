import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/components/page/types';

export const pageVariants = tv({
	slots: {
		root: 'flex w-full flex-col gap-3',
		header: 'flex flex-wrap items-start gap-x-4 gap-y-2',
		heading: 'flex min-w-0 flex-col gap-1',
		breadcrumb: 'text-xs text-muted-foreground',
		title: 'truncate text-2xl font-semibold',
		description: 'text-sm text-muted-foreground',
		actions: 'ms-auto flex shrink-0 items-center gap-2',
	},
	variants: {
		width: {
			full: {},
			narrow: {
				root: 'mx-auto max-w-[800px]',
				breadcrumb: 'px-4',
				title: 'px-4',
				description: 'px-4',
			},
		},
	},
	defaultVariants: {
		width: 'full',
	},
});

export type PageWidth = NonNullable<VariantProps<typeof pageVariants>['width']>;

export type { PageProps, PageSlots } from '@/components/page/types';

export const Page = ({
	width = 'full',
	breadcrumb,
	title,
	description,
	actions,
	children,
	className,
	classNames,
}: PageProps) => {
	const slots = pageVariants({ width });
	const heading = breadcrumb !== undefined || title !== undefined || description !== undefined;

	return (
		<div
			data-slot="page"
			data-width={width}
			className={cn(slots.root(), classNames?.root, className)}
		>
			{(heading || actions !== undefined) && (
				<header data-slot="page-header" className={cn(slots.header(), classNames?.header)}>
					{heading && (
						<div data-slot="page-heading" className={cn(slots.heading(), classNames?.heading)}>
							{breadcrumb !== undefined && (
								<div className={cn(slots.breadcrumb(), classNames?.breadcrumb)}>{breadcrumb}</div>
							)}
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
