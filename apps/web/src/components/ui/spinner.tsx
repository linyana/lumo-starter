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
	 * Cover the nearest positioned ancestor with a scrim and centre the spinner in it — the wait that
	 * keeps what it is waiting on, rather than replacing it. The spinner's own box is the layer's, so
	 * `className` is merged onto the layer, which is where a caller rounds it to the frame it covers.
	 */
	mask?: boolean;
	/**
	 * The words under the spinner. They are said only once the wait has run past `captionDelay`,
	 * because a wait that ends in a moment never needed them — so passing no caption says nothing.
	 */
	caption?: ReactNode;
	/** How long the wait is before the caption is worth saying, in milliseconds. Defaults to five seconds. */
	captionDelay?: number;
};

/** Eight dots, each a fifth of the box, on a ring a third of it across. */
const dotCount = 8;
const dotScale = 0.2;
const radiusScale = 0.34;

export function LumoSpinner({
	className,
	style,
	size,
	label = 'Loading',
	mask = false,
	caption,
	captionDelay = 5000,
	...props
}: LumoSpinnerProps) {
	const box = typeof size === 'number' ? `${size}em` : size;

	// The clock belongs to the wait and not to the spinner: it starts when the spinner does, and
	// unmounting — the wait ending — takes it away with nothing left to say.
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
				// The layer carries the class under a mask: it is the box the caller is covering with.
				!mask && className,
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
			{mask ? (
				<span
					data-slot="spinner-mask"
					className={cn(
						'absolute inset-0 z-20 grid place-items-center',
						'bg-background/70 text-muted-foreground',
						className,
					)}
				>
					<span className="inline-flex flex-col items-center gap-2">
						{ring}
						{waited && caption !== undefined && caption !== null && (
							<span data-slot="spinner-caption" className="text-sm">
								{caption}
							</span>
						)}
					</span>
				</span>
			) : (
				ring
			)}
		</>
	);
}
