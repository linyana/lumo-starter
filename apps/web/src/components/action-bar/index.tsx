import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LumoCard } from '@/components/ui/card';
import { springSlide, useSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

type IPropsType = {
	/**
	 * Whether the bar is on screen. It leaves by the door it came in through, so it stays mounted — and
	 * keeps showing what it was showing — until the way out is finished.
	 */
	visible: boolean;
	/** The bar's one line: what it is about on one side, what can be done about it on the other. */
	children: ReactNode;
	/** Merged onto the card, last. */
	className?: string;
};

/** How far down the bar waits while it is not on screen. Past the edge, so nothing of it shows. */
const BAR_RISE = '140%';

/**
 * The layer the bar arrives in. It takes no pointer of its own: what a reader can press is the card,
 * and the page around it stays a page.
 */
const layer = 'pointer-events-none fixed inset-x-0 bottom-12 z-30 flex justify-center px-6';

/**
 * A bar of actions that floats over the page it acts on — a chosen set of records, an edited form, the
 * one thing a screen is asking for right now. It is drawn in the page's own layer rather than in the
 * thing it belongs to, because a bar under a table would be a row of the table: this one follows the
 * reader past the end of whatever it came from, and takes no room when nothing is chosen.
 *
 * The surface is the card, defaults and all — a block that stands off the page, from the one place the
 * app says what that looks like. What the bar adds is where it stands, how it arrives, and one line:
 * its content on the start edge and the presses on the end.
 */
export const ActionBar = ({ visible, children, className }: IPropsType) => {
	const rise = useSpring(springSlide);

	return createPortal(
		<AnimatePresence>
			{visible && (
				<motion.div
					data-slot="action-bar"
					className={layer}
					initial={{ y: BAR_RISE, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: BAR_RISE, opacity: 0 }}
					transition={rise}
				>
					<LumoCard.Root
						// The card's own compact size, not a padding written over the roomy one: a bar is one line, and
						// the inset and the gap of a card with a body under its header would make it two. The one thing
						// tightened further is the top and bottom, which is a bar's own height rather than a card's.
						size="sm"
						className={cn(
							'pointer-events-auto w-full max-w-3xl flex-row flex-wrap items-center justify-between px-(--card-pad) shadow-lifted',
							className,
						)}
					>
						{children}
					</LumoCard.Root>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
};
