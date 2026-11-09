import { Input as BaseInput } from '@base-ui/react/input';
import { useContext, useState, type ComponentProps } from 'react';
import { flushSync } from 'react-dom';
import { tv, type VariantProps } from 'tailwind-variants';
import { FieldGateContext } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { fieldShell } from '@/lib/control';

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

export type InputProps = Omit<ComponentProps<typeof BaseInput>, 'className' | 'size'> &
	VariantProps<typeof inputVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

type PointerDownEvent = Parameters<NonNullable<InputProps['onPointerDown']>>[0];
type FocusEvent = Parameters<NonNullable<InputProps['onFocus']>>[0];

/**
 * A single line of text. `size` is its height — the same 32/36/40 a Button takes, so the two line
 * up in a row — and never the browser's character count: the width comes from the container.
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
 */
export function Input({
	className,
	size = 'md',
	readOnly,
	onPointerDown,
	onFocus,
	...props
}: InputProps) {
	const gate = useContext(FieldGateContext);
	const [untouched, setUntouched] = useState(true);
	const touched = gate === null ? !untouched : gate.touched;
	const gated = readOnly === undefined && !touched;

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

	return (
		<BaseInput
			data-slot="input"
			data-size={size}
			readOnly={gated ? true : readOnly}
			onPointerDown={handlePointerDown}
			onFocus={handleFocus}
			className={cn(
				inputVariants({ size }),
				readOnly === true && 'read-only:bg-muted',
				className,
			)}
			{...props}
		/>
	);
}
