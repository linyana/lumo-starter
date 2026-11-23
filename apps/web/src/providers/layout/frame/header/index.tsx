import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type IPropsType = Omit<ComponentProps<'header'>, 'title'> & {
	title?: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
};

export function Header({ title, description, actions, className, children, ...props }: IPropsType) {
	return (
		<header
			data-slot="layout-header"
			className={cn(
				'sticky top-0 z-10 flex min-h-14 shrink-0 flex-wrap items-center gap-x-4 gap-y-2',
				'border-b bg-layout-background px-6 py-3 dark:bg-inherit',
				className,
			)}
			{...props}
		>
			{(title !== undefined || description !== undefined) && (
				<div data-slot="layout-header-text" className="flex min-w-0 flex-col gap-0.5">
					{title !== undefined && <h1 className="truncate text-sm font-semibold">{title}</h1>}
					{description !== undefined && (
						<p className="truncate text-xs text-muted-foreground">{description}</p>
					)}
				</div>
			)}
			{children}
			{actions !== undefined && (
				<div data-slot="layout-header-actions" className="ms-auto flex shrink-0 items-center gap-2">
					{actions}
				</div>
			)}
		</header>
	);
}
