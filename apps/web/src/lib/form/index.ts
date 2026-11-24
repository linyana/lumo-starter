import type { ZodError, ZodType } from 'zod';
import type { FormErrors } from '@/components/ui/form/form';

type Values = Record<string, unknown>;

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

export const prune = (values: Values): Values =>
	Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
	);

export const sameValues = ({ left, right }: { left: Values; right: Values }): boolean => {
	const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

	for (const key of keys) {
		const one = left[key];
		const other = right[key];

		if (Array.isArray(one) && Array.isArray(other)) {
			if (one.length !== other.length || !one.every((item) => other.includes(item))) return false;
		} else if (one !== other) {
			return false;
		}
	}

	return true;
};

const pathOf = (issue: { path: PropertyKey[] }): string => issue.path.map(String).join('.');

export type FieldCheck = { ok: true; value: unknown } | { ok: false; messages: string[] };

export const checkField = ({
	schema,
	name,
	value,
	values,
}: {
	schema: ZodType;
	name: string;
	value: unknown;
	values: Values;
}): FieldCheck => {
	const field = (schema as { shape?: Record<string, ZodType> }).shape?.[name];
	const parsed =
		field === undefined ? schema.safeParse({ ...values, [name]: value }) : field.safeParse(value);

	if (parsed.success) {
		const data = parsed.data as Values;
		return { ok: true, value: field === undefined ? data[name] : parsed.data };
	}

	return {
		ok: false,
		messages: parsed.error.issues
			.filter((issue) => issue.path.length === 0 || pathOf(issue) === name)
			.map((issue) => issue.message),
	};
};

/**
 * The subset of `values` that differs from `saved` and passes validation,
 * already normalised by each field's schema.
 */
export const patchOf = <TValues extends Values>({
	schema,
	values,
	saved,
}: {
	schema: ZodType;
	values: Values;
	saved: Partial<TValues>;
}): Partial<TValues> => {
	const previous: Values = saved;
	const patch: Values = {};

	for (const [name, value] of Object.entries(values)) {
		const checked = checkField({ schema, name, value, values });
		if (!checked.ok || checked.value === previous[name]) continue;

		patch[name] = checked.value;
	}

	return patch as Partial<TValues>;
};

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

export const fieldRequired = ({ schema, name }: { schema: ZodType; name: string }): boolean => {
	const field = (schema as { shape?: Record<string, ZodType> }).shape?.[name];
	return field !== undefined && !field.safeParse(undefined).success;
};

export const omit = ({ values, name }: { values: Values; name: string }): Values =>
	Object.fromEntries(Object.entries(values).filter(([key]) => key !== name));

export const firstIssueName = (error: ZodError): string | undefined =>
	error.issues.map(pathOf).find((path) => path !== '' && path !== '(root)');
