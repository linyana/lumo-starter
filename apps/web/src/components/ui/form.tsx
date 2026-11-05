import { Form as BaseForm, type FormProps as BaseFormProps } from '@base-ui/react/form';
import { cn } from '@/lib/utils';

/**
 * The verdicts a form holds for its fields, keyed by the `name` on their `Field.Root` — the same
 * shape a server action returns, so what a server answers goes in unchanged.
 */
export type FormErrors = Record<string, string | string[]>;

export type FormProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
	BaseFormProps<Values>,
	'className' | 'errors'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Keyed by each `Field.Root`'s `name`; handed to Base UI as it stands. */
	errors?: FormErrors;
};

/**
 * A native `<form>` that knows about the fields inside it: it collects their values, validates them
 * on submit, moves focus to the first one that failed, and hands each error back to its own field —
 * so nothing is wired between the two by hand.
 *
 * The stack is the only appearance it adds. Every judgement about *when* a verdict is delivered
 * belongs to `validationMode`, here for the whole form and on a single `Field.Root` for one field.
 */
export function Form<Values extends Record<string, unknown> = Record<string, unknown>>({
	className,
	...props
}: FormProps<Values>) {
	return (
		<BaseForm data-slot="form" className={cn('flex flex-col gap-4', className)} {...props} />
	);
}
