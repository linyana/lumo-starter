import { useId } from 'react';
import { ControlSpinner } from '@/components/ui/form/loading';
import { cn } from '@/lib/utils';
import { SwitchRoot, SwitchThumb } from './parts';
import type { SwitchProps } from './types';

export const Switch = ({
	label,
	id,
	value,
	defaultValue,
	loading = false,
	onChange,
	className,
	classNames,
	...props
}: SwitchProps) => {
	const generated = useId();
	const inputId = id ?? generated;

	return (
		<div className={cn('flex items-center gap-2', className, classNames?.root)}>
			<SwitchRoot
				id={inputId}
				checked={value}
				defaultChecked={defaultValue}
				onCheckedChange={onChange}
				{...props}
				disabled={props.disabled === true || loading}
				data-loading={loading ? '' : undefined}
				aria-busy={loading || undefined}
				className={cn('group/switch', classNames?.track)}
			>
				<SwitchThumb
					className={cn(
						loading && 'flex items-center justify-center bg-transparent shadow-none',
						classNames?.thumb,
					)}
				>
					{loading && (
						<ControlSpinner
							size="0.75em"
							className="text-muted-foreground group-data-[checked]/switch:text-primary-foreground"
						/>
					)}
				</SwitchThumb>
			</SwitchRoot>
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
