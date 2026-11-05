# field

> One control, its name, and the line beneath it: label, description and error joined to whatever control is inside, by Base UI's own wiring. Pairs with Input, and every later control slots into it.

## install

```bash
bunx shadcn@latest add @lumo/field
```

- payload: `/r/field.json`
- docs page: `/field`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `field.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/field.tsx

```tsx
import { Field as BaseField } from '@base-ui/react/field';
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context';
import { useFormContext } from '@base-ui/react/internals/form-context';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A control is labelled and validated by the field around it, so this part owns no look: whatever
 * element it renders — Base UI's Input, a native `<textarea>`, a Checkbox — keeps its own.
 */
export const Control = BaseField.Control;

export type DescriptionProps = Omit<ComponentProps<typeof BaseField.Description>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseField.Description
			data-slot="field-description"
			className={cn('text-sm text-muted-foreground data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}

export type ErrorProps = Omit<ComponentProps<typeof BaseField.Error>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
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

/**
 * Renders nothing while the field is valid, and the field's own message — the browser's, or the
 * string `validate` returned — when it is not. Children replace that message.
 *
 * A verdict the form holds for this field wins the line, over `match` and over children alike: it is
 * the newer of the two facts, being about the value that was actually submitted. Base UI gives a
 * matched `Error` its own constraint and nothing else, which would bury a sentence a server sent
 * about the same field — the one case where a written message and a server's have to be told apart.
 */
export function Error({ match, className, children, ...props }: ErrorProps) {
	const { name } = useFieldRootContext(false);
	const fromForm = useFormVerdict(name) && (typeof match === 'string' || children !== undefined);

	return (
		<BaseField.Error
			data-slot="field-error"
			className={cn('text-sm text-destructive', className)}
			// `match` is what decides which line this is; `true` is Base UI's "show it, the reason is
			// elsewhere" — here, the form's own sentence standing in for ours.
			match={fromForm ? true : match}
			{...props}
		>
			{fromForm ? null : children}
		</BaseField.Error>
	);
}

export type ItemProps = Omit<ComponentProps<typeof BaseField.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * One entry in a group that shares a field: the label and the sentence beside it, beside the
 * control. `items-start` is the default because a description under a label is usual here, and a
 * checkbox that centred itself against a paragraph would drift off its own first line.
 */
export function Item({ className, ...props }: ItemProps) {
	return (
		<BaseField.Item
			data-slot="field-item"
			className={cn('flex items-start gap-2', className)}
			{...props}
		/>
	);
}

export type LabelProps = Omit<ComponentProps<typeof BaseField.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

export function Label({ className, ...props }: LabelProps) {
	return (
		<BaseField.Label
			data-slot="field-label"
			className={cn('text-sm font-medium select-none data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}

export type RootProps = Omit<ComponentProps<typeof BaseField.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The state: the name the value is submitted under, the validation, and the disabled flag. */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseField.Root
			data-slot="field"
			className={cn('flex flex-col gap-1.5', className)}
			{...props}
		/>
	);
}

/** The field's validity, handed to a function — for a message the `Error` cannot type itself. */
export const Validity = BaseField.Validity;

/** One control, its name, and the line under it that explains or complains. */
export const Field = { Root, Label, Control, Description, Error, Item, Validity };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Field/demos/basic.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function Basic() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<Field.Root>
				<Field.Label>email</Field.Label>
				<Input type="email" autoComplete="email" placeholder="you@example.com" />
				<Field.Description>only when something breaks.</Field.Description>
			</Field.Root>
			<Field.Root>
				<Field.Label>workspace</Field.Label>
				<Input defaultValue="lumo" />
			</Field.Root>
		</div>
	);
}
```

### src/pages/Field/demos/native.tsx

```tsx
import { Field } from '@/components/ui/field';

/**
 * `Control` takes whatever element it is given and puts the wiring on it — id, describedby,
 * aria-invalid — so a control the library does not ship still gets a name and an error.
 */
export default function Native() {
	return (
		<Field.Root
			className="w-full max-w-sm"
			validationMode="onBlur"
			validate={(value) =>
				String(value).trim() ? null : 'say one thing about this release.'
			}
		>
			<Field.Label>release notes</Field.Label>
			<Field.Control
				render={<textarea rows={3} />}
				placeholder="what changed"
				className="resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive"
			/>
			<Field.Error />
		</Field.Root>
	);
}
```

### src/pages/Field/demos/validation.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/** A string, or nothing at all: Base UI accepts either as the verdict. */
const asEmail = (value: unknown) =>
	/^[^@\s]+@[^@\s]+$/.test(String(value)) ? null : 'that is not an address';

const asSlug = (value: unknown) =>
	/^[a-z0-9-]+$/.test(String(value)) ? null : 'lowercase letters, digits and dashes';

/** The prefilled values are both wrong, so the error is one Tab away from appearing. The inputs carry
 *  no `type="email"` on purpose: a native constraint is reported before `validate` is asked, and this
 *  demo is about the validator. */
export default function Validation() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<Field.Root validationMode="onBlur" validate={asEmail}>
				<Field.Label>email</Field.Label>
				<Input defaultValue="you" />
				<Field.Error />
			</Field.Root>
			<Field.Root validationMode="onBlur" validate={asSlug}>
				<Field.Label>workspace</Field.Label>
				<Input defaultValue="lumo ui" />
				<Field.Error />
			</Field.Root>
		</div>
	);
}
```
