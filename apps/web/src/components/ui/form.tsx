import { Form as BaseForm, type FormProps as BaseFormProps } from '@base-ui/react/form';
import { createContext, useMemo, useState } from 'react';
import type { Ref } from 'react';
import { cn } from '@/lib/utils';

/**
 * The verdicts a form holds for its fields, keyed by the `name` on their `LumoField.Root` — the same
 * shape a server action returns, so what a server answers goes in unchanged.
 */
export type FormErrors = Record<string, string | string[]>;

export type LumoFormProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
	BaseFormProps<Values>,
	'className' | 'errors'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Keyed by each `LumoField.Root`'s `name`; handed to Base UI as it stands. */
	errors?: FormErrors;
	/** The element itself, so a failed submit can find the first field to focus. */
	ref?: Ref<HTMLFormElement>;
};

/**
 * The reader's arrival, as the fields inside a form share it. An input opens read-only, and `touch`
 * is what the first one reached calls; from then on they are all editable, because a browser fills a
 * form as one thing — a password arrives with its username or not at all — and a field that opened
 * by itself would be the one the other half could never reach. It is read by `LumoInput`, which falls
 * back to a gate of its own outside a form rather than to no gate at all.
 */
export type FieldGate = { touched: boolean; touch: () => void };

export const FieldGateContext = createContext<FieldGate | null>(null);

/**
 * A native `<form>` that knows about the fields inside it: it collects their values, validates them
 * on submit, moves focus to the first one that failed, and hands each error back to its own field —
 * so nothing is wired between the two by hand.
 *
 * The stack is the only appearance it adds. Every judgement about *when* a verdict is delivered
 * belongs to `validationMode`, here for the whole form and on a single `LumoField.Root` for one field.
 * The gate it hands down is likewise about *when*, not about what a field looks like.
 */
export function LumoForm<Values extends Record<string, unknown> = Record<string, unknown>>({
	className,
	...props
}: LumoFormProps<Values>) {
	const [touched, setTouched] = useState(false);
	const gate = useMemo<FieldGate>(() => ({ touched, touch: () => setTouched(true) }), [touched]);

	return (
		<FieldGateContext.Provider value={gate}>
			<BaseForm data-slot="form" className={cn('flex flex-col gap-2', className)} {...props} />
		</FieldGateContext.Provider>
	);
}
