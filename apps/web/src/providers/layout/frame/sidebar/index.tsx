import { PanelLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { LumoButton } from '@/components/ui/button';
import { LumoNav } from '@/components/ui/nav';
import { LumoScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { LayoutNavEntry, LayoutNavItem } from '../types';

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
			<LumoNav.Root compact={compact}>{children}</LumoNav.Root>
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
	const isActive = (key: string, explicit?: boolean) => explicit ?? key === selectedKey;

	function renderItem(item: LayoutNavItem) {
		const active = isActive(item.key, item.isActive);

		if (item.children !== undefined) {
			return (
				<LumoNav.Item key={item.key}>
					<LumoNav.Sub
						icon={item.icon}
						label={item.label}
						className={row}
						isActive={active || item.children.some((child) => isActive(child.key, child.isActive))}
						defaultOpen={item.defaultOpen}
						disabled={item.disabled}
					>
						{item.children.map((child) => (
							<LumoNav.SubItem key={child.key}>
								<LumoNav.SubButton
									icon={child.icon}
									className={subRow}
									isActive={isActive(child.key, child.isActive)}
									disabled={item.disabled || child.disabled}
									href={child.href}
									render={child.render}
									onClick={() => {
										child.onClick?.();
										onSelect?.(child.key);
									}}
								>
									{child.label}
								</LumoNav.SubButton>
							</LumoNav.SubItem>
						))}
					</LumoNav.Sub>
				</LumoNav.Item>
			);
		}

		return (
			<LumoNav.Item key={item.key}>
				<LumoNav.Button
					icon={item.icon}
					label={item.label}
					className={row}
					isActive={active}
					disabled={item.disabled}
					href={item.href}
					render={item.render}
					onClick={() => {
						item.onClick?.();
						onSelect?.(item.key);
					}}
				/>
				{item.badge !== undefined && (
					<LumoNav.Badge className="text-muted-foreground">{item.badge}</LumoNav.Badge>
				)}
			</LumoNav.Item>
		);
	}

	function renderEntry(entry: LayoutNavEntry, index: number) {
		if (entry.type === 'separator') return <LumoNav.Separator key={`separator-${index}`} />;

		if (entry.type === 'skeleton') {
			return (
				<LumoNav.Skeleton key={`skeleton-${index}`} showIcon={entry.showIcon} width={entry.width} />
			);
		}

		if (entry.type === 'group') {
			return (
				<LumoNav.Group key={entry.label ?? `group-${index}`}>
					{entry.label !== undefined && <LumoNav.GroupLabel>{entry.label}</LumoNav.GroupLabel>}
					{entry.action}
					<LumoNav.List>
						{entry.children.map((child, childIndex) => renderEntry(child, childIndex))}
					</LumoNav.List>
				</LumoNav.Group>
			);
		}

		return renderItem(entry);
	}

	/**
	 * Groups are padded; a loose row is not, so a row typed straight into the array would sit
	 * against the rail's edge while its neighbours sit 8px in. Everything outside a group is
	 * wrapped in one, and an unbroken run of them shares a single group instead of gaining a
	 * gap per row.
	 */
	function renderEntries(entries: LayoutNavEntry[]) {
		const blocks = entries.reduce<(LayoutNavEntry | LayoutNavEntry[])[]>((acc, entry) => {
			if (entry.type === 'group' || entry.type === 'separator') return [...acc, entry];

			const last = acc[acc.length - 1];
			return Array.isArray(last) ? [...acc.slice(0, -1), [...last, entry]] : [...acc, [entry]];
		}, []);

		return blocks.map((block, index) =>
			Array.isArray(block) ? (
				<LumoNav.Group
					key={`loose-${block.map((entry) => ('key' in entry ? entry.key : entry.type)).join('-')}`}
				>
					<LumoNav.List>{block.map(renderEntry)}</LumoNav.List>
				</LumoNav.Group>
			) : (
				renderEntry(block, index)
			),
		);
	}

	return (
		<div
			data-slot="layout-sidebar-content"
			className={cn('flex h-full min-h-0 w-full flex-col', className)}
		>
			{(logo !== undefined || title !== undefined || brandActions !== undefined || collapsible) && (
				<div
					data-slot="layout-brand"
					className={cn(
						'flex shrink-0 items-center gap-2 px-2 text-sm font-semibold [&_svg]:size-4 [&_svg]:shrink-0',
						// The narrow rail is a single 32px column wide, so its brand controls stand on
						// top of each other instead of beside each other.
						collapsed ? 'flex-col py-2' : 'h-14',
					)}
				>
					{!collapsed && (logo !== undefined || title !== undefined) && (
						<div className="flex min-w-0 flex-1 items-center gap-2 ps-2">
							{logo}
							{title !== undefined && <span className="truncate">{title}</span>}
						</div>
					)}
					{(brandActions !== undefined || collapsible) && (
						<div
							data-slot="layout-brand-actions"
							className={cn('ms-auto flex shrink-0 items-center gap-1', collapsed && 'flex-col')}
						>
							{brandActions}
							{collapsible && (
								<LumoButton
									variant="ghost"
									size="icon"
									className="size-8 shrink-0"
									aria-label={collapsed ? 'expand sidebar' : 'collapse sidebar'}
									aria-expanded={!collapsed}
									onClick={onToggle}
								>
									<PanelLeft />
								</LumoButton>
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
			<LumoScrollArea.Root className="flex-1">
				<LumoScrollArea.Viewport>
					<LumoScrollArea.Content>
						<LumoNav.Root compact={collapsed}>{renderEntries(nav)}</LumoNav.Root>
					</LumoScrollArea.Content>
				</LumoScrollArea.Viewport>
				<LumoScrollArea.Scrollbar />
			</LumoScrollArea.Root>
			{footer !== undefined && (
				<RailSlot slot="layout-footer" compact={collapsed}>
					{footer}
				</RailSlot>
			)}
		</div>
	);
}
