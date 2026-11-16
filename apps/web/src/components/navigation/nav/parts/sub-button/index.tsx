import { Button as BaseButton } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import type { ComponentProps, MouseEvent, MouseEventHandler, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';
import { activeRow } from '../button';

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

export type NavSubButtonProps = Omit<
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

/** A sub row. Same two shapes as `NavButton`: somewhere to go, or something to do. */
export function NavSubButton({
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
}: NavSubButtonProps) {
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
