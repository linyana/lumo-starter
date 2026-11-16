import type { ComponentProps } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type NavActionProps = ComponentProps<'button'> & {
	/** Keeps the row quiet until it is hovered or focused. */
	showOnHover?: boolean;
};

/**
 * The square every secondary action is drawn in: one glyph, no fill of its own, and a hit area
 * widened on touch where the glyph is too small to aim at. Where it sits is the row's business, or
 * the group's, so only that is left to the two components below.
 */
const actionShell = cn(
	'absolute flex aspect-square w-5 cursor-pointer items-center justify-center',
	'rounded-md p-0 text-muted-foreground select-none',
	'transition-[color,background-color,opacity] duration-(--duration-state)',
	'hover:bg-accent hover:text-accent-foreground',
	// Widens the hit area on touch, where the glyph itself is too small.
	'after:absolute after:-inset-2 md:after:hidden',
	iconSlot,
	'group-data-[compact]:hidden',
);

type ActionGlyphProps = ComponentProps<'button'> & { slot: string };

export function ActionGlyph({ slot, className, ...props }: ActionGlyphProps) {
	return <button data-slot={slot} className={cn(actionShell, className)} {...props} />;
}

/** A secondary action that rides on a row, such as "more" or a delete. */
export function NavAction({ className, showOnHover = false, ...props }: NavActionProps) {
	return (
		<ActionGlyph
			slot="nav-action"
			className={cn(
				'inset-e-1',
				'peer-hover/nav-button:text-accent-foreground',
				'peer-data-[size=sm]/nav-button:top-1',
				'peer-data-[size=md]/nav-button:top-1.5',
				'peer-data-[size=lg]/nav-button:top-2.5',
				showOnHover && [
					// Out of the way until its own row is hovered or the action itself is reached. The
					// row's button is the `peer`, so one hovered row cannot light up the actions of the
					// rows inside it; the action's own hover then holds it open once it has taken the
					// pointer over from that button.
					'md:pointer-events-none md:opacity-0',
					'peer-hover/nav-button:pointer-events-auto peer-hover/nav-button:opacity-100',
					'hover:pointer-events-auto hover:opacity-100',
					'focus-visible:pointer-events-auto focus-visible:opacity-100',
				],
				className,
			)}
			{...props}
		/>
	);
}
