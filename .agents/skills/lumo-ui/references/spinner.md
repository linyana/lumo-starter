# spinner

> Default loading indicator: a container-query sized ring of pulsing dots, one em across so it matches the icon it replaces. Cancel the status role where the surrounding control already announces its own state.

## install

```bash
bunx shadcn@latest add @lumo/spinner
```

- payload: `/r/spinner.json`
- docs page: `/spinner`
- comes with it: `@lumo/utils`
- lands in: `spinner.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/spinner.tsx

```tsx
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type SpinnerProps = ComponentProps<'span'> & {
	dots?: number;
	dotScale?: number;
	radiusScale?: number;
	/** Visually hidden status text. Pass `null` inside a control that already announces itself. */
	label?: ReactNode;
};

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function Spinner({
	className,
	style,
	dots = 8,
	dotScale = 0.2,
	radiusScale = 0.34,
	label = 'Loading',
	...props
}: SpinnerProps) {
	const dotCount = Math.max(4, Math.floor(dots));
	const safeDotScale = clamp(dotScale, 0.2, 0.4);
	const safeRadiusScale = clamp(radiusScale, 0, 0.5 - safeDotScale / 2);

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
			<span
				data-slot="spinner"
				role={label ? 'status' : undefined}
				className={cn(
					'@container-size relative inline-flex aspect-square size-[1em] align-middle',
					'items-center justify-center',
					className,
				)}
				style={style}
				{...props}
			>
				<span aria-hidden="true" className="relative block size-full">
					{Array.from({ length: dotCount }, (_, index) => {
						const angle = (index / dotCount) * Math.PI * 2;
						const x = `${(Math.sin(angle) * safeRadiusScale * 100).toFixed(2)}cqmin`;
						const y = `${(-Math.cos(angle) * safeRadiusScale * 100).toFixed(2)}cqmin`;

						return (
							<span
								key={index}
								className="absolute top-1/2 left-1/2"
								style={{
									width: `calc(${safeDotScale} * 100cqmin)`,
									height: `calc(${safeDotScale} * 100cqmin)`,
									transform: `translate(-50%, -50%) translate(${x}, ${y})`,
								}}
							>
								<span
									data-slot="spinner-dot"
									className="block size-full rounded-full bg-current"
									style={{
										animation:
											'lumo-spinner-pulse var(--duration, 1s) linear infinite',
										animationDelay: `calc(var(--duration, 1s) / ${dotCount} * ${index - dotCount})`,
									}}
								/>
							</span>
						);
					})}
				</span>
				{label ? <span className="sr-only">{label}</span> : null}
			</span>
		</>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Spinner/demos/basic.tsx

```tsx
import { Spinner } from '@/components/ui/spinner';

export default function Basic() {
	return <Spinner />;
}
```

### src/pages/Spinner/demos/inline.tsx

```tsx
import { Spinner } from '@/components/ui/spinner';

/** The same spinner in the type size of the control it sits in: it is one em across. */
export default function Inline() {
	return (
		<div className="space-y-3 text-sm">
			<div className="flex items-center gap-2">
				<Spinner label={null} />
				<span className="text-muted-foreground">next to text-sm, it is text-sm wide</span>
			</div>
			<div className="flex items-center gap-3 text-2xl">
				<Spinner label={null} />
				<span className="text-muted-foreground text-sm">next to text-2xl, it grows</span>
			</div>
		</div>
	);
}
```

### src/pages/Spinner/demos/sizes.tsx

```tsx
import { Spinner } from '@/components/ui/spinner';

export default function Sizes() {
	return (
		<div className="flex flex-wrap items-center gap-6 text-foreground">
			<Spinner />
			<Spinner className="size-6" />
			<Spinner className="size-10 text-muted-foreground" label="saving" />
		</div>
	);
}
```
