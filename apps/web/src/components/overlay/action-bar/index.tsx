import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CardRoot } from '@/components/display/card/parts';
import { springSlide, useSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

type IPropsType = {
	visible: boolean;
	children: ReactNode;
	className?: string;
};

const BAR_RISE = '140%';

const layer = 'pointer-events-none fixed inset-x-0 bottom-12 z-30 flex justify-center px-6';

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
					<CardRoot
						size="sm"
						className={cn(
							'pointer-events-auto w-full max-w-3xl flex-row flex-wrap items-center justify-between px-(--card-pad) shadow-lifted',
							className,
						)}
					>
						{children}
					</CardRoot>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
};
