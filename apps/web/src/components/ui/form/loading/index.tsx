import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/feedback/spinner';
import { cn } from '@/lib/utils';

export type ControlSpinnerProps = {
	className?: string;
	size?: number | string;
};

export function ControlSpinner({ className, size = '1em' }: ControlSpinnerProps) {
	return (
		<span
			data-slot="control-spinner"
			aria-hidden
			className={cn('pointer-events-none inline-flex shrink-0', className)}
		>
			<Spinner size={size} label={null} />
		</span>
	);
}

export type ControlLoadingProps = {
	loading?: boolean;
	children?: ReactNode;
	className?: string;
	'data-slot'?: string;
};

export function ControlLoading({
	loading = false,
	children,
	className,
	'data-slot': slot = 'control-loading',
}: ControlLoadingProps) {
	return (
		<span data-slot={slot} className={cn('grid w-full', className)}>
			<span className={cn('col-start-1 row-start-1', loading && 'opacity-0')}>{children}</span>
			{loading && (
				<span className="col-start-1 row-start-1 flex place-self-center">
					<ControlSpinner />
				</span>
			)}
		</span>
	);
}
