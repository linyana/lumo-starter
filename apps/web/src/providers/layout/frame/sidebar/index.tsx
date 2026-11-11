import { PanelLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Nav, ScrollArea } from '@/components';
import { cn } from '@/lib/utils';
import type { LayoutNavEntry } from '../types';

export type SidebarProps = {
	nav?: LayoutNavEntry[];
	selectedKey?: string;
	onSelect?: (key: string) => void;
	logo?: ReactNode;
	title?: ReactNode;
	/** Controls at the far end of the brand row, before the fold toggle. */
	brandActions?: ReactNode;
	/** Rows pinned above the nav, rendered inside this rail's own nav root. */
	toolbar?: ReactNode;
	/** Rows for the bottom edge, rendered inside this rail's own nav root. */
	footer?: ReactNode;
	/** Whether the rail can narrow to its icons at all. */
	collapsible?: boolean;
	collapsed?: boolean;
	onToggle?: () => void;
	className?: string;
};

const noNav: LayoutNavEntry[] = [];

/**
 * The shell's navigation is what the eye lands on first, so its rows sit a notch above the
 * primitive's density: a 36px row and a 16px glyph — and the glyph at a fixed size rather than
 * the row's `1em`, because here the icon leads the label instead of following it.
 */
const rowColor = cn(
	'text-foreground/70 hover:text-foreground',
	'dark:text-foreground/60 dark:hover:text-foreground dark:data-active:text-accent-foreground',
);
const row = cn('h-9 [&_svg]:size-4', rowColor);
const subRow = cn('h-8 [&_svg]:size-4', rowColor);

/**
 * A strip at one edge of the rail, outside the scroll box: the same padded nav root at either end,
 * because what it holds is rows and rows want the list the nav gives them.
 */
function RailSlot({
	slot,
	compact,
	children,
}: {
	slot: string;
	compact: boolean;
	children: ReactNode;
}) {
	return (
		<div data-slot={slot} className="shrink-0 p-2">
			<Nav compact={compact}>{children}</Nav>
		</div>
	);
}

/**
 * The shell's left rail: a brand row, whatever is pinned above the nav, the nav, and whatever is
 * pinned to the bottom. It paints nothing of its own — the shell's fill shows through, which is what
 * makes it read as grey next to the card rather than as a second surface.
 */
export function Sidebar({ className, collapsed = false, ...props }: SidebarProps) {
	return (
		<aside
			data-slot="layout-sidebar"
			data-collapsed={collapsed ? '' : undefined}
			className={cn(
				'hidden h-full shrink-0 flex-col overflow-hidden md:flex',
				'transition-[width] duration-(--duration-state) ease-linear',
				collapsed ? 'w-12' : 'w-64',
				className,
			)}
		>
			<SidebarContent collapsed={collapsed} {...props} />
		</aside>
	);
}

export function SidebarContent({
	nav = noNav,
	selectedKey,
	onSelect,
	logo,
	title,
	brandActions,
	toolbar,
	footer,
	collapsible = false,
	collapsed = false,
	onToggle,
	className,
}: SidebarProps) {
	return (
		<div
			data-slot="layout-sidebar-content"
			className={cn('flex h-full min-h-0 w-full flex-col', className)}
		>
			{(logo !== undefined || title !== undefined || brandActions !== undefined || collapsible) && (
				<div
					data-slot="layout-brand"
					className={cn(
						'flex shrink-0 items-center gap-2 px-2 text-sm font-semibold [&_svg]:shrink-0',
						// The narrow rail is a single 32px column wide, so its brand controls stand on
						// top of each other instead of beside each other.
						collapsed ? 'flex-col py-2' : 'h-14',
					)}
				>
					{!collapsed && (logo !== undefined || title !== undefined) && (
						<div className="flex min-w-0 flex-1 items-center gap-2 ps-2">
							{logo}
							{title !== undefined && <div className="min-w-0 truncate">{title}</div>}
						</div>
					)}
					{(brandActions !== undefined || collapsible) && (
						<div
							data-slot="layout-brand-actions"
							className={cn('ms-auto flex shrink-0 items-center gap-1', collapsed && 'flex-col')}
						>
							{brandActions}
							{collapsible && (
								<Button
									variant="ghost"
									size="icon"
									aria-label={collapsed ? 'expand sidebar' : 'collapse sidebar'}
									aria-expanded={!collapsed}
									onClick={onToggle}
									icon={<PanelLeft />}
								/>
							)}
						</div>
					)}
				</div>
			)}
			{toolbar !== undefined && (
				<RailSlot slot="layout-toolbar" compact={collapsed}>
					{toolbar}
				</RailSlot>
			)}
			<ScrollArea className="flex-1">
				<Nav
					items={nav}
					compact={collapsed}
					selectedKey={selectedKey}
					onSelect={onSelect}
					classNames={{ button: row, subButton: subRow, badge: 'text-muted-foreground' }}
				/>
			</ScrollArea>
			{footer !== undefined && (
				<RailSlot slot="layout-footer" compact={collapsed}>
					{footer}
				</RailSlot>
			)}
		</div>
	);
}
