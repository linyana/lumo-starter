# select

> One value out of many, in a list laid under the control that opened it: an Input's shell as a trigger with a caret that turns itself, a row shared with Menu whose chosen line is filled rather than checked, and scroll arrows at the ends of a long list. The popup opens under the trigger rather than over it. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/select
```

- payload: `/r/select.json`
- docs page: `/select`
- comes with it: `@lumo/utils`, `@lumo/control`, `@lumo/surface`
- npm packages: `@base-ui/react`, `lucide-react`, `tailwind-variants`
- lands in: `select.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/select.tsx

```tsx
import { Select as BaseSelect } from '@base-ui/react/select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { fieldShell, iconSlot, row, rowGroupLabel, rowSeparator } from '@/lib/control';
import { backdrop, popup, positioner } from '@/lib/surface';

export type RootProps<Value, Multiple extends boolean | undefined = false> = BaseSelect.Root.Props<
	Value,
	Multiple
>;

/** The state: the value, the open flag, and whether one option or many can be held. */
export const Root = BaseSelect.Root;

export type LabelProps = ComponentProps<typeof BaseSelect.Label>;

/** The select's name. A `div`, so clicking it focuses the trigger without opening the popup. */
export function Label({ className, ...props }: LabelProps) {
	return (
		<BaseSelect.Label
			data-slot="select-label"
			className={cn('text-sm font-medium select-none', className)}
			{...props}
		/>
	);
}

export const selectTriggerVariants = tv({
	base: [
		fieldShell,
		// A field with a caret in it: the same shell an Input draws, laid out as a row so the value
		// takes the slack and the caret stays where it was put.
		'group relative flex cursor-pointer items-center justify-between gap-2 text-left select-none',
		// The resting look is an Input's: white, bordered, whatever the value is. The fill marks the
		// one state the field is in the middle of — open, and being chosen from — the way the state
		// layer marks a pressed button.
		'data-popup-open:bg-muted',
		// A button carries these as Base UI flags rather than as the pseudo-classes Input reads.
		'data-readonly:bg-muted data-readonly:cursor-default',
		iconSlot,
	],
	variants: {
		size: {
			// The same 32 / 36 / 40 an Input and a Button take, so a row of controls lines up.
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-9 px-3 text-sm',
			lg: 'h-10 px-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type TriggerProps = Omit<ComponentProps<typeof BaseSelect.Trigger>, 'className'> &
	VariantProps<typeof selectTriggerVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/** The button that opens the list, holding the value and the caret. */
export function Trigger({ className, size = 'md', ...props }: TriggerProps) {
	return (
		<BaseSelect.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(selectTriggerVariants({ size }), className)}
			{...props}
		/>
	);
}

export type ValueProps = Omit<ComponentProps<typeof BaseSelect.Value>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The chosen label, or the `placeholder` while there is none. It is the part that truncates, so a
 * long option cannot push the caret out of the trigger — and in `multiple` mode it is the several
 * labels, joined, unless `children` says otherwise.
 */
export function Value({ className, ...props }: ValueProps) {
	return (
		<BaseSelect.Value
			data-slot="select-value"
			className={cn(
				'min-w-0 flex-1 truncate',
				'data-placeholder:text-muted-foreground',
				className,
			)}
			{...props}
		/>
	);
}

export type IconProps = Omit<ComponentProps<typeof BaseSelect.Icon>, 'children'> & {
	/** Replaces the caret, at the size of the text around it. */
	children?: ReactNode;
};

/**
 * The caret. It owns its turn, because it is the only part that knows the popup is open — the same
 * reason `Collapsible.Icon` owns its own.
 */
export function Icon({ className, children, ...props }: IconProps) {
	return (
		<BaseSelect.Icon
			data-slot="select-icon"
			className={cn(
				'flex shrink-0 items-center text-muted-foreground',
				'transition-transform duration-(--duration-turn) ease-(--ease-overlay)',
				'data-popup-open:rotate-180',
				iconSlot,
				className,
			)}
			{...props}
		>
			{children ?? <ChevronDown />}
		</BaseSelect.Icon>
	);
}

export const Portal = BaseSelect.Portal;

export type BackdropProps = ComponentProps<typeof BaseSelect.Backdrop>;

/** The scrim a modal select drops over the page it was opened from. */
export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BaseSelect.Backdrop
			data-slot="select-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export type PositionerProps = ComponentProps<typeof BaseSelect.Positioner>;

/**
 * Where the list is placed. Base UI aligns the selected row with the trigger by default, which lays
 * the popup over the control that opened it; here it is off, so a select opens under its trigger like
 * every other surface in the library. Pass `alignItemWithTrigger` for the native feel of a list
 * covering the row it belongs to.
 */
export function Positioner({
	className,
	align = 'start',
	sideOffset = 6,
	alignItemWithTrigger = false,
	...props
}: PositionerProps) {
	return (
		<BaseSelect.Positioner
			data-slot="select-positioner"
			align={align}
			sideOffset={sideOffset}
			alignItemWithTrigger={alignItemWithTrigger}
			className={cn('z-50 outline-none', positioner, className)}
			{...props}
		/>
	);
}

export type PopupProps = Omit<ComponentProps<typeof BaseSelect.Popup>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The panel: at least as wide as the trigger, and never taller than the room the viewport left it.
 * The list inside is what scrolls, so the arrows at either end stay on screen.
 */
export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseSelect.Popup
			data-slot="select-popup"
			className={cn(
				'relative flex max-h-(--available-height) min-w-(--anchor-width) flex-col',
				'overflow-clip rounded-lg border bg-popover text-popover-foreground shadow-lifted',
				'outline-none',
				popup,
				className,
			)}
			{...props}
		/>
	);
}

const scrollArrowClass = cn(
	'relative flex h-5 w-full shrink-0 cursor-default items-center justify-center',
	'bg-popover text-muted-foreground',
	// The strip is thinner than a comfortable target, so the whole edge it covers answers to it.
	"before:absolute before:inset-0 before:content-['']",
	iconSlot,
);

export type ScrollUpArrowProps = ComponentProps<typeof BaseSelect.ScrollUpArrow>;

/** Shown by Base UI while there are rows above the box, on a pointer that can hover. */
export function ScrollUpArrow({ className, ...props }: ScrollUpArrowProps) {
	return (
		<BaseSelect.ScrollUpArrow
			data-slot="select-scroll-up-arrow"
			className={cn(scrollArrowClass, className)}
			{...props}
		>
			<ChevronUp />
		</BaseSelect.ScrollUpArrow>
	);
}

export type ScrollDownArrowProps = ComponentProps<typeof BaseSelect.ScrollDownArrow>;

export function ScrollDownArrow({ className, ...props }: ScrollDownArrowProps) {
	return (
		<BaseSelect.ScrollDownArrow
			data-slot="select-scroll-down-arrow"
			className={cn(scrollArrowClass, className)}
			{...props}
		>
			<ChevronDown />
		</BaseSelect.ScrollDownArrow>
	);
}

export type ListProps = Omit<ComponentProps<typeof BaseSelect.List>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The rows, in the box that scrolls when there are more than fit. It is the flex child that gives up
 * height, which is how the popup stays inside `--available-height` with or without the arrows.
 */
export function List({ className, ...props }: ListProps) {
	return (
		<BaseSelect.List
			data-slot="select-list"
			className={cn(
				'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 scroll-py-6 outline-none',
				className,
			)}
			{...props}
		/>
	);
}

/** A block of rows, grouped for the arrow keys as well as the eye. */
export const Group = BaseSelect.Group;

export type GroupLabelProps = Omit<ComponentProps<typeof BaseSelect.GroupLabel>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

export function GroupLabel({ className, ...props }: GroupLabelProps) {
	return (
		<BaseSelect.GroupLabel
			data-slot="select-group-label"
			className={cn(rowGroupLabel, className)}
			{...props}
		/>
	);
}

export type ItemProps = Omit<ComponentProps<typeof BaseSelect.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * One option. The row is the library's own, so it highlights exactly as a menu's action does — and the
 * chosen one is filled with that same tint rather than marked, so the label never shifts between the
 * two states, deepening a notch while the pointer is still on it. The cursor is a pointer, unlike a
 * menu row's: this is a thing to pick out of a list.
 */
export function Item({ className, ...props }: ItemProps) {
	return (
		<BaseSelect.Item
			data-slot="select-item"
			className={cn(row, 'cursor-pointer pr-3 data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}

export type ItemTextProps = Omit<ComponentProps<typeof BaseSelect.ItemText>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** The option's label — and, as Base UI sees it, what the trigger shows once it is chosen. */
export function ItemText({ className, ...props }: ItemTextProps) {
	return (
		<BaseSelect.ItemText
			data-slot="select-item-text"
			className={cn('min-w-0 flex-1 truncate', className)}
			{...props}
		/>
	);
}

export type SeparatorProps = Omit<ComponentProps<typeof BaseSelect.Separator>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** A line between two groups of options. */
export function Separator({ className, ...props }: SeparatorProps) {
	return (
		<BaseSelect.Separator
			data-slot="select-separator"
			className={cn(rowSeparator, className)}
			{...props}
		/>
	);
}

/**
 * Base UI supplies behaviour — the typeahead, the keyboard, the flip, the form value — and these
 * parts supply appearance. Compose with `render`.
 *
 * A list that has to be filtered to be usable is not this: a select is for options a reader can
 * recognise on sight. Base UI's Combobox is the one that searches.
 */
export const Select = {
	Root,
	Label,
	Trigger,
	Value,
	Icon,
	Portal,
	Backdrop,
	Positioner,
	Popup,
	ScrollUpArrow,
	ScrollDownArrow,
	List,
	Group,
	GroupLabel,
	Item,
	ItemText,
	Separator,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Select/demos/basic.tsx

```tsx
import { Select } from '@/components/ui/select';

const languages = ['typescript', 'rust', 'go', 'python', 'zig'];

export default function Basic() {
	return (
		<Select.Root defaultValue="typescript">
			<Select.Trigger className="w-56" aria-label="language">
				<Select.Value placeholder="choose a language" />
				<Select.Icon />
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner>
					<Select.Popup>
						<Select.List>
							{languages.map((language) => (
								<Select.Item key={language} value={language}>
									<Select.ItemText>{language}</Select.ItemText>
								</Select.Item>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}
```

### src/pages/Select/demos/groups.tsx

```tsx
import { Fragment } from 'react';
import { Select } from '@/components/ui/select';

type Option = { value: string; disabled?: boolean };

/** Kept in the list rather than filtered out, so a project the reader remembers is still findable —
 *  it simply cannot be chosen again. */
const groups: { label: string; items: Option[] }[] = [
	{ label: 'workspace', items: [{ value: 'lumo-ui' }, { value: 'lumo-code' }] },
	{ label: 'archived', items: [{ value: 'lumo-web', disabled: true }] },
];

export default function Groups() {
	return (
		<Select.Root defaultValue="lumo-ui">
			<Select.Trigger className="w-56" aria-label="project">
				<Select.Value placeholder="choose a project" />
				<Select.Icon />
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner>
					<Select.Popup>
						<Select.List>
							{groups.map((group, index) => (
								<Fragment key={group.label}>
									{index > 0 && <Select.Separator />}
									<Select.Group>
										<Select.GroupLabel>{group.label}</Select.GroupLabel>
										{group.items.map(({ value, disabled }) => (
											<Select.Item
												key={value}
												value={value}
												disabled={disabled}
											>
												<Select.ItemText>{value}</Select.ItemText>
											</Select.Item>
										))}
									</Select.Group>
								</Fragment>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}
```
