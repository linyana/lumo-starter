import { Field } from '@base-ui/react/field';
import { useRef, useState, type ChangeEvent, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Clear, clearField } from '@/components/ui/form/clear';
import { ControlSpinner } from '@/components/ui/form/loading';
import type { SlotClassNames } from '@/components/types';
import { fieldShell, fieldText } from '@/lib/control';
import { cn } from '@/lib/utils';

export const textareaVariants = tv({
	base: [fieldShell(), 'read-only:bg-muted', 'resize-y'],
	variants: {
		size: {
			sm: 'min-h-16 px-2.5 py-1.5',
			md: 'min-h-20 px-3 py-2',
			lg: 'min-h-24 px-3.5 py-2.5',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type TextareaSlots = 'root' | 'textarea' | 'clear';

export type TextareaProps = Omit<ComponentProps<'textarea'>, 'className'> &
	VariantProps<typeof textareaVariants> & {
		className?: string;
		classNames?: SlotClassNames<TextareaSlots>;
		clearable?: boolean;
		clearLabel?: string;
		loading?: boolean;
	};

export function Textarea({
	className,
	classNames,
	size = 'md',
	clearable = false,
	clearLabel = 'Clear',
	loading = false,
	value,
	defaultValue,
	disabled,
	readOnly,
	onChange,
	...props
}: TextareaProps) {
	const root = useRef<HTMLDivElement>(null);
	const [typed, setTyped] = useState(
		() => defaultValue !== undefined && String(defaultValue) !== '',
	);
	const filled = value === undefined ? typed : value !== null && String(value) !== '';
	const offered = clearable && filled && disabled !== true && readOnly !== true && !loading;

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
				fieldText[size],
				'has-[[data-slot=textarea-clear]]:[&_textarea]:pe-8',
				'has-data-[slot=control-spinner]:[&_textarea]:pe-8',
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
						disabled={disabled === true || loading}
						readOnly={readOnly}
						data-loading={loading ? '' : undefined}
						aria-busy={loading || undefined}
						onChange={handleChange}
						className={cn(textareaVariants({ size }), classNames?.textarea)}
						{...props}
					/>
				}
			/>
			{loading ? (
				<ControlSpinner className="absolute top-2 end-2 text-muted-foreground" />
			) : (
				offered && (
					<Clear
						data-slot="textarea-clear"
						label={clearLabel}
						onClick={handleClear}
						className={cn('absolute top-1.5 end-1.5', classNames?.clear)}
					/>
				)
			)}
		</div>
	);
}
