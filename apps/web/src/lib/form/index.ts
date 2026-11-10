import type { ZodError } from 'zod';
import type { FormErrors } from '@/components/pro/form';

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

export const hasErrors = (errors: FormErrors): boolean => Object.keys(errors).length > 0;
