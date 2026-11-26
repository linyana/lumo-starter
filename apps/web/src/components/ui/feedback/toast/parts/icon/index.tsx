import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/feedback/spinner';
import { cn } from '@/lib/utils';
import { useToastItem } from '../context';
import { ToastGlyph } from './glyphs';

function glyphOf(type: string | undefined): ReactNode {
	switch (type) {
		case 'success':
			return <ToastGlyph name="success" />;
		case 'error':
			return <ToastGlyph name="error" />;
		case 'warning':
			return <ToastGlyph name="warning" />;
		case 'info':
			return <ToastGlyph name="info" />;
		case 'loading':
			return <Spinner size="1.25rem" label={null} />;
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
				'flex shrink-0 items-center [grid-area:icon]',
				"has-[>svg]:h-lh [&>svg:not([class*='size-'])]:size-5",
				toneOf(resolved),
				className,
			)}
		>
			{glyph}
		</span>
	);
}
