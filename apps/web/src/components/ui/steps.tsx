import { Check } from 'lucide-react';
import {
	Children,
	createContext,
	useContext,
	useMemo,
	type ComponentProps,
	type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepsOrientation = 'horizontal' | 'vertical';
export type StepsSize = 'sm' | 'md';
export type StepsVariant = 'numbered' | 'dot';

type StepsContextValue = {
	/** The item that is happening now. Without one every item rests as `wait`. */
	current?: number;
	orientation: StepsOrientation;
	size: StepsSize;
	variant: StepsVariant;
};

const StepsContext = createContext<StepsContextValue>({
	orientation: 'horizontal',
	size: 'md',
	variant: 'numbered',
});

/** `Root` hands each direct child its position, so an item never has to state its own index. */
const StepIndexContext = createContext<number | undefined>(undefined);

/**
 * The status of the item a part is drawn in. `Item` also writes it to the DOM, where a part whose
 * look is a CSS rule can read it; a part whose look is a variant — the circle, the connector —
 * reads it here instead, so neither has to be handed a status it could have found out.
 */
const StepStatusContext = createContext<StepStatus | undefined>(undefined);

function useSteps() {
	return useContext(StepsContext);
}

/** What `current` says about one item, index by index. */
function resolveStatus(index: number | undefined, current: number | undefined): StepStatus {
	if (index === undefined || current === undefined) return 'wait';
	if (index < current) return 'finish';
	if (index === current) return 'process';
	return 'wait';
}

export const stepsRootVariants = tv({
	base: ['flex list-none'],
	variants: {
		orientation: {
			// No gap between items: each one's connector runs into the next one's box, up to the
			// centre of its circle, so the items are what the space is made of.
			horizontal: 'flex-row items-start',
			vertical: 'flex-col',
		},
		size: {
			// The one number the whole component measures from: the circle's box and, through it,
			// where the connector starts. Everything else sizes itself in `em` from the type.
			sm: 'text-xs [--steps-indicator:calc(var(--spacing)*6)]',
			md: 'text-sm [--steps-indicator:calc(var(--spacing)*7)]',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
		size: 'md',
	},
});

export type RootProps = Omit<ComponentProps<'ol'>, 'children'> &
	VariantProps<typeof stepsRootVariants> & {
		current?: number;
		variant?: StepsVariant;
		children?: ReactNode;
	};

/**
 * The list itself. It owns the order, so an item reads its position from here rather than being
 * told one — items have to be direct children for that to hold.
 */
export function Root({
	className,
	current,
	orientation = 'horizontal',
	size = 'md',
	variant = 'numbered',
	children,
	...props
}: RootProps) {
	const context = useMemo(
		() => ({ current, orientation, size, variant }),
		[current, orientation, size, variant],
	);

	return (
		<StepsContext.Provider value={context}>
			<ol
				data-slot="steps"
				data-orientation={orientation}
				data-size={size}
				data-variant={variant}
				className={cn(stepsRootVariants({ orientation, size }), className)}
				{...props}
			>
				{Children.map(children, (child, index) => (
					<StepIndexContext.Provider value={index}>{child}</StepIndexContext.Provider>
				))}
			</ol>
		</StepsContext.Provider>
	);
}

export const stepsItemVariants = tv({
	base: ['group/step relative flex min-w-0'],
	variants: {
		orientation: {
			// Top-aligned, so a circle sits at the same height in every item however tall its text
			// is — the connector is placed from that height.
			horizontal: 'flex-1 items-start gap-3',
			vertical: 'items-start gap-3',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export const stepsContentVariants = tv({
	base: 'min-w-0',
	variants: {
		orientation: {
			// Beside the circle it hugs its text and centres itself against the circle; the connector
			// after it takes the slack.
			horizontal: 'self-center',
			// The vertical gap between two steps is this padding, so the connector in the item
			// above runs the whole way to the next circle instead of stopping short of it.
			vertical: 'flex-1 pb-6 group-last/step:pb-0',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export const stepsIndicatorVariants = tv({
	base: [
		// `z-1` keeps the circle above the connectors: each one is drawn to the centre of the next
		// circle and covered by it, rather than stopped short of it.
		'relative z-1 grid shrink-0 place-items-center rounded-full',
		'size-(--steps-indicator) font-medium tabular-nums select-none',
		'border transition-[color,background-color,border-color]',
		'duration-(--duration-state) ease-(--ease-spring)',
		iconSlot,
	],
	variants: {
		variant: {
			numbered: '',
			// A dot keeps the box, because the connector is positioned from it.
			dot: 'after:size-2 after:rounded-full after:bg-current',
		},
		status: {
			finish: 'border-primary bg-primary text-primary-foreground',
			// Outlined rather than filled: done and now are both the primary colour, and only the
			// fill tells them apart at a glance.
			process: 'border-primary bg-background text-primary',
			wait: 'border-border bg-muted text-muted-foreground',
			error: 'border-destructive bg-destructive text-destructive-foreground',
		},
	},
	compoundVariants: [
		{
			variant: 'dot',
			status: 'finish',
			class: 'border-transparent bg-transparent text-primary',
		},
		{
			variant: 'dot',
			status: 'process',
			class: 'border-transparent bg-primary/15 text-primary',
		},
		{
			variant: 'dot',
			status: 'wait',
			class: 'border-transparent bg-transparent text-muted-foreground',
		},
		{
			variant: 'dot',
			status: 'error',
			class: 'border-transparent bg-transparent text-destructive',
		},
	],
	defaultVariants: {
		variant: 'numbered',
		status: 'wait',
	},
});

export type IndicatorProps = Omit<ComponentProps<'div'>, 'className'> &
	VariantProps<typeof stepsIndicatorVariants> & {
		/** Merged with `cn()`. */
		className?: string;
	};

/** The circle: the number, a check, a glyph a caller handed in, or a dot. */
export function Indicator({ className, variant, status, children, ...props }: IndicatorProps) {
	const context = useSteps();
	const itemStatus = useContext(StepStatusContext);
	const resolvedVariant = variant ?? context.variant;
	const resolvedStatus = status ?? itemStatus ?? 'wait';

	return (
		<div
			data-slot="steps-indicator"
			data-variant={resolvedVariant}
			data-status={resolvedStatus}
			className={cn(
				stepsIndicatorVariants({ variant: resolvedVariant, status: resolvedStatus }),
				className,
			)}
			{...props}
		>
			{resolvedVariant === 'dot' ? null : children}
		</div>
	);
}

export const stepsSeparatorVariants = tv({
	base: 'rounded-full',
	variants: {
		orientation: {
			// Laid out after the content and pulled into the next circle's box, so it reaches that
			// circle's centre at every size. A filled circle covers what runs under it; a dot does
			// not, which is why the connector has to be the one to travel.
			horizontal: [
				'h-px min-w-4 flex-1',
				// `--steps-indicator/2` puts it on the circles' centre line, the rest is the pull.
				'mt-[calc(var(--steps-indicator)/2)]',
				'-me-[calc(var(--steps-indicator)/2_-_var(--spacing))]',
			],
			// Absolute: it has to leave the circle at an exact point on the item's height, and it
			// runs from centre to centre so the padding between two items is always covered.
			vertical: [
				'absolute w-0.5',
				'start-[calc(var(--steps-indicator)/2_-_1px)]',
				'top-[calc(var(--steps-indicator)/2)] -bottom-[calc(var(--steps-indicator)/2)]',
			],
		},
		/** The connector reports the step it leaves, not the one it arrives at. */
		status: {
			finish: 'bg-primary',
			process: 'bg-border',
			wait: 'bg-border',
			error: 'bg-border',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
		status: 'wait',
	},
});

export type SeparatorProps = Omit<ComponentProps<'div'>, 'className'> &
	VariantProps<typeof stepsSeparatorVariants> & {
		/** Merged with `cn()`. */
		className?: string;
	};

/** The line between two indicators. Decorative: the order is the list's. */
export function Separator({ className, orientation, status, ...props }: SeparatorProps) {
	const context = useSteps();
	const itemStatus = useContext(StepStatusContext);
	const resolvedOrientation = orientation ?? context.orientation;
	const resolvedStatus = status ?? itemStatus ?? 'wait';

	return (
		<div
			data-slot="steps-separator"
			data-status={resolvedStatus}
			aria-hidden="true"
			className={cn(
				stepsSeparatorVariants({
					orientation: resolvedOrientation,
					status: resolvedStatus,
				}),
				'group-last/step:hidden',
				className,
			)}
			{...props}
		/>
	);
}

export type ItemProps = Omit<ComponentProps<'li'>, 'children'> & {
	/** Overrides what `current` would say about this item. */
	status?: StepStatus;
	/**
	 * A glyph in place of the number, at the size of the surrounding text. `finish` draws a check
	 * on its own unless one is given here.
	 */
	icon?: ReactNode;
	children?: ReactNode;
};

/**
 * One step: its indicator, its text and the line to the next one. The item states its status on
 * the DOM, and every part inside reads it from there — so a caller styles nothing by hand.
 */
export function Item({ className, status, icon, children, ...props }: ItemProps) {
	const { current, orientation } = useSteps();
	const index = useContext(StepIndexContext);
	const resolved = status ?? resolveStatus(index, current);
	const glyph =
		icon ?? (resolved === 'finish' ? <Check /> : index === undefined ? null : index + 1);

	return (
		<li
			data-slot="steps-item"
			data-status={resolved}
			aria-current={resolved === 'process' ? 'step' : undefined}
			className={cn(stepsItemVariants({ orientation }), className)}
			{...props}
		>
			<StepStatusContext.Provider value={resolved}>
				<Indicator>{glyph}</Indicator>
				<div data-slot="steps-content" className={stepsContentVariants({ orientation })}>
					{children}
				</div>
				<Separator />
			</StepStatusContext.Provider>
		</li>
	);
}

export type TitleProps = ComponentProps<'div'>;

/**
 * The name of the step. A `div`, so the heading level is the page's decision, not ours.
 *
 * It keeps the body colour in every status: a step that has not been reached is quiet through its
 * circle and its connector, and dimming the words as well leaves a guide with no `current` — a
 * list of steps nobody is on — reading as a list of things that are switched off.
 */
export function Title({ className, ...props }: TitleProps) {
	return (
		<div
			data-slot="steps-title"
			className={cn(
				'font-medium text-balance',
				'group-data-[status=error]/step:text-destructive',
				className,
			)}
			{...props}
		/>
	);
}

export type DescriptionProps = ComponentProps<'div'>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<div
			data-slot="steps-description"
			className={cn('text-muted-foreground', className)}
			{...props}
		/>
	);
}

/** A sequence of steps, as a list. Compose the parts inside an `Item`; the rest is done for you. */
export const LumoSteps = {
	Root,
	Item,
	Indicator,
	Separator,
	Title,
	Description,
};
