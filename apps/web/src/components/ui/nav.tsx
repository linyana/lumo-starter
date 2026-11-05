import {
	type ComponentProps,
	createContext,
	useContext,
	type MouseEventHandler,
	type MouseEvent,
	type ReactNode,
	useMemo,
	type CSSProperties,
} from 'react';
import { cn } from '@/lib/utils';
import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import { tv, type VariantProps } from 'tailwind-variants';
import { Tooltip } from '@/components/ui/tooltip';
import { Separator as BaseSeparator } from '@/components/ui/separator';
import { Skeleton as BaseSkeleton } from '@/components/ui/skeleton';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { Collapsible } from '@/components/ui/collapsible';
import { Popover } from '@/components/ui/popover';
import { iconSlot, stateLayer } from '@/lib/control';

export type ActionProps = ComponentProps<'button'> & {
	/** Keeps the row quiet until it is hovered or focused. */
	showOnHover?: boolean;
};

/**
 * The square every secondary action is drawn in: one glyph, no fill of its own, and a hit area
 * widened on touch where the glyph is too small to aim at. Where it sits is the row's business, or
 * the group's, so only that is left to the two components below.
 */
const actionShell = cn(
	'absolute flex aspect-square w-5 cursor-pointer items-center justify-center',
	'rounded-md p-0 text-muted-foreground select-none',
	'transition-[color,background-color,opacity] duration-(--duration-state)',
	'hover:bg-accent hover:text-accent-foreground',
	// Widens the hit area on touch, where the glyph itself is too small.
	'after:absolute after:-inset-2 md:after:hidden',
	iconSlot,
	'group-data-[compact]:hidden',
);

type ActionGlyphProps = ComponentProps<'button'> & { slot: string };

function ActionGlyph({ slot, className, ...props }: ActionGlyphProps) {
	return <button data-slot={slot} className={cn(actionShell, className)} {...props} />;
}

/** A secondary action that rides on a row, such as "more" or a delete. */
export function Action({ className, showOnHover = false, ...props }: ActionProps) {
	return (
		<ActionGlyph
			slot="nav-action"
			className={cn(
				'end-1',
				'peer-hover/nav-button:text-accent-foreground',
				'peer-data-[size=sm]/nav-button:top-1',
				'peer-data-[size=md]/nav-button:top-1.5',
				'peer-data-[size=lg]/nav-button:top-2.5',
				showOnHover && [
					// Out of the way until its own row is hovered or the action itself is reached. The
					// row's button is the `peer`, so one hovered row cannot light up the actions of the
					// rows inside it; the action's own hover then holds it open once it has taken the
					// pointer over from that button.
					'md:pointer-events-none md:opacity-0',
					'peer-hover/nav-button:pointer-events-auto peer-hover/nav-button:opacity-100',
					'hover:pointer-events-auto hover:opacity-100',
					'focus-visible:pointer-events-auto focus-visible:opacity-100',
				],
				className,
			)}
			{...props}
		/>
	);
}

export type BadgeProps = ComponentProps<'div'>;

/** A count or a state on the row's trailing edge. Purely decorative — the row must say it too. */
export function Badge({ className, ...props }: BadgeProps) {
	return (
		<div
			data-slot="nav-badge"
			className={cn(
				'pointer-events-none absolute end-1 flex h-5 min-w-5 items-center justify-center',
				'rounded-md px-1 text-xs font-medium tabular-nums select-none',
				'peer-hover/nav-button:text-accent-foreground',
				'peer-data-[active]/nav-button:text-accent-foreground',
				'peer-data-[size=sm]/nav-button:top-1',
				'peer-data-[size=md]/nav-button:top-1.5',
				'peer-data-[size=lg]/nav-button:top-2.5',
				'group-data-[compact]:hidden',
				className,
			)}
			{...props}
		/>
	);
}

export type NavContextValue = {
	/** The rail: rows keep one glyph, and a row with children opens them in a popover. */
	compact: boolean;
};

export const NavContext = createContext<NavContextValue>({ compact: false });

export function useNav() {
	return useContext(NavContext);
}

/**
 * What being here looks like. A nav row's hover already means "go here", so the row you have gone to
 * wears the very tint the pointer leaves on it rather than a deeper fill of its own: one state, kept.
 * The weight lifts too, because that tint is drawn over whatever the shell put behind the row — 6% of
 * the row's own text colour — and on the rail that is only a suggestion. A pointer arriving on the
 * row you are already on is the one thing left to say, so it takes a step of its own: past the hover,
 * short of the press.
 */
const activeRow = cn(
	'data-active:font-medium data-active:text-accent-foreground',
	'data-active:after:opacity-(--state-layer-hover-opacity)',
	'data-active:hover:after:opacity-(--state-layer-selected-hover-opacity)',
	'data-active:active:after:opacity-(--state-layer-pressed-opacity)',
);

export const navButtonVariants = tv({
	base: [
		'peer/nav-button relative flex w-full cursor-pointer items-center gap-2 overflow-hidden',
		'rounded-md p-2 text-left text-sm select-none',
		stateLayer,
		activeRow,
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		iconSlot,
		// The rail: one square holding a single glyph, so the gap goes and the content centres.
		'group-data-[compact]:size-8! group-data-[compact]:justify-center',
		'group-data-[compact]:gap-0 group-data-[compact]:p-0!',
	],
	variants: {
		variant: {
			default: '',
			outline: 'border bg-background shadow-[0_0_0_1px_var(--border)]',
		},
		size: {
			sm: 'h-7 text-xs',
			md: 'h-8 text-sm',
			lg: 'h-12 text-sm',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'md',
	},
});

export type ButtonProps = Omit<
	ComponentProps<typeof BaseButton>,
	'className' | 'render' | 'onClick'
> &
	Pick<ComponentProps<'a'>, 'target' | 'rel' | 'download'> &
	VariantProps<typeof navButtonVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
		/** Leading glyph. Survives the compact nav on its own. */
		icon?: ReactNode;
		/**
		 * The row's text. Given it, the compact nav can stand in with its first letter when there
		 * is no icon, and the tooltip has something to say.
		 */
		label?: string;
		/** Marks the row as the page you are on. */
		isActive?: boolean;
		/** Shown only while the nav is compact. Defaults to `label`; `false` when something else
		 * already opens from the row, such as a nested popover. */
		tooltip?: ReactNode;
		tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
		/**
		 * Where the row goes. Given it, the row is an anchor rather than a button — a link that
		 * navigates, opens in a new tab, and can be copied from the context menu.
		 */
		href?: string;
		/**
		 * Draws the row with an element of your own, such as a router's link:
		 * `render={<NavLink to="/docs" />}`. The row still supplies the href, the active state and
		 * the classes, so navigation stays the router's business.
		 */
		render?: useRender.ComponentProps<'a'>['render'];
		onClick?: MouseEventHandler<HTMLElement>;
	};

/**
 * One navigation row: something to do, or somewhere to go. The difference is `href` — with it
 * the row is an anchor, without it a button.
 *
 * A row with `href` cannot go through Base UI's button: that adds `role="button"` to anything
 * that is not a `<button>`, which would hand a screen reader a button where the user needs a
 * link. So the anchor is rendered directly, from the same variants object.
 */
export function Button({
	className,
	variant = 'default',
	size = 'md',
	icon,
	label,
	isActive = false,
	tooltip,
	tooltipSide = 'right',
	href,
	render,
	disabled = false,
	focusableWhenDisabled,
	nativeButton,
	type,
	tabIndex,
	onClick,
	children,
	...props
}: ButtonProps) {
	const { compact } = useNav();
	const initial = label?.trim().charAt(0) ?? '';
	const isLink = href !== undefined || render !== undefined;

	const shared = {
		'data-slot': 'nav-button',
		'data-active': isActive || undefined,
		'data-size': size,
		className: cn(navButtonVariants({ variant, size }), className),
		children: (
			<>
				{icon}
				{label !== undefined && (
					<span
						data-slot="nav-button-label"
						// `truncate` keeps the a11y name while `w-0` hides the text: overflow is what
						// lets a flex item shrink past its content width, so it is the width that
						// stops applying, not the text that disappears.
						className="truncate group-data-[compact]:w-0"
					>
						{label}
					</span>
				)}
				{icon === undefined && initial !== '' && (
					<span
						data-slot="nav-button-initial"
						aria-hidden="true"
						className="hidden group-data-[compact]:block"
					>
						{initial}
					</span>
				)}
				{children}
			</>
		),
	};

	const anchor = useRender({
		render,
		enabled: isLink,
		defaultTagName: 'a',
		props: {
			...props,
			...shared,
			href,
			// A link that draws itself has to say it is the current page. With an element of its own —
			// a router's link — that element knows better, and `NavLink` sets its own `aria-current`
			// after these props anyway.
			'aria-current': render === undefined && isActive ? 'page' : undefined,
			'data-disabled': disabled || undefined,
			'aria-disabled': disabled || undefined,
			// A link has no `disabled`; staying out of the tab order is what it can do about it.
			tabIndex: disabled ? -1 : tabIndex,
			onClick: disabled
				? (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()
				: onClick,
		},
	});

	// `useRender` widens its return type to cover the branch it was told to skip, so the anchor
	// is paired with the test that produced it.
	const element =
		isLink && anchor !== null ? (
			anchor
		) : (
			<BaseButton
				{...props}
				{...shared}
				disabled={disabled}
				focusableWhenDisabled={focusableWhenDisabled}
				nativeButton={nativeButton}
				// Passing `undefined` would cancel the default Base UI applies, and a `<button>`
				// without a type submits the form it happens to sit in.
				type={type ?? 'button'}
				tabIndex={tabIndex}
				onClick={onClick}
			/>
		);

	const hint = tooltip ?? label;
	if (hint === undefined || hint === false || !compact) return element;

	return (
		<Tooltip.Root>
			<Tooltip.Trigger render={element} />
			<Tooltip.Portal>
				<Tooltip.Positioner side={tooltipSide} align="center">
					<Tooltip.Popup>{hint}</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	);
}

export type GroupProps = ComponentProps<'div'>;

export function Group({ className, ...props }: GroupProps) {
	return (
		<div
			data-slot="nav-group"
			className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
			{...props}
		/>
	);
}

export type GroupActionProps = ComponentProps<'button'>;

/** The "+" that belongs to a group rather than to one of its rows. */
export function GroupAction({ className, ...props }: GroupActionProps) {
	return (
		<ActionGlyph
			slot="nav-group-action"
			className={cn('end-3 top-3.5', className)}
			{...props}
		/>
	);
}

export type GroupLabelProps = ComponentProps<'div'>;

/** Collapses to nothing in the compact nav, so the rows can stack without a heading. */
export function GroupLabel({ className, ...props }: GroupLabelProps) {
	return (
		<div
			data-slot="nav-group-label"
			className={cn(
				'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground',
				// Hidden in the rail, but the text stays in the DOM — truncating keeps it from
				// pushing a horizontal scrollbar out of a 3rem column.
				'truncate',
				'transition-[margin,opacity] duration-(--duration-state) ease-linear',
				'group-data-[compact]:-mt-8 group-data-[compact]:opacity-0',
				iconSlot,
				className,
			)}
			{...props}
		/>
	);
}

export type ItemProps = ComponentProps<'li'>;

/** The anchor a row's action and badge are positioned against. */
export function Item({ className, ...props }: ItemProps) {
	return (
		<li data-slot="nav-item" className={cn('group/nav-item relative', className)} {...props} />
	);
}

export type ListProps = ComponentProps<'ul'>;

export function List({ className, ...props }: ListProps) {
	return (
		<ul
			data-slot="nav-list"
			className={cn('flex w-full min-w-0 flex-col gap-1', className)}
			{...props}
		/>
	);
}

export type RootProps = ComponentProps<'div'> & {
	/** Collapse to one glyph per row. The nav needs nothing else to know how wide it is. */
	compact?: boolean;
};

/**
 * Holds the list's layout, and the one fact a nav has about its container: whether it is a rail.
 * Everything else — width, position, scrolling, whether it lives in a drawer — belongs outside.
 */
export function Root({ compact = false, className, children, ...props }: RootProps) {
	const value = useMemo(() => ({ compact }), [compact]);

	return (
		<NavContext.Provider value={value}>
			<div
				data-slot="nav-root"
				data-compact={compact ? '' : undefined}
				className={cn('group flex w-full min-w-0 flex-col gap-1', className)}
				{...props}
			>
				{children}
			</div>
		</NavContext.Provider>
	);
}

export type SeparatorProps = ComponentProps<typeof BaseSeparator>;

/** Section split inside the list, inset so it does not run into the rounded corners. */
export function Separator({ className, ...props }: SeparatorProps) {
	return (
		<BaseSeparator
			data-slot="nav-separator"
			className={cn('mx-2 w-auto', className)}
			{...props}
		/>
	);
}

export type SkeletonProps = ComponentProps<'div'> & {
	showIcon?: boolean;
	/** Deterministic on purpose: a random width differs between server and client. */
	width?: string;
};

/** One row while the navigation is loading. Pair several to fill a group. */
export function Skeleton({ className, showIcon = false, width = '70%', ...props }: SkeletonProps) {
	return (
		<div
			data-slot="nav-skeleton"
			className={cn(
				'flex h-8 items-center gap-2 rounded-md px-2',
				// Same square as a real row, so the rail loads into its final shape.
				'group-data-[compact]:size-8! group-data-[compact]:justify-center',
				'group-data-[compact]:gap-0 group-data-[compact]:px-0',
				className,
			)}
			{...props}
		>
			{showIcon ? (
				<BaseSkeleton data-slot="nav-skeleton-icon" className="size-4" />
			) : (
				<BaseSkeleton
					data-slot="nav-skeleton-initial"
					className="hidden size-4 group-data-[compact]:block"
				/>
			)}
			<BaseSkeleton
				data-slot="nav-skeleton-text"
				className="h-4 flex-1 group-data-[compact]:hidden"
				style={{ maxWidth: width } as CSSProperties}
			/>
		</div>
	);
}

export type SubListProps = ComponentProps<'ul'>;

/** The list of sub rows: indented from the nav edge, then filling the rest of the line. */
export function SubList({ className, ...props }: SubListProps) {
	return (
		<ul
			data-slot="nav-sub-list"
			className={cn(
				'ms-4 me-2 mt-1 flex min-w-0 flex-col gap-1 border-s ps-3',
				'group-data-[compact]:hidden',
				className,
			)}
			{...props}
		/>
	);
}

export type SubProps = {
	icon?: ReactNode;
	label: string;
	/** `SubItem` rows. The same ones serve the inline list and the compact popover. */
	children: ReactNode;
	className?: string;
	/** Highlights the row, so a parent reads as current when one of its children is. */
	isActive?: boolean;
	defaultOpen?: boolean;
	disabled?: boolean;
	/** Which side the popover opens on when the nav is compact. Defaults to the row's right. */
	popoverSide?: 'top' | 'right' | 'bottom' | 'left';
};

const NavRow = Button;

/**
 * A row that owns a list of sub rows: it expands inline when the nav has width, and opens a
 * popover instead once it is compact, because there is no room left to expand into.
 */
export function Sub({
	icon,
	label,
	children,
	className,
	isActive = false,
	defaultOpen = false,
	disabled = false,
	popoverSide = 'right',
}: SubProps) {
	const { compact } = useNav();

	if (compact) {
		return (
			<Popover.Root>
				<Popover.Trigger
					disabled={disabled}
					openOnHover={!disabled}
					delay={80}
					render={
						<NavRow
							icon={icon}
							label={label}
							isActive={isActive}
							disabled={disabled}
							tooltip={false}
							className={className}
						/>
					}
				/>
				<Popover.Portal>
					<Popover.Positioner side={popoverSide} align="start">
						<Popover.Popup className="w-56 p-1.5">
							<Popover.Title className="px-2 py-1 text-xs font-medium text-muted-foreground">
								{label}
							</Popover.Title>
							<SubList inert={disabled} className="ms-0 me-0 border-s-0 ps-1">
								{children}
							</SubList>
						</Popover.Popup>
					</Popover.Positioner>
				</Popover.Portal>
			</Popover.Root>
		);
	}

	return (
		<Collapsible.Root defaultOpen={defaultOpen} disabled={disabled}>
			{/* Base UI's own trigger rather than `Collapsible.Trigger`: that one paints a collapsible
			    header, and a nav row already has an appearance of its own. Two looks on one element
			    mean every shared property — padding, text size, the icon's size — is settled by
			    whichever rule lands later in the stylesheet, which is neither look. */}
			<BaseCollapsible.Trigger
				data-slot="nav-sub-trigger"
				render={
					<NavRow
						icon={icon}
						label={label}
						isActive={isActive}
						disabled={disabled}
						className={cn('group', className)}
					>
						<Collapsible.Icon className="ms-auto" />
					</NavRow>
				}
			/>
			<Collapsible.Panel>
				<SubList inert={disabled}>{children}</SubList>
			</Collapsible.Panel>
		</Collapsible.Root>
	);
}

export const navSubButtonVariants = tv({
	base: [
		'relative flex h-7 w-full min-w-0 cursor-pointer items-center gap-2 overflow-hidden',
		'rounded-md px-2 select-none',
		stateLayer,
		activeRow,
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		iconSlot,
		'group-data-[compact]:hidden',
	],
	variants: {
		size: {
			sm: 'text-xs',
			md: 'text-sm',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type SubButtonProps = Omit<
	ComponentProps<typeof BaseButton>,
	'className' | 'render' | 'onClick'
> &
	Pick<ComponentProps<'a'>, 'target' | 'rel' | 'download'> &
	VariantProps<typeof navSubButtonVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
		/** Leading glyph, at the same grid as a top-level row's. */
		icon?: ReactNode;
		isActive?: boolean;
		/** Where the row goes: given it, the row is an anchor rather than a button. */
		href?: string;
		/** Your router's link, so the sub row navigates without a reload. */
		render?: useRender.ComponentProps<'a'>['render'];
		onClick?: MouseEventHandler<HTMLElement>;
	};

/** A sub row. Same two shapes as `Button`: somewhere to go, or something to do. */
export function SubButton({
	className,
	size = 'md',
	icon,
	isActive = false,
	href,
	render,
	disabled = false,
	focusableWhenDisabled,
	nativeButton,
	type,
	tabIndex,
	onClick,
	children,
	...props
}: SubButtonProps) {
	const isLink = href !== undefined || render !== undefined;

	const shared = {
		'data-slot': 'nav-sub-button',
		'data-active': isActive || undefined,
		'data-size': size,
		className: cn(navSubButtonVariants({ size }), className),
		children: (
			<>
				{icon}
				{children}
			</>
		),
	};

	const anchor = useRender({
		render,
		enabled: isLink,
		defaultTagName: 'a',
		props: {
			...props,
			...shared,
			href,
			// A link that draws itself has to say it is the current page; one drawn by a router's
			// link knows better and sets its own `aria-current` after these props anyway.
			'aria-current': render === undefined && isActive ? 'page' : undefined,
			'data-disabled': disabled || undefined,
			'aria-disabled': disabled || undefined,
			tabIndex: disabled ? -1 : tabIndex,
			onClick: disabled
				? (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()
				: onClick,
		},
	});

	if (isLink) return anchor;

	return (
		<BaseButton
			{...props}
			{...shared}
			disabled={disabled}
			focusableWhenDisabled={focusableWhenDisabled}
			nativeButton={nativeButton}
			type={type ?? 'button'}
			tabIndex={tabIndex}
			onClick={onClick}
		/>
	);
}

export type SubItemProps = ComponentProps<'li'>;

export function SubItem({ className, ...props }: SubItemProps) {
	return (
		<li
			data-slot="nav-sub-item"
			className={cn('group/nav-sub-item relative', className)}
			{...props}
		/>
	);
}

/**
 * Base UI supplies behaviour, these parts supply appearance. Compose with `render`.
 *
 * A nav is a list of destinations that is always in the layout. Not to be confused with `Menu`,
 * which is opened on a trigger, holds actions, and closes.
 */
export const Nav = {
	Root,
	List,
	Group,
	GroupLabel,
	GroupAction,
	Item,
	Button,
	Action,
	Badge,
	Skeleton,
	Sub,
	SubList,
	SubItem,
	SubButton,
	Separator,
};
