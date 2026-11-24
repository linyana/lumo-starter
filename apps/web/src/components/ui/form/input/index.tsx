import { Input as BaseInput } from '@base-ui/react/input';
import { useRef, useState, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Clear, clearField } from '@/components/ui/form/clear';
import { ControlSpinner } from '@/components/ui/form/loading';
import type { SlotClassNames } from '@/components/types';
import { fieldShell, fieldText } from '@/lib/control';
import { cn } from '@/lib/utils';

export const inputVariants = tv({
	base: [
		fieldShell(),
		'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
	],
	variants: {
		size: {
			sm: 'h-8 px-2.5',
			md: 'h-9 px-3',
			lg: 'h-10 px-3.5',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type InputSlots = 'root' | 'input' | 'clear';

export type InputProps = Omit<ComponentProps<typeof BaseInput>, 'className' | 'size'> &
	VariantProps<typeof inputVariants> & {
		className?: string;
		classNames?: SlotClassNames<InputSlots>;
		clearable?: boolean;
		clearLabel?: string;
		loading?: boolean;
	};

type ChangeEvent = Parameters<NonNullable<InputProps['onChange']>>[0];

export function Input({
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
}: InputProps) {
	const root = useRef<HTMLDivElement>(null);
	const [typed, setTyped] = useState(
		() => defaultValue !== undefined && String(defaultValue) !== '',
	);
	const filled = value === undefined ? typed : value !== null && String(value) !== '';
	const offered = clearable && filled && disabled !== true && readOnly !== true && !loading;

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
				fieldText[size],
				'has-data-[slot=input-clear]:[&_input]:pe-8',
				'has-data-[slot=control-spinner]:[&_input]:pe-8',
				className,
				classNames?.root,
			)}
		>
			<BaseInput
				data-slot="input"
				data-size={size}
				value={value}
				defaultValue={defaultValue}
				disabled={disabled === true}
				readOnly={readOnly}
				data-loading={loading ? '' : undefined}
				aria-busy={loading || undefined}
				onChange={handleChange}
				className={cn(
					inputVariants({ size }),
					readOnly === true && 'read-only:bg-muted',
					classNames?.input,
				)}
				{...props}
			/>
			{loading ? (
				<ControlSpinner className="absolute inset-y-0 inset-e-2 text-muted-foreground" />
			) : (
				offered && (
					<Clear
						data-slot="input-clear"
						label={clearLabel}
						onClick={handleClear}
						className={cn('absolute inset-y-0 inset-e-1.5 my-auto', classNames?.clear)}
					/>
				)
			)}
		</div>
	);
}
