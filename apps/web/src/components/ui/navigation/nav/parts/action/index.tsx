import type { ComponentProps } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export type NavActionProps = ComponentProps<'button'> & {
	showOnHover?: boolean;
};

const actionShell = cn(
	'absolute flex aspect-square w-5 cursor-pointer items-center justify-center',
	'rounded-md p-0 text-muted-foreground select-none',
	'transition-[color,background-color,opacity] duration-(--duration-state)',
	'hover:bg-accent hover:text-accent-foreground',
	'after:absolute after:-inset-2 md:after:hidden',
	iconSlot,
	'group-data-[compact]:hidden',
);

type ActionGlyphProps = ComponentProps<'button'> & { slot: string };

export function ActionGlyph({ slot, className, ...props }: ActionGlyphProps) {
	return <button data-slot={slot} className={cn(actionShell, className)} {...props} />;
}

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
