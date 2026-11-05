# combobox

> A select whose options are found by typing: the field is the control, so the chosen label stays in it and the query narrows the list under it. A caret opens the list without typing, a clear button appears only while there is something to clear, and the rows are the same rows Menu and Select draw. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/combobox
```

- payload: `/r/combobox.json`
- docs page: `/combobox`
- comes with it: `@lumo/utils`, `@lumo/control`, `@lumo/surface`
- npm packages: `@base-ui/react`, `lucide-react`, `tailwind-variants`
- lands in: `combobox.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/combobox.tsx

```tsx
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { ChevronDown, X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { fieldShell, iconSlot, row, rowGroupLabel, rowSeparator } from '@/lib/control';
import { popup, positioner } from '@/lib/surface';

/** The state: the items, the query, the chosen value, and whether the list is open. */
export const Root = BaseCombobox.Root;

export const comboboxInputVariants = tv({
	base: [
		fieldShell,
		// The shell is shared, but a field that can be typed into is the only one whose `:read-only`
		// means something — see the note on `fieldShell`.
		'read-only:bg-muted',
		// The right edge is not the text's: a caret is drawn there, and a clear button beside it.
		'pe-9',
	],
	variants: {
		size: {
			// The same 32 / 36 / 40 an Input takes, so a row of controls lines up — but padded on
			// the start only, because the end belongs to the glyphs.
			sm: 'h-8 ps-2.5 text-sm',
			md: 'h-9 ps-3 text-sm',
			lg: 'h-10 ps-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type InputProps = Omit<ComponentProps<typeof BaseCombobox.Input>, 'className' | 'size'> &
	VariantProps<typeof comboboxInputVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The field, and the control itself: what a reader types into to filter the list, and what shows the
 * chosen label once one is picked. It wears an Input's shell, so it is the box the focus ring is
 * drawn around and the buttons beside it never sit outside the field.
 */
export function Input({ className, size = 'md', ...props }: InputProps) {
	return (
		<BaseCombobox.Input
			data-slot="combobox-input"
			data-size={size}
			className={cn(comboboxInputVariants({ size }), className)}
			{...props}
		/>
	);
}

export type InputGroupProps = Omit<ComponentProps<typeof BaseCombobox.InputGroup>, 'className'> & {
	/** Merged with `cn()`. A `w-56` here is what narrows the control. */
	className?: string;
};

/**
 * The box the field and its buttons share. It holds no look of its own — the field does — and exists
 * to be the corner the caret and the clear button are placed against. The field's room on the end
 * grows while a clear button is mounted, so an absent button leaves no gap.
 */
export function InputGroup({ className, ...props }: InputGroupProps) {
	return (
		<BaseCombobox.InputGroup
			data-slot="combobox-input-group"
			className={cn(
				'relative',
				'has-[[data-slot=combobox-clear]]:[&_input]:pe-16',
				className,
			)}
			{...props}
		/>
	);
}

const adornmentClass = cn(
	'absolute inset-y-0 my-auto flex size-7 items-center justify-center rounded-sm',
	'text-muted-foreground transition-colors duration-(--duration-state)',
	'hover:text-foreground',
	'data-disabled:pointer-events-none data-disabled:opacity-50',
	iconSlot,
);

export type TriggerProps = Omit<ComponentProps<typeof BaseCombobox.Trigger>, 'children'> & {
	/** Replaces the caret, at the size of the text around it. */
	children?: ReactNode;
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The caret, and the button that opens the list without typing. It turns itself while the popup is
 * open, and it is labelled even though it draws nothing but a glyph.
 */
export function Trigger({
	className,
	children,
	'aria-label': label = 'Open popup',
	...props
}: TriggerProps) {
	return (
		<BaseCombobox.Trigger
			data-slot="combobox-trigger"
			aria-label={label}
			className={cn(adornmentClass, 'end-0.5 data-popup-open:rotate-180', className)}
			{...props}
		>
			{children ?? <ChevronDown />}
		</BaseCombobox.Trigger>
	);
}

export type ClearProps = Omit<ComponentProps<typeof BaseCombobox.Clear>, 'children'> & {
	/** Replaces the cross. */
	children?: ReactNode;
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The way back to an empty field. Base UI mounts it only while there is something to clear, which is
 * what the field's extra room on the end is keyed to.
 */
export function Clear({
	className,
	children,
	'aria-label': label = 'Clear selection',
	...props
}: ClearProps) {
	return (
		<BaseCombobox.Clear
			data-slot="combobox-clear"
			aria-label={label}
			className={cn(adornmentClass, 'end-8', className)}
			{...props}
		>
			{children ?? <X />}
		</BaseCombobox.Clear>
	);
}

export const Portal = BaseCombobox.Portal;

export type PositionerProps = ComponentProps<typeof BaseCombobox.Positioner>;

/** Where the list is placed: under the field, as wide as it, on the same offset Select uses. */
export function Positioner({
	className,
	align = 'start',
	sideOffset = 6,
	...props
}: PositionerProps) {
	return (
		<BaseCombobox.Positioner
			data-slot="combobox-positioner"
			align={align}
			sideOffset={sideOffset}
			className={cn('z-50 outline-none', positioner, className)}
			{...props}
		/>
	);
}

export type PopupProps = Omit<ComponentProps<typeof BaseCombobox.Popup>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The panel: at least as wide as the field, and never taller than the room the viewport left it. The
 * list inside is what scrolls, so the empty message and the status line stay where they are.
 */
export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseCombobox.Popup
			data-slot="combobox-popup"
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

export type EmptyProps = Omit<ComponentProps<typeof BaseCombobox.Empty>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * What the list says when nothing matches. The element Base UI mounts stays empty and mounted — a
 * live message that comes and goes is announced unreliably — so the look is on a box inside it,
 * which exists only while there is something to say. `className` lands on that box.
 */
export function Empty({ className, children, ...props }: EmptyProps) {
	return (
		<BaseCombobox.Empty data-slot="combobox-empty" {...props}>
			<div className={cn('px-4 py-6 text-center text-sm text-muted-foreground', className)}>
				{children ?? 'no match.'}
			</div>
		</BaseCombobox.Empty>
	);
}

export type StatusProps = Omit<ComponentProps<typeof BaseCombobox.Status>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** The line a screen reader hears when the list changes under it. Read, never seen. */
export function Status({ className, ...props }: StatusProps) {
	return (
		<BaseCombobox.Status
			data-slot="combobox-status"
			className={cn('sr-only', className)}
			{...props}
		/>
	);
}

export type ListProps = Omit<ComponentProps<typeof BaseCombobox.List>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The rows. `children` is a function when the root was given `items` — one call per item, so the
 * filtering happens in Base UI and never in a `filter` the caller has to keep in step.
 */
export function List({ className, ...props }: ListProps) {
	return (
		<BaseCombobox.List
			data-slot="combobox-list"
			className={cn(
				'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 scroll-py-6 outline-none',
				className,
			)}
			{...props}
		/>
	);
}

/** A block of rows, grouped for the arrow keys as well as the eye. */
export const Group = BaseCombobox.Group;

export type GroupLabelProps = Omit<ComponentProps<typeof BaseCombobox.GroupLabel>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

export function GroupLabel({ className, ...props }: GroupLabelProps) {
	return (
		<BaseCombobox.GroupLabel
			data-slot="combobox-group-label"
			className={cn(rowGroupLabel, className)}
			{...props}
		/>
	);
}

/** One group's items, rendered from the `items` it was given. */
export const Collection = BaseCombobox.Collection;

export type ItemProps = Omit<ComponentProps<typeof BaseCombobox.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * One option: the library's row, so it highlights exactly as a menu's action does — and the chosen
 * one is filled with that same tint rather than marked, so the label never shifts between the two
 * states, deepening a notch while the pointer is still on it. The cursor is a pointer, unlike a menu
 * row's: this is a thing to pick out of a list.
 */
export function Item({ className, ...props }: ItemProps) {
	return (
		<BaseCombobox.Item
			data-slot="combobox-item"
			className={cn(row, 'cursor-pointer pr-3 data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}

export type SeparatorProps = Omit<ComponentProps<typeof BaseCombobox.Separator>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** A line between two groups of options. */
export function Separator({ className, ...props }: SeparatorProps) {
	return (
		<BaseCombobox.Separator
			data-slot="combobox-separator"
			className={cn(rowSeparator, className)}
			{...props}
		/>
	);
}

/**
 * Base UI supplies behaviour — the filtering, the typeahead, the keyboard, the chosen label left in
 * the field — and these parts supply appearance. Compose with `render`.
 *
 * The field is the control here, and it is also the trigger: a select is what a list of options is
 * when the reader can recognise one on sight; this is what it is when they need to search for it.
 */
export const Combobox = {
	Root,
	InputGroup,
	Input,
	Trigger,
	Clear,
	Portal,
	Positioner,
	Popup,
	Empty,
	Status,
	List,
	Group,
	GroupLabel,
	Collection,
	Item,
	Separator,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Combobox/demos/basic.tsx

```tsx
import { Combobox } from '@/components/ui/combobox';

const languages = [
	'c',
	'cpp',
	'elixir',
	'go',
	'haskell',
	'javascript',
	'kotlin',
	'lua',
	'ocaml',
	'python',
	'ruby',
	'rust',
	'swift',
	'typescript',
	'zig',
];

export default function Basic() {
	return (
		<Combobox.Root items={languages}>
			<Combobox.InputGroup className="w-56">
				<Combobox.Input placeholder="search a language" aria-label="language" />
				<Combobox.Clear />
				<Combobox.Trigger />
			</Combobox.InputGroup>
			<Combobox.Portal>
				<Combobox.Positioner>
					<Combobox.Popup>
						<Combobox.Empty />
						<Combobox.List>
							{(language: string) => (
								<Combobox.Item key={language} value={language}>
									{language}
								</Combobox.Item>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
```

### src/pages/Combobox/demos/groups.tsx

```tsx
import { Combobox } from '@/components/ui/combobox';

const groups = [
	{ value: 'compiled', items: ['c', 'cpp', 'go', 'rust', 'swift', 'zig'] },
	{ value: 'interpreted', items: ['lua', 'python', 'ruby', 'typescript'] },
];

export default function Groups() {
	return (
		<Combobox.Root items={groups}>
			<Combobox.InputGroup className="w-56">
				<Combobox.Input placeholder="search a language" aria-label="language" />
				<Combobox.Clear />
				<Combobox.Trigger />
			</Combobox.InputGroup>
			<Combobox.Portal>
				<Combobox.Positioner>
					<Combobox.Popup>
						<Combobox.Empty />
						<Combobox.List>
							{(group: (typeof groups)[number]) => (
								<Combobox.Group key={group.value} items={group.items}>
									<Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
									<Combobox.Collection>
										{(language: string) => (
											<Combobox.Item key={language} value={language}>
												{language}
											</Combobox.Item>
										)}
									</Combobox.Collection>
								</Combobox.Group>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
```
