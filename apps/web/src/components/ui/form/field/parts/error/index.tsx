import { Field as BaseField } from '@base-ui/react/field';
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type ComponentProps,
	type CSSProperties,
} from 'react';
import { glide, quickSway, toTiming, useSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useFormNudge, useFormVerdict } from '../context';

export type FieldErrorProps = Omit<ComponentProps<typeof BaseField.Error>, 'className'> & {
	className?: string;
};

const SWAY = 2;

const swayFrames: Keyframe[] = [
	{ offset: 0, translate: '0 0' },
	{ offset: 0.25, translate: `${-SWAY}px 0` },
	{ offset: 0.75, translate: `${SWAY}px 0` },
	{ offset: 1, translate: '0 0' },
];

export function FieldError({ match, className, style, children, ...props }: FieldErrorProps) {
	const { name } = useFieldRootContext(false);
	const fromForm = useFormVerdict(name) && (typeof match === 'string' || children !== undefined);

	const own = fromForm || children == null ? {} : { children };

	const line = useRef<HTMLDivElement>(null);
	const nudge = useFormNudge(name);
	const told = useRef(nudge);
	const preset = useSpring(quickSway);

	useEffect(() => {
		if (nudge === told.current) return;
		told.current = nudge;

		const element = line.current;
		if (element === null) return;

		glide({
			element,
			keyframes: swayFrames,
			timing: toTiming({ preset, from: -SWAY, to: SWAY }),
		});
	}, [nudge, preset]);

	// The box clips itself while opening and closing, so its own height says nothing about how tall
	// the message is. The line inside is never constrained, and its height is what the box reaches.
	const [height, setHeight] = useState<number>();
	const watcher = useRef<ResizeObserver | null>(null);

	const measure = useCallback((node: HTMLDivElement | null) => {
		watcher.current?.disconnect();
		watcher.current = null;
		if (node === null) return;

		const take = () => {
			const tall = Math.ceil(node.getBoundingClientRect().height);
			// A box that has not been laid out, because an ancestor is still hidden, reads as zero and
			// would clip the message for good once it is shown.
			if (tall > 0) setHeight(tall);
		};

		take();
		watcher.current = new ResizeObserver(take);
		watcher.current.observe(node);
	}, []);

	const room =
		height === undefined ? undefined : ({ '--field-error-height': `${height}px` } as CSSProperties);

	const sized: FieldErrorProps['style'] =
		room === undefined
			? style
			: typeof style === 'function'
				? (state) => ({ ...style(state), ...room })
				: { ...style, ...room };

	return (
		<BaseField.Error
			ref={line}
			match={fromForm ? true : match}
			{...own}
			{...props}
			data-slot="field-error"
			style={sized}
			className={cn(
				'overflow-clip text-sm text-destructive',
				'max-h-(--field-error-height)',
				'transition-[max-height,opacity] duration-(--duration-turn) ease-(--ease-overlay)',
				'data-starting-style:max-h-0 data-starting-style:opacity-0',
				'data-ending-style:max-h-0 data-ending-style:opacity-0',
				className,
			)}
			render={(elementProps) => {
				const { children: message, ...rest } = elementProps;

				return (
					<div {...rest}>
						<div ref={measure}>{message}</div>
					</div>
				);
			}}
		/>
	);
}
