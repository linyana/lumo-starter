import type { ComponentProps } from 'react';

export type TableBodyProps = ComponentProps<'tbody'>;

/** The records. */
export function TableBody({ className, ...props }: TableBodyProps) {
	return <tbody data-slot="table-body" className={className} {...props} />;
}
