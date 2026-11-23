import { useFormContext as useBaseFormContext } from '@base-ui/react/internals/form-context';
import { useSyncExternalStore } from 'react';
import { useFormContext } from '@/components/form/form/instance';

const NO_WATCHER = (): (() => void) => () => {};

export function useFormVerdict(name: string | undefined) {
	const { errors } = useBaseFormContext();
	if (name === undefined || !Object.hasOwn(errors, name)) return false;
	const verdict = errors[name];
	return Array.isArray(verdict) ? verdict.length > 0 : Boolean(verdict);
}

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

export const useFormRevision = (name: string | undefined): number =>
	useFormCount({ name, of: 'revision' });

export const useFormNudge = (name: string | undefined): number =>
	useFormCount({ name, of: 'nudge' });
