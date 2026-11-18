import { useFormContext as useBaseFormContext } from '@base-ui/react/internals/form-context';
import { useSyncExternalStore } from 'react';
import { useFormContext } from '@/components/form/form/instance';

/** No form around the field: nothing to hear, and nothing that could ever have been repeated. */
const NO_WATCHER = (): (() => void) => () => {};

/**
 * Whether the form around this field is holding a verdict for it. It is read off Base UI's own
 * context rather than kept a second time in this library, so the entry a control drops as it is
 * edited is dropped from here too — a copy of the `errors` prop would keep showing a sentence the
 * form had already withdrawn.
 */
export function useFormVerdict(name: string | undefined) {
	const { errors } = useBaseFormContext();
	if (name === undefined || !Object.hasOwn(errors, name)) return false;
	const verdict = errors[name];
	return Array.isArray(verdict) ? verdict.length > 0 : Boolean(verdict);
}

/**
 * Which counter of this field is followed — `revision` when it is told to start over, `nudge` when it
 * is told the same thing again. A field standing outside a form has neither and answers nothing, so
 * the same hook serves both without a branch at the call site.
 */
const useFormCount = ({
	name,
	of,
}: {
	name: string | undefined;
	of: 'revision' | 'nudge';
}): number => {
	const form = useFormContext()?.form;
	const count = (): number => (name === undefined || form === undefined ? 0 : form[of](name));

	return useSyncExternalStore(form?.subscribe ?? NO_WATCHER, count, count);
};

/** How many times this field has been told to start over — the key its control is drawn under. */
export const useFormRevision = (name: string | undefined): number =>
	useFormCount({ name, of: 'revision' });

/** How many times this field has been told the same thing again. */
export const useFormNudge = (name: string | undefined): number =>
	useFormCount({ name, of: 'nudge' });
