import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type LumoSpinnerProps = ComponentProps<'span'> & {
	/**
	 * The box: a number is ems of the text around it, a string is any CSS length. It wins over a
	 * `size-*` class, so a call site sizes the spinner one way or the other.
	 */
	size?: number | string;
	/** Visually hidden status text. Pass `null` inside a control that already announces itself. */
	label?: ReactNode;
	/**
	 * The words under the ring. They are said only once a wait has run past `captionDelay`, because a
	 * wait that ends in a moment never needed them — so passing no caption says nothing at all.
	 */
	caption?: ReactNode;
	/** How long the wait is before the caption is worth saying, in milliseconds. Defaults to five seconds. */
	captionDelay?: number;
};

/** Eight dots, each a fifth of the box, on a ring a third of it across. */
const dotCount = 8;
const dotScale = 0.2;
const radiusScale = 0.34;

/**
 * The ring itself, and the words it is worth putting under one. It draws no layer of its own: what a
 * wait covers is the business of what is being waited on — a table covers the rows it already had —
 * so the box that a spinner sits in the middle of is the caller's to make.
 */
export function LumoSpinner({
	className,
	style,
	size,
	label = 'Loading',
	caption,
	captionDelay = 5000,
	...props
}: LumoSpinnerProps) {
	const box = typeof size === 'number' ? `${size}em` : size;

	// The clock belongs to the wait and not to the spinner: it starts when the spinner does, and a
	// wait ending — the caller dropping the caption — takes the words away with it.
	const [waited, setWaited] = useState(false);
	useEffect(() => {
		if (caption === undefined || caption === null) return;
		const timer = setTimeout(() => setWaited(true), captionDelay);
		return () => clearTimeout(timer);
	}, [caption, captionDelay]);

	const ring = (
		<span
			data-slot="spinner"
			role={label ? 'status' : undefined}
			className={cn(
				'@container-size relative inline-flex aspect-square size-[2em] align-middle',
				'items-center justify-center',
			)}
			style={{ width: box, height: box, ...style }}
			{...props}
		>
			<span aria-hidden="true" className="relative block size-full">
				{Array.from({ length: dotCount }, (_, index) => {
					const angle = (index / dotCount) * Math.PI * 2;
					const x = `${(Math.sin(angle) * radiusScale * 100).toFixed(2)}cqmin`;
					const y = `${(-Math.cos(angle) * radiusScale * 100).toFixed(2)}cqmin`;

					return (
						<span
							key={index}
							className="absolute top-1/2 left-1/2"
							style={{
								width: `calc(${dotScale} * 100cqmin)`,
								height: `calc(${dotScale} * 100cqmin)`,
								transform: `translate(-50%, -50%) translate(${x}, ${y})`,
							}}
						>
							<span
								data-slot="spinner-dot"
								className="block size-full rounded-full bg-current"
								style={{
									animation: 'lumo-spinner-pulse var(--duration, 1s) linear infinite',
									animationDelay: `calc(var(--duration, 1s) / ${dotCount} * ${index - dotCount})`,
								}}
							/>
						</span>
					);
				})}
			</span>
			{label ? <span className="sr-only">{label}</span> : null}
		</span>
	);

	const said = waited && caption !== undefined && caption !== null;

	return (
		<>
			<style href="lumo-spinner" precedence="default">
				{`@keyframes lumo-spinner-pulse {
	0%,
	100% {
		opacity: 0.25;
		transform: scale(0.65);
	}

	12.5% {
		opacity: 1;
		transform: scale(1);
	}

	25% {
		opacity: 0.75;
		transform: scale(0.85);
	}

	50% {
		opacity: 0.35;
		transform: scale(0.7);
	}
}`}
			</style>
			{caption === undefined || caption === null ? (
				ring
			) : (
				<span className={cn('inline-flex flex-col items-center gap-2', className)}>
					{ring}
					{said && (
						<span data-slot="spinner-caption" className="text-sm">
							{caption}
						</span>
					)}
				</span>
			)}
		</>
	);
}
