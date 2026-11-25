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
} from '@/components/ui/overlay/tooltip/parts';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';
import { useNav } from '../context';

export const activeRow = cn(
	'data-active:font-medium data-active:text-accent-foreground',
	'data-active:after:opacity-(--state-layer-hover-opacity)',
	'data-active:hover:after:opacity-(--state-layer-selected-hover-opacity)',
	'data-active:active:after:opacity-(--state-layer-pressed-opacity)',
);

export const trailRow = cn('data-trail:font-medium data-trail:text-accent-foreground');

export const navButtonVariants = tv({
	base: [
		'peer/nav-button relative flex w-full cursor-pointer items-center gap-2 overflow-hidden',
		'rounded-md p-2 text-left text-sm select-none',
		stateLayer,
		activeRow,
		trailRow,
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		iconSlot,
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
		className?: string;
		icon?: ReactNode;
		label?: string;
		isActive?: boolean;
		tooltip?: ReactNode;
		tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
		href?: string;
		render?: useRender.ComponentProps<'a'>['render'];
		onClick?: MouseEventHandler<HTMLElement>;
	};

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
					<span data-slot="nav-button-label" className="truncate group-data-compact:w-0">
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
			'aria-current': render === undefined && isActive ? 'page' : undefined,
			'data-disabled': disabled || undefined,
			'aria-disabled': disabled || undefined,
			tabIndex: disabled ? -1 : tabIndex,
			onClick: disabled
				? (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault()
				: onClick,
		},
	});

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
