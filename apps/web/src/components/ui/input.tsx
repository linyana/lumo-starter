import { Input as BaseInput } from '@base-ui/react/input';
import { useContext, useRef, useState, type ComponentProps } from 'react';
import { flushSync } from 'react-dom';
import { tv, type VariantProps } from 'tailwind-variants';
import { FieldGateContext } from '@/components/ui/form';
import { fieldShell } from '@/lib/control';
import { cn } from '@/lib/utils';
import type { SlotClassNames } from '../types';
import { Clear, clearField } from './clear';

export const inputVariants = tv({
	base: [
		fieldShell,
		// A file input is a field with a button in it; the button is the browser's, so its shape is
		// settled here rather than in a part.
		'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
	],
	variants: {
		size: {
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-9 px-3 text-sm',
			lg: 'h-10 px-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

/** The parts a field is drawn from: the box the field and its way out share, the field, that way out. */
export type InputSlots = 'root' | 'input' | 'clear';

export type LumoInputProps = Omit<ComponentProps<typeof BaseInput>, 'className' | 'size'> &
	VariantProps<typeof inputVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. The box: a `w-56` here is what narrows the field. */
		className?: string;
		/** Every part, by name; `classNames.input` is the field itself. */
		classNames?: SlotClassNames<InputSlots>;
		/**
		 * Whether the field offers the way back to empty once it holds text. On by default, so a field
		 * that should not offer it says `clearable={false}`.
		 */
		clearable?: boolean;
		/** The words the clear button is labelled with, for a reader who cannot see the cross. */
		clearLabel?: string;
	};

type PointerDownEvent = Parameters<NonNullable<LumoInputProps['onPointerDown']>>[0];
type FocusEvent = Parameters<NonNullable<LumoInputProps['onFocus']>>[0];
type ChangeEvent = Parameters<NonNullable<LumoInputProps['onChange']>>[0];

/**
 * A single line of text, with the way back to empty in it. `size` is its height — the same 32/36/40 a
 * LumoButton takes, so the two line up in a row — and never the browser's character count: the width
 * comes from the container, which is the box this field and its cross are laid out in.
 *
 * A field opens read-only and turns editable at the first sign of the reader's intent. A browser
 * fills the forms it recognises — saved credentials, a name, an address — while the page is being
 * painted, so a reader arrives at fields already answered that nobody asked to have answered. The
 * only lever is the node it writes to: a field it cannot write to is one it leaves alone. Waiting
 * costs nothing, because the fill a reader actually wants is the one offered from the moment they
 * reach the field. The gate belongs to the form when there is one — a credential arrives with its
 * username or not at all, so the fields open together — and to the field itself when it stands
 * alone. A field the caller withholds is a different thing entirely and keeps the tint of a value
 * being shown rather than being typed.
 *
 * The cross appears once there is something to clear, and leaves the field as empty and as focused as
 * a reader who deleted every letter. What fills the field is read from the value when the caller holds
 * one and from what has been typed otherwise, so a call site never says which of the two it is. The
 * field keeps its own room on the end only while the cross is mounted, so an empty field is not padded
 * for a button that is not there.
 */
export function LumoInput({
	className,
	classNames,
	size = 'md',
	clearable = true,
	clearLabel = 'Clear',
	value,
	defaultValue,
	disabled,
	readOnly,
	onPointerDown,
	onFocus,
	onChange,
	...props
}: LumoInputProps) {
	const gate = useContext(FieldGateContext);
	const [untouched, setUntouched] = useState(true);
	const touched = gate === null ? !untouched : gate.touched;
	const gated = readOnly === undefined && !touched;

	const root = useRef<HTMLDivElement>(null);
	const [typed, setTyped] = useState(
		() => defaultValue !== undefined && String(defaultValue) !== '',
	);
	const filled = value === undefined ? typed : value !== null && String(value) !== '';
	const offered = clearable && filled && disabled !== true && readOnly !== true;

	const open = (): void => {
		if (gate === null) setUntouched(false);
		else gate.touch();
	};

	const handlePointerDown = (event: PointerDownEvent): void => {
		// The browser decides what this field is at its own focus action, which follows this event: a
		// node still read-only there is one a touch keyboard will not open for, and one an autofill will
		// not reach. Flushed, so that the unlock is in the DOM before that action rather than at the end
		// of React's batch.
		if (gated) flushSync(open);
		onPointerDown?.(event);
	};

	const handleFocus = (event: FocusEvent): void => {
		// Keyboard input never fires a pointer event, so focus is its earliest sign; what is typed
		// arrives in a later task than this batch.
		if (gated) open();
		onFocus?.(event);
	};

	const handleChange = (event: ChangeEvent): void => {
		if (value === undefined) setTyped(event.target.value !== '');
		onChange?.(event);
	};

	const handleClear = (): void => {
		const input = root.current?.querySelector('input');
		if (input == null) return;

		clearField(input);
		setTyped(false);
		input.focus();
	};

	return (
		<div
			ref={root}
			data-slot="input-root"
			className={cn(
				'relative',
				'has-data-[slot=input-clear]:[&_input]:pe-8',
				className,
				classNames?.root,
			)}
		>
			<BaseInput
				data-slot="input"
				data-size={size}
				value={value}
				defaultValue={defaultValue}
				disabled={disabled}
				readOnly={gated ? true : readOnly}
				onPointerDown={handlePointerDown}
				onFocus={handleFocus}
				onChange={handleChange}
				className={cn(
					inputVariants({ size }),
					readOnly === true && 'read-only:bg-muted',
					classNames?.input,
				)}
				{...props}
			/>
			{offered && (
				<Clear
					data-slot="input-clear"
					label={clearLabel}
					onClick={handleClear}
					className={cn('absolute inset-y-0 inset-e-1.5 my-auto', classNames?.clear)}
				/>
			)}
		</div>
	);
}
