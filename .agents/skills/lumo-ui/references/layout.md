# layout

> The responsive app shell: one nav array draws a desktop rail and a mobile navigation drawer, beside the surface a page scrolls in. Choosing a destination closes the drawer without changing the desktop collapse state. Variant `default` insets the desktop surface as a card; `plain` lets the page run edge to edge. Each page keeps its own header.

## install

```bash
bunx shadcn@latest add @lumo/layout
```

- payload: `/r/layout.json`
- docs page: `/layout`
- comes with it: `@lumo/utils`, `@lumo/button`, `@lumo/nav`, `@lumo/scroll-area`, `@lumo/drawer`
- npm packages: `lucide-react`, `tailwind-variants`
- lands in: 6 files under the project's `aliases.components`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/blocks/layout/index.tsx

```tsx
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ComponentProps,
	type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { Content } from './content';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNavigation } from './mobile';
import type { LayoutNavEntry } from './types';

export const layoutVariants = tv({
	slots: {
		// The shell's fill is the sidebar's: nothing paints the rail, and in `default` the card
		// rises above the same colour, so one token covers both.
		root: 'flex h-svh w-full overflow-hidden bg-layout-background',
		main: 'flex min-h-0 min-w-0 flex-1 flex-col',
		// `relative` makes the scroll box a containing block: an absolutely positioned descendant —
		// Base UI's hidden checkbox input, most of the time — would otherwise sit against the initial
		// containing block, escape this box's clipping and give the document a scrollbar of its own.
		surface: 'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto',
	},
	variants: {
		variant: {
			/** A rail, then a card inset on every edge. */
			default: {
				main: 'md:p-2 md:ps-0',
				surface: 'bg-layout-content text-card-foreground md:rounded-xl',
			},
			/** A rail only: the content is the page, edge to edge. */
			plain: {
				surface: 'bg-layout-content',
			},
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

// `onSelect` is a div's own event; here the name belongs to the nav, so the DOM handler goes.
export type LayoutProps = Omit<ComponentProps<'div'>, 'title' | 'onSelect'> & {
	variant?: VariantProps<typeof layoutVariants>['variant'];
	/** Shared by the desktop rail and the mobile drawer. Supplying it enables mobile navigation. */
	nav?: LayoutNavEntry[];
	selectedKey?: string;
	onSelect?: (key: string) => void;
	/** The brand mark in the rail's top-left, sized to its text. */
	logo?: ReactNode;
	title?: ReactNode;
	/** Controls at the far end of the brand row, before the fold toggle — a theme switch, a tint. */
	brandActions?: ReactNode;
	/**
	 * Pinned above the nav, under the brand row: a search trigger, a filter — a control the list
	 * should not scroll past.
	 */
	toolbar?: ReactNode;
	/** Pinned to the rail's bottom edge: a version, a status, a link. */
	footer?: ReactNode;
	/** Lets the rail narrow to its icons: the brand row carries the toggle, and cmd/ctrl+b does it. */
	collapsible?: boolean;
	/** Opens narrowed. The uncontrolled starting point — store it yourself in `onCollapsedChange`. */
	defaultCollapsed?: boolean;
	/** Controlled; pass `onCollapsedChange` to keep it. */
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/**
	 * Scroll the surface back to the top whenever this changes — a route's path, most of the time.
	 * The shell owns the box that scrolls, so the shell is what puts it back; a page has no way to.
	 */
	resetScrollKey?: string;
};

function LayoutRoot({
	variant = 'default',
	nav,
	selectedKey,
	onSelect,
	logo,
	title,
	brandActions,
	toolbar,
	footer,
	collapsible = false,
	defaultCollapsed = false,
	collapsed,
	onCollapsedChange,
	resetScrollKey,
	className,
	children,
	...props
}: LayoutProps) {
	const { root, main, surface } = layoutVariants({ variant });
	const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
	const isCollapsed = collapsed ?? uncontrolled;
	const surfaceRef = useRef<HTMLElement>(null);
	const shownKey = useRef(resetScrollKey);

	// Before paint, so the page arriving is never seen at the height of the one leaving. Only a change
	// scrolls: a shell that is mounted is already at the top of whatever it was opened on.
	useLayoutEffect(() => {
		if (shownKey.current === resetScrollKey) return;
		shownKey.current = resetScrollKey;
		surfaceRef.current?.scrollTo({ top: 0, behavior: 'instant' });
	}, [resetScrollKey]);

	const toggle = useCallback(() => {
		const next = !isCollapsed;
		setUncontrolled(next);
		onCollapsedChange?.(next);
	}, [isCollapsed, onCollapsedChange]);

	// The rail's own shortcut: chrome behaviour, so the shell owns it — but only when it asked
	// to be collapsible, and only the state, never where that state is remembered.
	useEffect(() => {
		if (!collapsible) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggle();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [collapsible, toggle]);

	return (
		<div
			data-slot="layout"
			data-variant={variant}
			data-collapsed={isCollapsed ? '' : undefined}
			className={cn(root(), className)}
			{...props}
		>
			<Sidebar
				nav={nav}
				selectedKey={selectedKey}
				onSelect={onSelect}
				logo={logo}
				title={title}
				brandActions={brandActions}
				toolbar={toolbar}
				footer={footer}
				collapsible={collapsible}
				collapsed={isCollapsed}
				onToggle={toggle}
			/>
			<div data-slot="layout-main" className={main()}>
				{nav !== undefined && (
					<MobileNavigation
						nav={nav}
						selectedKey={selectedKey}
						onSelect={onSelect}
						logo={logo}
						title={title}
						brandActions={brandActions}
						toolbar={toolbar}
						footer={footer}
						resetScrollKey={resetScrollKey}
					/>
				)}
				<main ref={surfaceRef} data-slot="layout-surface" className={surface()}>
					{children}
				</main>
			</div>
		</div>
	);
}

/**
 * The responsive app shell. It owns the rail, the mobile drawer and the scrolling surface;
 * the page owns everything inside, header included.
 * So it takes the data a shell has (a variant, a nav, a selection) and hangs the page's parts
 * off the same name, the way antd's Layout does.
 */
export const Layout = Object.assign(LayoutRoot, { Header, Content });

export type { LayoutNavEntry, LayoutNavItem } from './types';
export type { HeaderProps } from './header';
export type { ContentProps } from './content';
export type { SidebarProps } from './sidebar';
```

### src/components/blocks/layout/types.ts

```ts
import type { ReactElement, ReactNode } from 'react';

/** A row's element, when the app wants to own it — a router's link, an `<a>`, a custom tag. */
export type LayoutNavLinkRender = ReactElement;

export type LayoutNavItem = {
	type?: 'item';
	key: string;
	label: string;
	icon?: ReactNode;
	/** A count or a state on the row's trailing edge. */
	badge?: ReactNode;
	/** Disables the row and, for a parent, every destination below it. */
	disabled?: boolean;
	/** A row that goes somewhere: the shell draws a link and lets `onSelect` report it. */
	href?: string;
	/**
	 * Draws the row as a link with an element of your own — `render={<NavLink to="/docs" />}`. The
	 * shell supplies `href`, the active state and the click, so a router keeps its own navigation
	 * and its own active logic; `onSelect` still fires.
	 */
	render?: LayoutNavLinkRender;
	/** Marks the row as current regardless of `selectedKey`. */
	isActive?: boolean;
	/** Runs before `onSelect`. A row that goes somewhere usually does not need it. */
	onClick?: () => void;
	/** Sub rows: the row expands in place instead of navigating. */
	children?: LayoutNavItem[];
	defaultOpen?: boolean;
};

export type LayoutNavGroup = {
	type: 'group';
	label?: string;
	/**
	 * A control of the group's own, such as an add button. Rendered as given, so pass one that
	 * positions itself — `Nav.GroupAction` already does.
	 */
	action?: ReactNode;
	children: LayoutNavEntry[];
};

export type LayoutNavSeparator = { type: 'separator' };

/** One placeholder row, for a nav that is still loading. */
export type LayoutNavSkeleton = { type: 'skeleton'; showIcon?: boolean; width?: string };

export type LayoutNavEntry =
	| LayoutNavItem
	| LayoutNavGroup
	| LayoutNavSeparator
	| LayoutNavSkeleton;
```

### src/components/blocks/layout/header/index.tsx

```tsx
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
```

### src/components/blocks/layout/content/index.tsx

```tsx
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ContentProps = ComponentProps<'div'>;

/** The padded body under a page's header. Pass `p-0` where the page draws its own. */
export function Content({ className, ...props }: ContentProps) {
	return (
		<div
			data-slot="layout-content"
			className={cn('flex-1 bg-layout-content p-6', className)}
			{...props}
		/>
	);
}
```

### src/components/blocks/layout/sidebar/index.tsx

```tsx
import { PanelLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Nav } from '@/components/ui/nav';
import { ScrollArea } from '@/components/ui/scroll-area';
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
			<Nav.Root compact={compact}>{children}</Nav.Root>
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
				<Nav.Item key={item.key}>
					<Nav.Sub
						icon={item.icon}
						label={item.label}
						className={row}
						isActive={
							active ||
							item.children.some((child) => isActive(child.key, child.isActive))
						}
						defaultOpen={item.defaultOpen}
						disabled={item.disabled}
					>
						{item.children.map((child) => (
							<Nav.SubItem key={child.key}>
								<Nav.SubButton
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
								</Nav.SubButton>
							</Nav.SubItem>
						))}
					</Nav.Sub>
				</Nav.Item>
			);
		}

		return (
			<Nav.Item key={item.key}>
				<Nav.Button
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
					<Nav.Badge className="text-muted-foreground">{item.badge}</Nav.Badge>
				)}
			</Nav.Item>
		);
	}

	function renderEntry(entry: LayoutNavEntry, index: number) {
		if (entry.type === 'separator') return <Nav.Separator key={`separator-${index}`} />;

		if (entry.type === 'skeleton') {
			return (
				<Nav.Skeleton
					key={`skeleton-${index}`}
					showIcon={entry.showIcon}
					width={entry.width}
				/>
			);
		}

		if (entry.type === 'group') {
			return (
				<Nav.Group key={entry.label ?? `group-${index}`}>
					{entry.label !== undefined && <Nav.GroupLabel>{entry.label}</Nav.GroupLabel>}
					{entry.action}
					<Nav.List>
						{entry.children.map((child, childIndex) => renderEntry(child, childIndex))}
					</Nav.List>
				</Nav.Group>
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
			return Array.isArray(last)
				? [...acc.slice(0, -1), [...last, entry]]
				: [...acc, [entry]];
		}, []);

		return blocks.map((block, index) =>
			Array.isArray(block) ? (
				<Nav.Group
					key={`loose-${block.map((entry) => ('key' in entry ? entry.key : entry.type)).join('-')}`}
				>
					<Nav.List>{block.map(renderEntry)}</Nav.List>
				</Nav.Group>
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
			{(logo !== undefined ||
				title !== undefined ||
				brandActions !== undefined ||
				collapsible) && (
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
							className={cn(
								'ms-auto flex shrink-0 items-center gap-1',
								collapsed && 'flex-col',
							)}
						>
							{brandActions}
							{collapsible && (
								<Button
									variant="ghost"
									size="icon"
									className="size-8 shrink-0"
									aria-label={collapsed ? 'expand sidebar' : 'collapse sidebar'}
									aria-expanded={!collapsed}
									onClick={onToggle}
								>
									<PanelLeft />
								</Button>
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
			<ScrollArea.Root className="flex-1">
				<ScrollArea.Viewport>
					<ScrollArea.Content>
						<Nav.Root compact={collapsed}>{renderEntries(nav)}</Nav.Root>
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar />
			</ScrollArea.Root>
			{footer !== undefined && (
				<RailSlot slot="layout-footer" compact={collapsed}>
					{footer}
				</RailSlot>
			)}
		</div>
	);
}
```

### src/components/blocks/layout/mobile/index.tsx

```tsx
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { SidebarContent, type SidebarProps } from '../sidebar';

export type MobileNavigationProps = Pick<
	SidebarProps,
	'nav' | 'selectedKey' | 'onSelect' | 'logo' | 'title' | 'brandActions' | 'toolbar' | 'footer'
> & {
	resetScrollKey?: string;
};

export function MobileNavigation({
	nav,
	selectedKey,
	onSelect,
	logo,
	title,
	brandActions,
	toolbar,
	footer,
	resetScrollKey,
}: MobileNavigationProps) {
	const [open, setOpen] = useState(false);
	const [route, setRoute] = useState([selectedKey, resetScrollKey]);
	const bar = useRef<HTMLDivElement>(null);

	// A new page closes the drawer. Adjusted during render rather than in an effect, so the drawer
	// is already shut when the page it opened is first painted.
	if (route[0] !== selectedKey || route[1] !== resetScrollKey) {
		setRoute([selectedKey, resetScrollKey]);
		setOpen(false);
	}

	useEffect(() => {
		const element = bar.current;
		if (!open || element === null) return;

		// Follow the CSS breakpoint: a hidden bar must not leave a modal drawer active on desktop.
		const observer = new ResizeObserver(() => {
			if (element.getClientRects().length === 0) setOpen(false);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [open]);

	return (
		<Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="left">
			<div
				ref={bar}
				data-slot="layout-mobile-bar"
				className="flex h-14 shrink-0 items-center gap-2 bg-layout-background px-2 md:hidden"
			>
				<Drawer.Trigger
					render={
						<Button
							data-slot="layout-navigation-trigger"
							variant="ghost"
							size="icon"
							icon={<Menu />}
							aria-label="Open navigation"
						/>
					}
				/>
				<div
					data-slot="layout-mobile-brand"
					className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold"
				>
					{logo}
					{title !== undefined && (
						<span data-slot="layout-mobile-title" className="truncate">
							{title}
						</span>
					)}
				</div>
				{brandActions !== undefined && (
					<div
						data-slot="layout-mobile-actions"
						className="flex shrink-0 items-center gap-1"
					>
						{brandActions}
					</div>
				)}
			</div>
			<Drawer.Portal>
				<Drawer.Backdrop />
				<Drawer.Viewport>
					<Drawer.Popup
						data-slot="layout-mobile-navigation"
						className="bg-layout-background"
					>
						<SidebarContent
							nav={nav}
							selectedKey={selectedKey}
							onSelect={(key) => {
								onSelect?.(key);
								setOpen(false);
							}}
							logo={logo}
							title={
								<Drawer.Title render={<span />} className="text-sm">
									{title ?? 'Navigation'}
								</Drawer.Title>
							}
							brandActions={
								<Drawer.Close
									render={
										<Button
											variant="ghost"
											size="icon"
											icon={<X />}
											aria-label="Close navigation"
										/>
									}
								/>
							}
							toolbar={toolbar}
							footer={footer}
						/>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Layout/demos/responsive.tsx

```tsx
import { Folder, Home, Settings } from 'lucide-react';
import { useState } from 'react';
import { Layout, type LayoutNavEntry } from '@/components/blocks/layout';

const nav: LayoutNavEntry[] = [
	{ key: 'overview', label: 'Overview', icon: <Home /> },
	{
		key: 'projects',
		label: 'Projects',
		icon: <Folder />,
		defaultOpen: true,
		children: [
			{ key: 'library', label: 'Component library' },
			{ key: 'website', label: 'Website' },
		],
	},
	{
		key: 'settings',
		label: 'Settings',
		icon: <Settings />,
		disabled: true,
		defaultOpen: true,
		children: [{ key: 'members', label: 'Members' }],
	},
];

export default function Responsive() {
	const [selected, setSelected] = useState('overview');

	return (
		<Layout
			nav={nav}
			selectedKey={selected}
			onSelect={setSelected}
			title="Workspace"
			collapsible
			className="h-80 w-full rounded-lg border"
		>
			<Layout.Header title={selected} />
			<Layout.Content>
				<p className="text-sm text-muted-foreground">
					On a narrow viewport, open navigation from the bar above. Choose a destination
					to close the drawer. Settings and its members remain disabled in either layout.
				</p>
			</Layout.Content>
		</Layout>
	);
}
```
