import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, MouseEvent, MouseEventHandler, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import {
	TooltipPopup,
	TooltipPortal,
	TooltipPositioner,
	TooltipRoot,
	TooltipTrigger,
} from '@/components/overlay/tooltip/parts';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';
import { useNav } from '../context';

export /**
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

export type NavButtonProps = Omit<
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
export function NavButton({
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
}: NavButtonProps) {
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
						className="truncate group-data-compact:w-0"
					>
						{label}
					</span>
				)}
				{icon === undefined && initial !== '' && (
					<span
						data-slot="nav-button-initial"
						aria-hidden="true"
						className="hidden group-data-compact:block"
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
		<TooltipRoot>
			<TooltipTrigger render={element} />
			<TooltipPortal>
				<TooltipPositioner side={tooltipSide} align="center">
					<TooltipPopup>{hint}</TooltipPopup>
				</TooltipPositioner>
			</TooltipPortal>
		</TooltipRoot>
	);
}
