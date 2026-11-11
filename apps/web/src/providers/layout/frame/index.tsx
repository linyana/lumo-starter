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
type IPropsType = Omit<ComponentProps<'div'>, 'title' | 'onSelect'> & {
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
}: IPropsType) {
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
export type { SidebarProps } from './sidebar';
