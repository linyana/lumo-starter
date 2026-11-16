import { Field as BaseField } from '@base-ui/react/field';
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { useFormVerdict } from '../context';

export type FieldErrorProps = Omit<ComponentProps<typeof BaseField.Error>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * Renders nothing while the field is valid, and the field's own message — the browser's, or the
 * string `validate` returned — when it is not. Children replace that message.
 *
 * A verdict the form holds for this field wins the line, over `match` and over children alike: it is
 * the newer of the two facts, being about the value that was actually submitted. Base UI gives a
 * matched `FieldError` its own constraint and nothing else, which would bury a sentence a server sent
 * about the same field — the one case where a written message and a server's have to be told apart.
 */
export function FieldError({ match, className, children, ...props }: FieldErrorProps) {
	const { name } = useFieldRootContext(false);
	const fromForm = useFormVerdict(name) && (typeof match === 'string' || children !== undefined);

	return (
		<BaseField.Error
			data-slot="field-error"
			className={cn('text-sm text-destructive', className)}
			// `match` is what decides which line this is; `true` is Base UI's "show it, the reason is
			// elsewhere" — here, the form's own sentence standing in for ours.
			match={fromForm ? true : match}
			{...props}
		>
			{fromForm ? null : children}
		</BaseField.Error>
	);
}
