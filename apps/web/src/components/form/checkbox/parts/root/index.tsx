import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useCallback, type ComponentProps } from 'react';
import { toggleBox } from '@/lib/control';
import { cn } from '@/lib/utils';

export type CheckboxRootProps = Omit<ComponentProps<typeof BaseCheckbox.Root>, 'className'> & {
	className?: string;
};

const rebound: Keyframe[] = [
	{ scale: '1' },
	{ scale: '0.88', offset: 0.3 },
	{ scale: '1.06', offset: 0.68 },
	{ scale: '1' },
];

function observeMark(box: HTMLElement) {
	if (typeof box.animate !== 'function') return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let mark = box.getAttribute('aria-checked');
	let animation: Animation | undefined;
	const observer = new MutationObserver(() => {
		const nextMark = box.getAttribute('aria-checked');
		if (mark === nextMark) return;

		mark = nextMark;
		animation?.cancel();
		animation = reducedMotion.matches
			? undefined
			: box.animate(rebound, { duration: 240, easing: 'ease-in-out' });
	});
	observer.observe(box, { attributeFilter: ['aria-checked'] });

	return () => {
		observer.disconnect();
		animation?.cancel();
	};
}

export function CheckboxRoot({ className, ref, ...props }: CheckboxRootProps) {
	const boxRef = useCallback(
		(box: HTMLElement | null) => {
			if (!box) return;

			const release = typeof ref === 'function' ? ref(box) : undefined;
			if (ref && typeof ref !== 'function') ref.current = box;
			const unobserve = observeMark(box);

			return () => {
				unobserve?.();
				if (typeof release === 'function') release();
				else if (typeof ref === 'function') ref(null);
				else if (ref) ref.current = null;
			};
		},
		[ref],
	);

	return (
		<BaseCheckbox.Root
			ref={boxRef}
			data-slot="checkbox"
			className={cn(
				toggleBox,
				'rounded-sm text-primary-foreground',
				'data-checked:bg-primary',
				'data-indeterminate:border-primary data-indeterminate:bg-primary',
				className,
			)}
			{...props}
		/>
	);
}
