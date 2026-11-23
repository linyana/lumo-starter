import { Clear as ClearButton, type ClearProps as ClearButtonProps } from '@/components/form/clear';
import { cn } from '@/lib/utils';

export type SelectClearProps = Omit<ClearButtonProps, 'data-slot'> & {
	className?: string;
};

export function SelectClear({ className, ...props }: SelectClearProps) {
	return (
		<ClearButton
			data-slot="select-clear"
			className={cn('absolute inset-y-0 end-8 my-auto', className)}
			{...props}
		/>
	);
}
