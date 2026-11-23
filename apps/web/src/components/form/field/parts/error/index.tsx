import { Field as BaseField } from '@base-ui/react/field';
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context';
import { useEffect, useRef, type ComponentProps } from 'react';
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

export function FieldError({ match, className, children, ...props }: FieldErrorProps) {
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

	return (
		<BaseField.Error
			ref={line}
			data-slot="field-error"
			className={cn('text-sm text-destructive', className)}
			match={fromForm ? true : match}
			{...own}
			{...props}
		/>
	);
}
