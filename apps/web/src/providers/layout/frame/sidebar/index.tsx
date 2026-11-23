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
	brandActions?: ReactNode;
	toolbar?: ReactNode;
	footer?: ReactNode;
	collapsible?: boolean;
	collapsed?: boolean;
	onToggle?: () => void;
	className?: string;
};

const noNav: LayoutNavEntry[] = [];

const rowColor = cn(
	'text-foreground/70 hover:text-foreground',
	'dark:text-foreground/60 dark:hover:text-foreground dark:data-active:text-accent-foreground',
);
const row = cn('h-9 [&_svg]:size-4', rowColor);
const subRow = cn('h-8 [&_svg]:size-4', rowColor);

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
									size="icon-sm"
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
