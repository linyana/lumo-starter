import { Field } from '@base-ui/react/field';
import { useRef, useState, type ChangeEvent, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { fieldShell } from '@/lib/control';
import { cn } from '@/lib/utils';
import type { SlotClassNames } from '../types';
import { Clear, clearField } from './clear';

export const textareaVariants = tv({
	// `read-only` is the textarea's own: the shell is shared with controls that cannot be typed into,
	// where `:read-only` matches for their whole life.
	base: [fieldShell, 'read-only:bg-muted', 'resize-y'],
	variants: {
		size: {
			sm: 'min-h-16 px-2.5 py-1.5 text-sm',
			md: 'min-h-20 px-3 py-2 text-sm',
			lg: 'min-h-24 px-3.5 py-2.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

/** The parts several lines are drawn from: the box, the field, and the way back to empty. */
export type TextareaSlots = 'root' | 'textarea' | 'clear';

export type LumoTextareaProps = Omit<ComponentProps<'textarea'>, 'className'> &
	VariantProps<typeof textareaVariants> & {
		/** Merged with `cn()`. The box: a `w-56` here is what narrows the field. */
		className?: string;
		/** Every part, by name; `classNames.textarea` is the field itself. */
		classNames?: SlotClassNames<TextareaSlots>;
		/**
		 * Whether the field offers the way back to empty once it holds text. On by default, so a field
		 * that should not offer it says `clearable={false}`.
		 */
		clearable?: boolean;
		/** The words the clear button is labelled with, for a reader who cannot see the cross. */
		clearLabel?: string;
	};

/**
 * Several lines of text, with the way back to empty in it. The element is the browser's — there is no
 * Base UI textarea — and it is mounted through `LumoField.Control`, which is what hands it an id, a
 * describedby and the invalid flag when a field is above it. Its `size` is a minimum height; the
 * height itself is `rows`, or the corner the reader drags.
 *
 * The cross sits in the top corner and not the bottom one: the bottom is where the field is dragged
 * from, and a control there would be a second thing to hit. What fills the field is read the way an
 * input reads it — off the value when the caller holds one, off what has been typed otherwise.
 */
export function LumoTextarea({
	className,
	classNames,
	size = 'md',
	clearable = true,
	clearLabel = 'Clear',
	value,
	defaultValue,
	disabled,
	readOnly,
	onChange,
	...props
}: LumoTextareaProps) {
	const root = useRef<HTMLDivElement>(null);
	const [typed, setTyped] = useState(
		() => defaultValue !== undefined && String(defaultValue) !== '',
	);
	const filled = value === undefined ? typed : value !== null && String(value) !== '';
	const offered = clearable && filled && disabled !== true && readOnly !== true;

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
		if (value === undefined) setTyped(event.target.value !== '');
		onChange?.(event);
	};

	const handleClear = (): void => {
		const field = root.current?.querySelector('textarea');
		if (field == null) return;

		clearField(field);
		setTyped(false);
		field.focus();
	};

	return (
		<div
			ref={root}
			data-slot="textarea-root"
			className={cn(
				'relative',
				'has-[[data-slot=textarea-clear]]:[&_textarea]:pe-8',
				className,
				classNames?.root,
			)}
		>
			<Field.Control
				render={
					<textarea
						data-slot="textarea"
						data-size={size}
						value={value}
						defaultValue={defaultValue}
						disabled={disabled}
						readOnly={readOnly}
						onChange={handleChange}
						className={cn(textareaVariants({ size }), classNames?.textarea)}
						{...props}
					/>
				}
			/>
			{offered && (
				<Clear
					data-slot="textarea-clear"
					label={clearLabel}
					onClick={handleClear}
					className={cn('absolute top-1.5 end-1.5', classNames?.clear)}
				/>
			)}
		</div>
	);
}
