# avatar

> A face, or the initials standing in for one, and the row a set of them is stacked in. Base UI waits for the picture to decode and swaps it for the fallback, so neither child is conditional at the call site.

## install

```bash
bunx shadcn@latest add @lumo/avatar
```

- payload: `/r/avatar.json`
- docs page: `/avatar`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `avatar.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/avatar.tsx

```tsx
import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';

/** Three sizes, because an avatar is drawn at the size of the row it sits in and nowhere else. */
export const avatarVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
		'rounded-full bg-muted text-muted-foreground',
		'leading-none font-medium select-none',
		iconSlot,
	],
	variants: {
		size: {
			sm: 'size-6 text-xs',
			md: 'size-8 text-sm',
			lg: 'size-10 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type RootProps = Omit<ComponentProps<typeof BaseAvatar.Root>, 'className'> &
	VariantProps<typeof avatarVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The circle itself. Base UI decides which of the two children is drawn — the image while it loads
 * and once it has, the fallback when there is none or it failed — so neither is conditional here.
 */
export function Root({ className, size = 'md', ...props }: RootProps) {
	return (
		<BaseAvatar.Root
			data-slot="avatar"
			data-size={size}
			className={cn(avatarVariants({ size }), className)}
			{...props}
		/>
	);
}

export type ImageProps = Omit<ComponentProps<typeof BaseAvatar.Image>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The picture, cropped to the circle. It arrives as a fade rather than as a flash: Base UI keeps the
 * fallback until the image has decoded, so the initials are already there when it lands.
 */
export function Image({ className, ...props }: ImageProps) {
	return (
		<BaseAvatar.Image
			data-slot="avatar-image"
			className={cn(
				'size-full object-cover',
				'transition-opacity duration-(--duration-state)',
				'data-starting-style:opacity-0 data-ending-style:opacity-0',
				className,
			)}
			{...props}
		/>
	);
}

export type FallbackProps = Omit<ComponentProps<typeof BaseAvatar.Fallback>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * What is drawn when there is no picture: initials, a glyph, or a count. `delay` is the one thing to
 * reach for — a cached image arrives in a frame, and initials that flashed for that frame would be
 * worse than an empty circle.
 */
export function Fallback({ className, ...props }: FallbackProps) {
	return (
		<BaseAvatar.Fallback
			data-slot="avatar-fallback"
			className={cn('flex size-full items-center justify-center', className)}
			{...props}
		/>
	);
}

export type GroupProps = ComponentProps<'div'>;

/**
 * A row of them, overlapped. Each circle carries the page's own colour as a ring, which is what
 * separates one from the next without drawing a line between them, so the group stays one shape.
 */
export function Group({ className, ...props }: GroupProps) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				'flex items-center -space-x-2',
				'[&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-background',
				className,
			)}
			{...props}
		/>
	);
}

/** A face, or the initials standing in for one, and the row a set of them is stacked in. */
export const Avatar = { Root, Image, Fallback, Group };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Avatar/demos/basic.tsx

```tsx
import { User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

// A stock portrait, cut to a square on the face by the CDN on the way out — so the picture arrives
// in the shape the circle wants and needs no crop of its own. A project brings its own.
const picture =
	'https://ix-marketing.imgix.net/img-smart-crop_before.png?fit=facearea&facepad=3&w=128&h=128&auto=format,compress&q=80';

const sizes = ['sm', 'md', 'lg'] as const;

export default function Basic() {
	return (
		<div className="flex flex-col items-center gap-5">
			<div className="flex items-center gap-3">
				{sizes.map((size) => (
					<Avatar.Root key={size} size={size}>
						<Avatar.Image src={picture} alt="" />
						<Avatar.Fallback>LT</Avatar.Fallback>
					</Avatar.Root>
				))}
			</div>
			<div className="flex items-center gap-3">
				<Avatar.Root>
					<Avatar.Fallback>LT</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root>
					<Avatar.Fallback>林</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root>
					<Avatar.Fallback>
						<User />
					</Avatar.Fallback>
				</Avatar.Root>
			</div>
		</div>
	);
}
```

### src/pages/Avatar/demos/group.tsx

```tsx
import { Avatar } from '@/components/ui/avatar';

// A stock portrait, cut to a square on the face by the CDN on the way out — so the picture arrives
// in the shape the circle wants and needs no crop of its own. A project brings its own.
const picture =
	'https://ix-marketing.imgix.net/img-smart-crop_before.png?fit=facearea&facepad=3&w=128&h=128&auto=format,compress&q=80';

export default function Group() {
	return (
		<div className="flex flex-col items-center gap-4">
			<Avatar.Group>
				<Avatar.Root>
					<Avatar.Image src={picture} alt="" />
					<Avatar.Fallback>LT</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root>
					<Avatar.Fallback>林</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root>
					<Avatar.Fallback>MQ</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root>
					<Avatar.Fallback className="text-muted-foreground">+3</Avatar.Fallback>
				</Avatar.Root>
			</Avatar.Group>
			<p className="text-sm text-muted-foreground">7 members</p>
		</div>
	);
}
```
