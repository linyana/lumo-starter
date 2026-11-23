import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/feedback/spinner';
import { cn } from '@/lib/utils';
import { useToastItem } from '../context';

function glyphOf(type: string | undefined): ReactNode {
	switch (type) {
		case 'success':
			return <CircleCheck />;
		case 'error':
			return <CircleX />;
		case 'warning':
			return <TriangleAlert />;
		case 'info':
			return <Info />;
		case 'loading':
			return <Spinner className="size-4" label={null} />;
		default:
			return null;
	}
}

function toneOf(type: string | undefined) {
	if (type === 'success') return 'text-success';
	if (type === 'error') return 'text-destructive';
	if (type === 'warning') return 'text-warning';
	if (type === 'info') return 'text-info';
	return 'text-muted-foreground';
}

export type ToastIconProps = {
	type?: string;
	icon?: ReactNode;
	className?: string;
};

export function ToastIcon({ type, icon, className }: ToastIconProps) {
	const toast = useToastItem();
	const resolved = type ?? toast?.type;
	const glyph = icon ?? glyphOf(resolved);

	if (glyph === null) return null;

	return (
		<span
			data-slot="toast-icon"
			className={cn(
				'mt-0.5 flex size-4 shrink-0 items-center justify-center',
				'[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
				toneOf(resolved),
				className,
			)}
		>
			{glyph}
		</span>
	);
}
