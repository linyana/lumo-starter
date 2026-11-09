import { LumoField } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import type { FieldProps } from './types';

/**
 * One control, its name, and the line beneath it. The control inside is labelled and validated by
 * this field, so nothing is wired between the two by hand.
 */
export const Field = ({
	label,
	description,
	error,
	children,
	className,
	classNames,
	...props
}: FieldProps) => (
	<LumoField.Root className={cn(className, classNames?.root)} {...props}>
		{label !== undefined && (
			<LumoField.Label className={classNames?.label}>{label}</LumoField.Label>
		)}
		{children}
		{description !== undefined && (
			<LumoField.Description className={classNames?.description}>
				{description}
			</LumoField.Description>
		)}
		<LumoField.Error className={classNames?.error}>{error}</LumoField.Error>
	</LumoField.Root>
);
