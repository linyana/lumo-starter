import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type HeaderProps = Omit<ComponentProps<'header'>, 'title'> & {
	/** The page's own name. A page draws this itself — the shell never holds one. */
	title?: ReactNode;
	description?: ReactNode;
	/** Trailing controls, pushed to the far edge. */
	actions?: ReactNode;
};

/**
 * The page's header, drawn inside the surface so it scrolls with nothing: it sticks to the top
 * of the scroll container. Its chrome uses the shell's fill in light mode and the containing
 * surface's fill in dark mode.
 */
export function Header({
	title,
	description,
	actions,
	className,
	children,
	...props
}: HeaderProps) {
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
					{title !== undefined && (
						<h1 className="truncate text-sm font-semibold">{title}</h1>
					)}
					{description !== undefined && (
						<p className="truncate text-xs text-muted-foreground">{description}</p>
					)}
				</div>
			)}
			{children}
			{actions !== undefined && (
				<div
					data-slot="layout-header-actions"
					className="ms-auto flex shrink-0 items-center gap-2"
				>
					{actions}
				</div>
			)}
		</header>
	);
}
