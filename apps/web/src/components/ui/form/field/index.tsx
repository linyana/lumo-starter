import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { useFormContext } from '@/components/ui/form/form/instance';
import type { FormInstance } from '@/components/ui/form/form/types';
import { fieldRequired, fieldRule } from '@/lib/form';
import { cn } from '@/lib/utils';
import { FieldDescription, FieldError, FieldLabel, FieldRoot, useFormRevision } from './parts';
import type { FieldProps } from './types';

export type { FieldProps } from '@/components/ui/form/field/types';

const valueOf = (change: unknown): unknown => {
	const target = (change as { target?: { value?: unknown } } | null | undefined)?.target;
	return target === undefined || target === null ? change : target.value;
};

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

const Wired = ({
	form,
	name,
	children,
}: {
	form: FormInstance;
	name: string;
	children: ReactNode;
}): ReactNode => {
	const revision = useFormRevision(name);

	return <Fragment key={revision}>{wire({ form, name, children })}</Fragment>;
};

export const Field = ({
	name,
	label,
	required,
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
	const mandatory = required ?? (named && schema !== undefined && fieldRequired({ schema, name }));

	return (
		<FieldRoot
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
				<FieldLabel required={mandatory} className={classNames?.label}>
					{label}
				</FieldLabel>
			)}
			{named ? (
				<Wired form={form} name={name}>
					{children}
				</Wired>
			) : (
				children
			)}
			{description !== undefined && (
				<FieldDescription className={classNames?.description}>{description}</FieldDescription>
			)}
			<FieldError className={classNames?.error}>{error}</FieldError>
		</FieldRoot>
	);
};
