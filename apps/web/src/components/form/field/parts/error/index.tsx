import { Field as BaseField } from '@base-ui/react/field';
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context';
import { useEffect, useRef, type ComponentProps } from 'react';
import { glide, quickSway, toTiming, useSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useFormNudge, useFormVerdict } from '../context';

export type FieldErrorProps = Omit<ComponentProps<typeof BaseField.Error>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** How far the line sways, in pixels. Small: the sentence stays where it can be read. */
const SWAY = 2;

/**
 * Away, across, back: the offsets are uneven because the crossing is the half that reads — three even
 * shares of the time is three flicks, and each segment eases on its own.
 */
const swayFrames: Keyframe[] = [
	{ offset: 0, translate: '0 0' },
	{ offset: 0.25, translate: `${-SWAY}px 0` },
	{ offset: 0.75, translate: `${SWAY}px 0` },
	{ offset: 1, translate: '0 0' },
];

/**
 * Renders nothing while the field is valid, and the field's own message — the browser's, or the
 * string `validate` returned — when it is not. Children replace that message.
 *
 * A verdict the form holds for this field wins the line, over `match` and over children alike: it is
 * the newer of the two facts, being about the value that was actually submitted. Base UI gives a
 * matched `FieldError` its own constraint and nothing else, which would bury a sentence a server sent
 * about the same field — the one case where a written message and a server's have to be told apart.
 *
 * A submit that finds this sentence already on screen says it again, and saying nothing would leave
 * the reader unsure the press was heard at all. So the line sways: once, in place, and only when the
 * words are the ones already there — a sentence that changed is the form answering, not repeating. It
 * sways on the first field that repeated and no other, which is why a form full of old verdicts moves
 * in one place rather than all over.
 */
export function FieldError({ match, className, children, ...props }: FieldErrorProps) {
	const { name } = useFieldRootContext(false);
	const fromForm = useFormVerdict(name) && (typeof match === 'string' || children !== undefined);

	// Children replace the message Base UI holds for the field, and a `children` key replaces it
	// whether or not it holds anything — so one is passed only when the caller has their own to say.
	// Without this the field's verdict renders as an empty line: the border says wrong and nothing
	// reads why.
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
			// `match` is what decides which line this is; `true` is Base UI's "show it, the reason is
			// elsewhere" — here, the form's own sentence standing in for ours.
			match={fromForm ? true : match}
			{...own}
			{...props}
		/>
	);
}
