import type { ZodError, ZodType } from 'zod';
import type { FormErrors } from '@/components/ui/form';

/** What the fields of one form hold, by name. Spelled here so this module depends on no layer. */
type Values = Record<string, unknown>;

/**
 * Converts zod issues into the `errors` object Base UI's Form hands back to
 * each `Field`. Keys are dot paths, which is also what a `Field`
 * `name` uses — so a nested field's message lands on the right row.
 *
 * The shared schemas state their own sentences, so the form and the API say the
 * same thing without either side translating anything.
 */
export const toFormErrors = (error: ZodError): FormErrors => {
	const errors: FormErrors = {};

	for (const issue of error.issues) {
		const key = issue.path.map(String).join('.') || '(root)';
		const message = issue.message;
		const current = errors[key];

		if (current === undefined) errors[key] = message;
		else if (Array.isArray(current)) current.push(message);
		else errors[key] = [current, message];
	}

	return errors;
};

/**
 * Blank is not a value: a field the reader emptied is a field that is not answered, so the wire
 * carries no parameter for it and a rule that allows absence passes. `false` and `[]` stay — they are
 * answers, and an empty list of roles is exactly what a "at least one" rule has to see.
 */
export const prune = (values: Values): Values =>
	Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
	);

const pathOf = (issue: { path: PropertyKey[] }): string => issue.path.map(String).join('.');

/**
 * The rule one field is held to, cut out of the object's schema by handing the whole object to it —
 * so a rule that only makes sense across two fields ("passwords do not match") still arrives under
 * the field it names. A field is told about its own issues and no one else's; an issue about the
 * object as a whole belongs to no field and is left to `submit`.
 *
 * A blank answer is read a second time with the key dropped, so an optional field left empty passes
 * while a required one keeps its own sentence.
 */
export const fieldRule =
	({ schema, name }: { schema: ZodType; name: string }) =>
	(value: unknown, values: Values): string[] | null => {
		const current = { ...values, [name]: value };

		if (
			(value === '' || value === undefined) &&
			schema.safeParse(omit({ values: current, name })).success
		) {
			return null;
		}

		const result = schema.safeParse(current);
		if (result.success) return null;

		const messages = result.error.issues
			.filter((issue) => pathOf(issue) === name)
			.map((issue) => issue.message);

		return messages.length > 0 ? messages : null;
	};

const omit = ({ values, name }: { values: Values; name: string }): Values =>
	Object.fromEntries(Object.entries(values).filter(([key]) => key !== name));

/**
 * The name of the field a set of verdicts is about first, so a failed submit can put the cursor on
 * it. Dot paths are the field names; a verdict about the object as a whole names no field.
 */
export const firstIssueName = (error: ZodError): string | undefined =>
	error.issues.map(pathOf).find((path) => path !== '' && path !== '(root)');
