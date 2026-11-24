import { useId } from 'react';
import { ControlSpinner } from '@/components/ui/form/loading';
import { cn } from '@/lib/utils';
import { CheckboxIndicator, CheckboxRoot } from './parts';
import type { CheckboxProps } from './types';

export const Checkbox = ({
	label,
	id,
	value,
	defaultValue,
	loading = false,
	onChange,
	className,
	classNames,
	...props
}: CheckboxProps) => {
	const generated = useId();
	const inputId = id ?? generated;

	return (
		<div className={cn('flex items-center gap-2', className, classNames?.root)}>
			<CheckboxRoot
				id={inputId}
				checked={value}
				defaultChecked={defaultValue}
				onCheckedChange={onChange}
				{...props}
				disabled={props.disabled === true || loading}
				data-loading={loading ? '' : undefined}
				aria-busy={loading || undefined}
				className={classNames?.box}
			>
				{loading ? (
					<ControlSpinner size="0.75em" />
				) : (
					<CheckboxIndicator className={classNames?.indicator} />
				)}
			</CheckboxRoot>
			{label !== undefined && (
				<label
					htmlFor={inputId}
					className={cn('cursor-pointer text-sm select-none', classNames?.label)}
				>
					{label}
				</label>
			)}
		</div>
	);
};
