import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { LumoField } from '@/components/ui/field';
import { fieldRule } from '@/lib/form';
import { cn } from '@/lib/utils';
import { useFormContext } from '../form/instance';
import type { FormInstance } from '../form/types';
import type { FieldProps } from './types';

export type { FieldProps } from './types';

/** What a control reports: a native event's value, or the value itself from a control that says one. */
const valueOf = (change: unknown): unknown => {
	const target = (change as { target?: { value?: unknown } } | null | undefined)?.target;
	return target === undefined || target === null ? change : target.value;
};

/**
 * Hands the control its value and takes its changes back — the pair every control here speaks,
 * `value` and `onChange`, whichever control it is. A control the caller already gave a value keeps
 * it: the form only lends what it holds.
 */
const wire = ({
	form,
	name,
	children,
}: {
	form: FormInstance;
	name: string;
	children: ReactNode;
}): ReactNode => {
	if (!isValidElement(children)) return children;

	const child = children as ReactElement<Record<string, unknown>>;
	const own = child.props.onChange as ((...args: unknown[]) => void) | undefined;
	const value = form.get(name);

	return cloneElement(child, {
		...(value === undefined ? {} : { defaultValue: value }),
		onChange: (...args: unknown[]) => {
			own?.(...args);
			form.set({ name, value: valueOf(args[0]) });
		},
	});
};

/**
 * One control, its name, and the line beneath it. The control inside is labelled, and held to the
 * rules its name has in the form's schema, so nothing is wired between the two by hand.
 *
 * The value reaches the form through the control's `onChange` and comes back as its `defaultValue`:
 * a control owns its own value, so a form never fights it for the caret, and a reset redraws the
 * fields rather than reassigning them. Outside a `<Form>` a field is a label and a line — there is
 * no name to hold it to, and nothing to report to.
 */
export const Field = ({
	name,
	label,
	description,
	error,
	children,
	className,
	classNames,
	...props
}: FieldProps) => {
	const context = useFormContext();
	const form = context?.form;
	const schema = context?.schema;
	const named = form !== undefined && name !== undefined;

	return (
		<LumoField.Root
			name={name}
			validate={
				named && schema !== undefined
					? (value: unknown) => fieldRule({ schema, name })(value ?? form.get(name), form.values())
					: undefined
			}
			className={cn(className, classNames?.root)}
			{...props}
		>
			{label !== undefined && (
				<LumoField.Label className={classNames?.label}>{label}</LumoField.Label>
			)}
			{named ? wire({ form, name, children }) : children}
			{description !== undefined && (
				<LumoField.Description className={classNames?.description}>
					{description}
				</LumoField.Description>
			)}
			<LumoField.Error className={classNames?.error}>{error}</LumoField.Error>
		</LumoField.Root>
	);
};
