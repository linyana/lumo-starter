import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { useFormContext } from '@/components/ui/form/form/instance';
import type { FormInstance } from '@/components/ui/form/form/types';
import { fieldRequired, fieldRule } from '@/lib/form';
import { cn } from '@/lib/utils';
import {
	FieldDescription,
	FieldError,
	FieldHint,
	FieldLabel,
	FieldRoot,
	useFormRevision,
} from './parts';
import type { FieldProps } from './types';
import { mergeWiring, useFieldWiring } from './wiring';

export type { FieldProps } from '@/components/ui/form/field/types';
export type { FieldWiring } from '@/components/ui/form/field/wiring';

const valueOf = (change: unknown): unknown => {
	const target = (change as { target?: { value?: unknown } } | null | undefined)?.target;
	return target === undefined || target === null ? change : target.value;
};

type ChangeHandler = (...args: unknown[]) => void;

const handlersOf = (values: unknown[]): ChangeHandler[] =>
	values.filter((value): value is ChangeHandler => typeof value === 'function');

const wire = ({
	form,
	name,
	children,
	wiring,
}: {
	form: FormInstance;
	name: string;
	children: ReactNode;
	wiring: Record<string, unknown>;
}): ReactNode => {
	if (!isValidElement(children)) return children;

	const child = children as ReactElement<Record<string, unknown>>;
	const merged = mergeWiring({ wiring, own: child.props });
	const changes = handlersOf([wiring.onChange, child.props.onChange]);
	const value = form.get(name);

	return cloneElement(child, {
		...(value === undefined ? {} : { defaultValue: value }),
		...merged,
		onChange: (...args: unknown[]) => {
			form.set({ name, value: valueOf(args[0]) });
			for (const change of changes) change(...args);
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
	const wiring = useFieldWiring(name);

	return <Fragment key={revision}>{wire({ form, name, children, wiring })}</Fragment>;
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
			{...props}
			name={name}
			validate={
				named && schema !== undefined
					? (value: unknown) => fieldRule({ schema, name })(value ?? form.get(name), form.values())
					: undefined
			}
			className={cn(className, classNames?.root)}
		>
			{(label !== undefined || description !== undefined) && (
				<div className="flex items-center gap-1">
					{label !== undefined && (
						<FieldLabel required={mandatory} className={classNames?.label}>
							{label}
						</FieldLabel>
					)}
					{description !== undefined && (
						<FieldHint contentClassName={classNames?.description}>{description}</FieldHint>
					)}
				</div>
			)}
			{named ? (
				<Wired form={form} name={name}>
					{children}
				</Wired>
			) : (
				children
			)}
			{description !== undefined && (
				<FieldDescription className="sr-only">{description}</FieldDescription>
			)}
			<FieldError className={classNames?.error}>{error}</FieldError>
		</FieldRoot>
	);
};
