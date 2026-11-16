import { useFormContext } from '@base-ui/react/internals/form-context';

export /**
 * Whether the form around this field is holding a verdict for it. It is read off Base UI's own
 * context rather than kept a second time in this library, so the entry a control drops as it is
 * edited is dropped from here too — a copy of the `errors` prop would keep showing a sentence the
 * form had already withdrawn.
 */
function useFormVerdict(name: string | undefined) {
	const { errors } = useFormContext();
	if (name === undefined || !Object.hasOwn(errors, name)) return false;
	const verdict = errors[name];
	return Array.isArray(verdict) ? verdict.length > 0 : Boolean(verdict);
}
