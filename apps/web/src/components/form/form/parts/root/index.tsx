import { Form as BaseForm, type FormProps as BaseFormProps } from '@base-ui/react/form';
import { useMemo, useState, type Ref } from 'react';
import { cn } from '@/lib/utils';
import type { FormErrors } from '../../types';
import { FieldGateContext, type FieldGate } from '../context';

export type FormRootProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
	BaseFormProps<Values>,
	'className' | 'errors'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Keyed by each `FieldRoot`'s `name`; handed to Base UI as it stands. */
	errors?: FormErrors;
	/** The element itself, so a failed submit can find the first field to focus. */
	ref?: Ref<HTMLFormElement>;
};

/**
 * A native `<form>` that knows about the fields inside it: it collects their values, validates them
 * on submit, moves focus to the first one that failed, and hands each error back to its own field —
 * so nothing is wired between the two by hand.
 *
 * The stack is the only appearance it adds. Every judgement about *when* a verdict is delivered
 * belongs to `validationMode`, here for the whole form and on a single `FieldRoot` for one field.
 * The gate it hands down is likewise about *when*, not about what a field looks like.
 */
export function FormRoot<Values extends Record<string, unknown> = Record<string, unknown>>({
	className,
	...props
}: FormRootProps<Values>) {
	const [touched, setTouched] = useState(false);
	const gate = useMemo<FieldGate>(() => ({ touched, touch: () => setTouched(true) }), [touched]);

	return (
		<FieldGateContext.Provider value={gate}>
			<BaseForm data-slot="form" className={cn('flex flex-col gap-3', className)} {...props} />
		</FieldGateContext.Provider>
	);
}
